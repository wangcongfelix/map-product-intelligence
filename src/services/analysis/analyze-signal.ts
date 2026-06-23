import type { AnalysisProvider, PromptVersion, SignalAnalysis } from '@/types/analysis';

export interface RemoteAnalysisRecordPayload {
  rawSignalId: string;
  analysis: SignalAnalysis;
  provider: AnalysisProvider;
  modelName: string;
  promptVersion: PromptVersion;
  latencyMs?: number;
}

export interface RemoteAnalysisErrorPayload {
  rawSignalId: string;
  message: string;
}

export interface DeepSeekBatchResponse {
  ok: boolean;
  message?: string;
  records?: RemoteAnalysisRecordPayload[];
  errors?: RemoteAnalysisErrorPayload[];
}
