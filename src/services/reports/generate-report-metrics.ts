import type {
  ApprovedAnalysisRecord,
  HighImpactRow,
  MetricDatum,
  OpportunityRow,
  ReportMetrics,
  SummaryRow
} from '@/types/report';

function increment(map: Map<string, number>, value: string | undefined): void {
  const key = value?.trim() || '未填写';
  map.set(key, (map.get(key) ?? 0) + 1);
}

function toSortedDistribution(map: Map<string, number>): MetricDatum[] {
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort(
      (left, right) => right.count - left.count || left.name.localeCompare(right.name, 'zh-CN')
    );
}

function distribution(
  records: ApprovedAnalysisRecord[],
  selector: (record: ApprovedAnalysisRecord) => string | undefined
): MetricDatum[] {
  const map = new Map<string, number>();
  records.forEach((record) => increment(map, selector(record)));
  return toSortedDistribution(map);
}

function toHighImpactRow(record: ApprovedAnalysisRecord): HighImpactRow {
  const analysis = record.reviewedAnalysis;
  return {
    id: record.id,
    productName: record.productName,
    module: analysis.module,
    coreConclusion: analysis.coreConclusion,
    impactLevel: analysis.impactLevel,
    recommendedAction: analysis.recommendedAction,
    reviewedAt: record.reviewedAt
  };
}

function toSummaryRow(record: ApprovedAnalysisRecord): SummaryRow {
  const analysis = record.reviewedAnalysis;
  return {
    id: record.id,
    productName: record.productName,
    sourceLabel: record.sourceLabel,
    module: analysis.module,
    signalType: analysis.signalType,
    coreChangeOrProblem: analysis.coreConclusion,
    productInsight: analysis.productInsight
  };
}

function toOpportunityRow(record: ApprovedAnalysisRecord): OpportunityRow {
  const analysis = record.reviewedAnalysis;
  return {
    id: record.id,
    module: analysis.module,
    painPointOrChange: analysis.coreConclusion,
    productOpportunity: analysis.productInsight,
    recommendedAction: analysis.recommendedAction
  };
}

export function generateReportMetrics(records: ApprovedAnalysisRecord[]): ReportMetrics {
  if (records.length === 0) {
    return {
      moduleDistribution: [],
      sourceDistribution: [],
      signalTypeDistribution: [],
      impactDistribution: [],
      productDistribution: [],
      actionDistribution: [],
      highImpactRows: [],
      summaryRows: [],
      opportunityRows: []
    };
  }

  return {
    moduleDistribution: distribution(records, (record) => record.reviewedAnalysis.module),
    sourceDistribution: distribution(records, (record) => record.sourceLabel),
    signalTypeDistribution: distribution(records, (record) => record.reviewedAnalysis.signalType),
    impactDistribution: distribution(records, (record) => record.reviewedAnalysis.impactLevel),
    productDistribution: distribution(records, (record) => record.productName),
    actionDistribution: distribution(
      records,
      (record) => record.reviewedAnalysis.recommendedAction
    ),
    highImpactRows: records
      .filter((record) => record.reviewedAnalysis.impactLevel === '高')
      .map(toHighImpactRow),
    summaryRows: records.map(toSummaryRow),
    opportunityRows: records.map(toOpportunityRow)
  };
}
