'use client';

import * as React from 'react';
import { SOURCE_CHANNEL_LABELS } from '@/lib/import/import-options';
import { mockAnalyzeSignal } from '@/services/analysis/mock-analyze-signal';
import { generateReport as createGeneratedReport } from '@/services/reports/generate-report';
import type {
  DeepSeekBatchResponse,
  RemoteAnalysisErrorPayload
} from '@/services/analysis/analyze-signal';
import type { AnalysisProvider, AnalysisRecord, SignalAnalysis } from '@/types/analysis';
import type { ImportBatch, ImportDraft, RawSignal } from '@/types/import';
import type { ApprovedAnalysisRecord, GeneratedReport, GenerateReportInput } from '@/types/report';

export const IMPORT_STORE_KEY = 'map-product-intelligence-import-store';

interface ImportStoreState {
  importBatches: ImportBatch[];
  rawSignals: RawSignal[];
  analysisRecords: AnalysisRecord[];
  currentDraft: ImportDraft;
  reportDrafts: GeneratedReport[];
  currentReportDraft?: GeneratedReport;
  currentReportSelection: string[];
}

interface ImportStoreActions {
  addImportBatch: (batch: ImportBatch, signals: RawSignal[]) => void;
  deleteRawSignal: (id: string) => void;
  resetCurrentDraft: () => void;
  setCurrentDraft: (draft: Partial<ImportDraft>) => void;
  clearSyntheticData: () => void;
  analyzePendingSignals: (provider?: AnalysisProvider) => Promise<AnalysisRunResult>;
  analyzePendingSignalsWithMock: () => AnalysisRunResult;
  analyzePendingSignalsWithDeepSeek: () => Promise<AnalysisRunResult>;
  approveAnalysis: (analysisRecordId: string) => void;
  updateAndApproveAnalysis: (analysisRecordId: string, updatedAnalysis: SignalAnalysis) => void;
  ignoreAnalysis: (analysisRecordId: string) => void;
  getPendingAnalysisSignals: () => RawSignal[];
  getPendingReviewRecords: () => AnalysisRecord[];
  getApprovedRecords: () => AnalysisRecord[];
  generateReport: (input: GenerateReportInput) => GeneratedReport;
  setCurrentReportDraft: (report: GeneratedReport) => void;
  clearCurrentReportDraft: () => void;
  deleteReportDraft: (reportId: string) => void;
  getReportDrafts: () => GeneratedReport[];
  setCurrentReportSelection: (ids: string[]) => void;
  clearCurrentReportSelection: () => void;
  getApprovedRecordsForReports: () => ApprovedAnalysisRecord[];
}

type ImportStoreSnapshot = ImportStoreState & ImportStoreActions;

export interface AnalysisRunResult {
  createdCount: number;
  failedCount: number;
  errors: RemoteAnalysisErrorPayload[];
  message?: string;
}

export const DEFAULT_IMPORT_DRAFT: ImportDraft = {
  productGroup: '',
  productName: '',
  customProductName: '',
  customProductCategory: 'general_map',
  sourceChannel: '',
  customSourceName: '',
  importMode: 'single',
  rawInput: '',
  isSynthetic: false
};

const defaultState: ImportStoreState = {
  importBatches: [],
  rawSignals: [],
  analysisRecords: [],
  currentDraft: DEFAULT_IMPORT_DRAFT,
  reportDrafts: [],
  currentReportDraft: undefined,
  currentReportSelection: []
};

let state: ImportStoreState = defaultState;
let hydrated = false;
const listeners = new Set<() => void>();

