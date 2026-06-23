import type {
  AnalysisProvider,
  PromptVersion,
  ReviewStatus,
  SignalAnalysis
} from '@/types/analysis';
import type { SourceChannel } from '@/types/import';

export type ReportType =
  | '用户声音阶段分析'
  | '竞品问题机会分析'
  | '户外地图专项分析'
  | '版本迭代输入报告'
  | '周报摘要'
  | '月报摘要';

export type ReportTimeRange = 'all' | 'last7days' | 'last30days';

export interface ReportFilters {
  productNames: string[];
  modules: string[];
  impactLevels: string[];
  recommendedActions: string[];
  providers: Array<AnalysisProvider | 'all'>;
  timeRange: ReportTimeRange;
}

export interface ApprovedAnalysisRecord {
  id: string;
  rawSignalId: string;
  productName: string;
  sourceChannel: SourceChannel;
  sourceLabel: string;
  rawContent: string;
  reviewedAnalysis: SignalAnalysis;
  reviewStatus: Extract<ReviewStatus, 'approved' | 'modified'>;
  provider: AnalysisProvider;
  modelName?: string;
  promptVersion: PromptVersion;
  createdAt: string;
  reviewedAt?: string;
}

export interface GenerateReportInput {
  title: string;
  reportType: ReportType;
  selectedRecords: ApprovedAnalysisRecord[];
  filters?: ReportFilters;
  note?: string;
  generatedAt: string;
}

export interface GeneratedReport {
  id: string;
  title: string;
  reportType: ReportType;
  markdown: string;
  selectedRecordIds: string[];
  generatedAt: string;
}

export interface MetricDatum {
  name: string;
  count: number;
}

export interface HighImpactRow {
  id: string;
  productName: string;
  module: string;
  coreConclusion: string;
  impactLevel: string;
  recommendedAction: string;
  reviewedAt?: string;
}

export interface SummaryRow {
  id: string;
  productName: string;
  sourceLabel: string;
  module: string;
  signalType: string;
  coreChangeOrProblem: string;
  productInsight: string;
}

export interface OpportunityRow {
  id: string;
  module: string;
  painPointOrChange: string;
  productOpportunity: string;
  recommendedAction: string;
}

export interface ReportMetrics {
  moduleDistribution: MetricDatum[];
  sourceDistribution: MetricDatum[];
  signalTypeDistribution: MetricDatum[];
  impactDistribution: MetricDatum[];
  productDistribution: MetricDatum[];
  actionDistribution: MetricDatum[];
  highImpactRows: HighImpactRow[];
  summaryRows: SummaryRow[];
  opportunityRows: OpportunityRow[];
}

export const REPORT_TYPES: ReportType[] = [
  '用户声音阶段分析',
  '竞品问题机会分析',
  '户外地图专项分析',
  '版本迭代输入报告',
  '周报摘要',
  '月报摘要'
];

export const DEFAULT_REPORT_TITLE = '地图产品竞品与用户声音分析报告';