function createId(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}-${random}`;
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readPersistedState(): ImportStoreState {
  if (!canUseStorage()) return defaultState;

  try {
    const raw = window.localStorage.getItem(IMPORT_STORE_KEY);
    if (!raw) return defaultState;

    const parsed = JSON.parse(raw) as Partial<ImportStoreState>;
    return {
      importBatches: Array.isArray(parsed.importBatches) ? parsed.importBatches : [],
      rawSignals: Array.isArray(parsed.rawSignals) ? parsed.rawSignals : [],
      analysisRecords: Array.isArray(parsed.analysisRecords) ? parsed.analysisRecords : [],
      currentDraft: {
        ...DEFAULT_IMPORT_DRAFT,
        ...(parsed.currentDraft ?? {})
      },
      reportDrafts: Array.isArray(parsed.reportDrafts) ? parsed.reportDrafts : [],
      currentReportDraft: parsed.currentReportDraft,
      currentReportSelection: Array.isArray(parsed.currentReportSelection)
        ? parsed.currentReportSelection
        : []
    };
  } catch {
    return defaultState;
  }
}

function persistState(): void {
  if (!canUseStorage()) return;

  window.localStorage.setItem(
    IMPORT_STORE_KEY,
    JSON.stringify({
      importBatches: state.importBatches,
      rawSignals: state.rawSignals,
      analysisRecords: state.analysisRecords,
      currentDraft: state.currentDraft,
      reportDrafts: state.reportDrafts,
      currentReportDraft: state.currentReportDraft,
      currentReportSelection: state.currentReportSelection
    })
  );
}

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

function updateState(updater: (current: ImportStoreState) => ImportStoreState): void {
  state = updater(state);
  persistState();
  emitChange();
}

function hydrateState(): void {
  if (hydrated) return;
  hydrated = true;
  state = readPersistedState();
  emitChange();
}

function getModifiedFields(
  originalAnalysis: SignalAnalysis,
  updatedAnalysis: SignalAnalysis
): Array<keyof SignalAnalysis> {
  const fields: Array<keyof SignalAnalysis> = [
    'module',
    'signalType',
    'coreConclusion',
    'userScenario',
    'impactLevel',
    'evidenceQuote',
    'productInsight',
    'recommendedAction',
    'confidence'
  ];

  return fields.filter((field) => originalAnalysis[field] !== updatedAnalysis[field]);
}

function toApprovedAnalysisRecord(
  record: AnalysisRecord,
  signal: RawSignal
): ApprovedAnalysisRecord | null {
  if (!record.reviewedAnalysis) return null;
  if (record.reviewStatus !== 'approved' && record.reviewStatus !== 'modified') return null;

  return {
    id: record.id,
    rawSignalId: record.rawSignalId,
    productName: signal.productName,
    sourceChannel: signal.sourceChannel,
    sourceLabel: signal.customSourceName ?? SOURCE_CHANNEL_LABELS[signal.sourceChannel],
    rawContent: signal.rawContent,
    reviewedAnalysis: record.reviewedAnalysis,
    reviewStatus: record.reviewStatus,
    provider: record.provider ?? (record.isMock ? 'mock' : 'deepseek'),
    modelName: record.modelName,
    promptVersion: record.promptVersion,
    createdAt: record.createdAt,
    reviewedAt: record.reviewedAt
  };
}

const actions: ImportStoreActions = {
  addImportBatch(batch, signals) {
    updateState((current) => ({
      ...current,
      importBatches: [batch, ...current.importBatches],
      rawSignals: [...signals, ...current.rawSignals]
    }));
  },
  deleteRawSignal(id) {
    updateState((current) => ({
      ...current,
      rawSignals: current.rawSignals.filter((signal) => signal.id !== id)
    }));
  },
  resetCurrentDraft() {
    updateState((current) => ({
      ...current,
      currentDraft: DEFAULT_IMPORT_DRAFT
    }));
  },
  setCurrentDraft(draft) {
    updateState((current) => ({
      ...current,
      currentDraft: {
        ...current.currentDraft,
        ...draft
      }
    }));
  },
  clearSyntheticData() {
    updateState((current) => ({
      ...current,
      importBatches: current.importBatches.filter((batch) =>
        current.rawSignals.some((signal) => signal.batchId === batch.id && !signal.isSynthetic)
      ),
      rawSignals: current.rawSignals.filter((signal) => !signal.isSynthetic),
      analysisRecords: current.analysisRecords.filter((record) =>
        current.rawSignals.some((signal) => signal.id === record.rawSignalId && !signal.isSynthetic)
      )
    }));
  },
  async analyzePendingSignals(provider = 'deepseek') {
    if (provider === 'deepseek') {
      return actions.analyzePendingSignalsWithDeepSeek();
    }

    return actions.analyzePendingSignalsWithMock();
  },
  analyzePendingSignalsWithMock() {
    let createdCount = 0;

    updateState((current) => {
      const existingRawSignalIds = new Set(
        current.analysisRecords.map((record) => record.rawSignalId)
      );
      const pendingSignals = current.rawSignals.filter(
        (signal) =>
          (signal.status === 'pending_analysis' || signal.status === 'analysis_failed') &&
          !existingRawSignalIds.has(signal.id)
      );

      if (pendingSignals.length === 0) {
        return current;
      }

      const createdAt = new Date().toISOString();
      const newRecords = pendingSignals.map<AnalysisRecord>((signal) => ({
        id: createId('analysis'),
        rawSignalId: signal.id,
        aiAnalysis: mockAnalyzeSignal(signal),
        reviewStatus: 'pending_review',
        isMock: true,
        provider: 'mock',
        modelName: 'mock-v1',
        promptVersion: 'mock-v1',
        createdAt
      }));
      const pendingSignalIds = new Set(pendingSignals.map((signal) => signal.id));
      createdCount = newRecords.length;

      return {
        ...current,
        rawSignals: current.rawSignals.map((signal) =>
          pendingSignalIds.has(signal.id) ? { ...signal, status: 'pending_review' } : signal
        ),
        analysisRecords: [...newRecords, ...current.analysisRecords]
      };
    });

    return {
      createdCount,
      failedCount: 0,
      errors: []
    };
  },
  async analyzePendingSignalsWithDeepSeek() {
    const existingRawSignalIds = new Set(state.analysisRecords.map((record) => record.rawSignalId));
    const pendingSignals = state.rawSignals.filter(
      (signal) =>
        (signal.status === 'pending_analysis' || signal.status === 'analysis_failed') &&
        !existingRawSignalIds.has(signal.id)
    );

    if (pendingSignals.length === 0) {
      return {
        createdCount: 0,
        failedCount: 0,
        errors: []
      };
    }

    let responsePayload: DeepSeekBatchResponse;

    try {
      const response = await fetch('/api/analysis/deepseek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rawSignals: pendingSignals
        })
      });

      responsePayload = (await response.json()) as DeepSeekBatchResponse;

      if (!response.ok || !responsePayload.ok) {
        return {
          createdCount: 0,
          failedCount: pendingSignals.length,
          errors: [],
          message: responsePayload.message ?? 'DeepSeek 分析失败。'
        };
      }
    } catch {
      return {
        createdCount: 0,
        failedCount: pendingSignals.length,
        errors: [],
        message: '无法连接 DeepSeek 分析服务。'
      };
    }

    const records = responsePayload.records ?? [];
    const errors = responsePayload.errors ?? [];

    updateState((current) => {
      const currentExistingRawSignalIds = new Set(
        current.analysisRecords.map((record) => record.rawSignalId)
      );
      const successSignalIds = new Set(
        records
          .filter((record) => !currentExistingRawSignalIds.has(record.rawSignalId))
          .map((record) => record.rawSignalId)
      );
      const failedSignalIds = new Set(errors.map((error) => error.rawSignalId));
      const createdAt = new Date().toISOString();
      const newRecords = records
        .filter((record) => !currentExistingRawSignalIds.has(record.rawSignalId))
        .map<AnalysisRecord>((record) => ({
          id: createId('analysis'),
          rawSignalId: record.rawSignalId,
          aiAnalysis: record.analysis,
          reviewStatus: 'pending_review',
          isMock: false,
          provider: 'deepseek',
          modelName: record.modelName,
          promptVersion: record.promptVersion,
          createdAt
        }));

      return {
        ...current,
        rawSignals: current.rawSignals.map((signal) => {
          if (successSignalIds.has(signal.id)) return { ...signal, status: 'pending_review' };
          if (failedSignalIds.has(signal.id)) return { ...signal, status: 'analysis_failed' };
          return signal;
        }),
        analysisRecords: [...newRecords, ...current.analysisRecords]
      };
    });

    return {
      createdCount: records.length,
      failedCount: errors.length,
      errors
    };
  },
  approveAnalysis(analysisRecordId) {
    const reviewedAt = new Date().toISOString();

    updateState((current) => {
      const targetRecord = current.analysisRecords.find((record) => record.id === analysisRecordId);
      if (!targetRecord) return current;

      return {
        ...current,
        rawSignals: current.rawSignals.map((signal) =>
          signal.id === targetRecord.rawSignalId ? { ...signal, status: 'approved' } : signal
        ),
        analysisRecords: current.analysisRecords.map((record) =>
          record.id === analysisRecordId
            ? {
                ...record,
                reviewedAnalysis: record.aiAnalysis,
                reviewStatus: 'approved',
                reviewedAt,
                modifiedFields: []
              }
            : record
        )
      };
    });
  },
  updateAndApproveAnalysis(analysisRecordId, updatedAnalysis) {
    const reviewedAt = new Date().toISOString();

    updateState((current) => {
      const targetRecord = current.analysisRecords.find((record) => record.id === analysisRecordId);
      if (!targetRecord) return current;

      return {
        ...current,
        rawSignals: current.rawSignals.map((signal) =>
          signal.id === targetRecord.rawSignalId ? { ...signal, status: 'approved' } : signal
        ),
        analysisRecords: current.analysisRecords.map((record) =>
          record.id === analysisRecordId
            ? {
                ...record,
                reviewedAnalysis: {
                  ...updatedAnalysis,
                  confidence: Math.min(1, Math.max(0, updatedAnalysis.confidence))
                },
                reviewStatus: 'modified',
                reviewedAt,
                modifiedFields: getModifiedFields(record.aiAnalysis, updatedAnalysis)
              }
            : record
        )
      };
    });
  },
  ignoreAnalysis(analysisRecordId) {
    const reviewedAt = new Date().toISOString();

    updateState((current) => {
      const targetRecord = current.analysisRecords.find((record) => record.id === analysisRecordId);
      if (!targetRecord) return current;

      return {
        ...current,
        rawSignals: current.rawSignals.map((signal) =>
          signal.id === targetRecord.rawSignalId ? { ...signal, status: 'ignored' } : signal
        ),
        analysisRecords: current.analysisRecords.map((record) =>
          record.id === analysisRecordId
            ? {
                ...record,
                reviewStatus: 'ignored',
                reviewedAt
              }
            : record
        )
      };
    });
  },
  getPendingAnalysisSignals() {
    return state.rawSignals.filter(
      (signal) => signal.status === 'pending_analysis' || signal.status === 'analysis_failed'
    );
  },
  getPendingReviewRecords() {
    return state.analysisRecords.filter((record) => record.reviewStatus === 'pending_review');
  },
  getApprovedRecords() {
    return state.analysisRecords.filter(
      (record) =>
        (record.reviewStatus === 'approved' || record.reviewStatus === 'modified') &&
        Boolean(record.reviewedAnalysis)
    );
  },
  generateReport(input) {
    const report = createGeneratedReport(input);

    updateState((current) => ({
      ...current,
      currentReportDraft: report,
      reportDrafts: [
        report,
        ...current.reportDrafts.filter((draft) => draft.id !== report.id)
      ].slice(0, 12),
      currentReportSelection: report.selectedRecordIds
    }));

    return report;
  },
  setCurrentReportDraft(report) {
    updateState((current) => ({
      ...current,
      currentReportDraft: report,
      reportDrafts: [
        report,
        ...current.reportDrafts.filter((draft) => draft.id !== report.id)
      ].slice(0, 12)
    }));
  },
  clearCurrentReportDraft() {
    updateState((current) => ({
      ...current,
      currentReportDraft: undefined
    }));
  },
  deleteReportDraft(reportId) {
    updateState((current) => ({
      ...current,
      reportDrafts: current.reportDrafts.filter((draft) => draft.id !== reportId),
      currentReportDraft:
        current.currentReportDraft?.id === reportId ? undefined : current.currentReportDraft
    }));
  },
  getReportDrafts() {
    return state.reportDrafts;
  },
  setCurrentReportSelection(ids) {
    updateState((current) => ({
      ...current,
      currentReportSelection: Array.from(new Set(ids))
    }));
  },
  clearCurrentReportSelection() {
    updateState((current) => ({
      ...current,
      currentReportSelection: []
    }));
  },
  getApprovedRecordsForReports() {
    return state.analysisRecords
      .map((record) => {
        const signal = state.rawSignals.find((rawSignal) => rawSignal.id === record.rawSignalId);
        if (!signal) return null;
        return toApprovedAnalysisRecord(record, signal);
      })
      .filter((record): record is ApprovedAnalysisRecord => Boolean(record));
  }
};

function getSnapshot(): ImportStoreSnapshot {
  return {
    ...state,
    ...actions
  };
}

export function useImportStore(): ImportStoreSnapshot {
  const [snapshot, setSnapshot] = React.useState<ImportStoreSnapshot>(() => getSnapshot());

  React.useEffect(() => {
    hydrateState();

    const listener = () => setSnapshot(getSnapshot());
    listeners.add(listener);
    listener();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return snapshot;
}
