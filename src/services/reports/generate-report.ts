import { generateReportMetrics } from '@/services/reports/generate-report-metrics';
import type { ApprovedAnalysisRecord, GenerateReportInput, GeneratedReport } from '@/types/report';

function createId(generatedAt: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `report-${generatedAt.replace(/[^0-9]/g, '')}-${random}`;
}

function uniq(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function formatDateTime(value: string): string {
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function escapeCell(value: string | undefined): string {
  return (value?.trim() || '本期暂无明显信号').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function topItems(items: Array<{ name: string; count: number }>, limit = 3): string {
  if (items.length === 0) return '本期暂无明显信号';
  return items
    .slice(0, limit)
    .map((item) => `${item.name}（${item.count}）`)
    .join('、');
}

function groupByProduct(records: ApprovedAnalysisRecord[]): Map<string, ApprovedAnalysisRecord[]> {
  const map = new Map<string, ApprovedAnalysisRecord[]>();
  records.forEach((record) => {
    const list = map.get(record.productName) ?? [];
    list.push(record);
    map.set(record.productName, list);
  });
  return map;
}

function countByAction(records: ApprovedAnalysisRecord[], action: string): number {
  return records.filter((record) => record.reviewedAnalysis.recommendedAction === action).length;
}

function priorityRank(record: ApprovedAnalysisRecord): number {
  const impactRank: Record<string, number> = { 高: 0, 中: 1, 低: 2 };
  const actionRank: Record<string, number> = {
    补充: 0,
    保留: 1,
    继续观察: 2,
    暂不处理: 3
  };

  return (
    (impactRank[record.reviewedAnalysis.impactLevel] ?? 3) * 10 +
    (actionRank[record.reviewedAnalysis.recommendedAction] ?? 9)
  );
}

function priorityLabel(record: ApprovedAnalysisRecord): string {
  if (record.reviewedAnalysis.impactLevel === '高') return 'P0 / 高';
  if (record.reviewedAnalysis.impactLevel === '中') return 'P1 / 中';
  return 'P2 / 观察';
}

function keyOpportunity(records: ApprovedAnalysisRecord[]): string {
  const topRecord = [...records].sort((left, right) => priorityRank(left) - priorityRank(right))[0];
  return topRecord?.reviewedAnalysis.productInsight ?? '本期暂无明显信号';
}

function recommendedFocus(records: ApprovedAnalysisRecord[]): string {
  const topRecord = [...records].sort((left, right) => priorityRank(left) - priorityRank(right))[0];
  if (!topRecord) return '本期暂无明显信号';

  return `${topRecord.reviewedAnalysis.module}：${topRecord.reviewedAnalysis.coreConclusion}`;
}

function moduleFindingBlocks(records: ApprovedAnalysisRecord[]): string[] {
  const metrics = generateReportMetrics(records);
  const topModules = metrics.moduleDistribution.slice(0, 2);

  if (topModules.length === 0) {
    return ['### 发现 1：本期暂无明显信号', '', '- 相关信号数量：0', '- 涉及产品：暂无', '- 典型表现：本期暂无明显信号', '- 产品启示：本期暂无明显信号', ''];
  }

  return topModules.flatMap((item, index) => {
    const moduleRecords = records.filter((record) => record.reviewedAnalysis.module === item.name);
    const products = uniq(moduleRecords.map((record) => record.productName));
    const lead = [...moduleRecords].sort((left, right) => priorityRank(left) - priorityRank(right))[0];

    return [
      `### 发现 ${index + 1}：${item.name} 是本期需要关注的信号区域`,
      '',
      `- 相关信号数量：${item.count}`,
      `- 涉及产品：${products.join('、') || '本期暂无明显信号'}`,
      `- 典型表现：${lead?.reviewedAnalysis.coreConclusion ?? '本期暂无明显信号'}`,
      `- 产品启示：${lead?.reviewedAnalysis.productInsight ?? '本期暂无明显信号'}`,
      ''
    ];
  });
}

function productSummary(records: ApprovedAnalysisRecord[]): string[] {
  const lines: string[] = [];
  const grouped = groupByProduct(records);

  grouped.forEach((productRecords, productName) => {
    const sortedRecords = [...productRecords].sort((left, right) => priorityRank(left) - priorityRank(right));
    const mainSignals = sortedRecords
      .slice(0, 3)
      .map((record) => record.reviewedAnalysis.coreConclusion)
      .join('；');
    const actions = uniq(sortedRecords.map((record) => record.reviewedAnalysis.recommendedAction)).join('、');
    const insights = sortedRecords[0]?.reviewedAnalysis.productInsight;

    lines.push(`### ${productName}`);
    lines.push(`- 主要信号：${mainSignals || '本期暂无明显信号'}`);
    lines.push(`- 典型问题 / 动作：${actions || '本期暂无明显信号'}`);
    lines.push(`- 对我方启示：${insights || '本期暂无明显信号'}`);
    lines.push('');
  });

  return lines.length > 0 ? lines : ['### 本期暂无明显信号', '- 主要信号：本期暂无明显信号', '- 典型问题 / 动作：本期暂无明显信号', '- 对我方启示：本期暂无明显信号', ''];
}

function opportunityRows(records: ApprovedAnalysisRecord[]): string[] {
  const sortedRecords = [...records].sort((left, right) => priorityRank(left) - priorityRank(right));

  if (sortedRecords.length === 0) {
    return ['| P2 / 观察 | 本期暂无明显信号 | 本期暂无明显信号 | 本期暂无明显信号 | 本期暂无明显信号 |'];
  }

  return sortedRecords.map((record, index) => {
    const analysis = record.reviewedAnalysis;
    return `| ${escapeCell(priorityLabel(record))} | ${escapeCell(analysis.module)} | ${escapeCell(
      analysis.coreConclusion
    )} | ${escapeCell(analysis.recommendedAction)} | 证据 ${index + 1} |`;
  });
}

function nextStepLines(records: ApprovedAnalysisRecord[]): string[] {
  const sortedRecords = [...records].sort((left, right) => priorityRank(left) - priorityRank(right));
  const highRecord = sortedRecords.find((record) => record.reviewedAnalysis.impactLevel === '高');
  const researchRecord = sortedRecords.find((record) => record.reviewedAnalysis.recommendedAction === '补充');
  const watchRecord = sortedRecords.find((record) => record.reviewedAnalysis.recommendedAction === '继续观察');
  const backlogRecord = sortedRecords.find((record) => record.reviewedAnalysis.recommendedAction === '保留');

  return [
    `1. 优先验证${highRecord ? `：${highRecord.reviewedAnalysis.module} - ${highRecord.reviewedAnalysis.coreConclusion}` : '：本期暂无高影响信号。'}`,
    `2. 补充调研${researchRecord ? `：${researchRecord.productName} 的 ${researchRecord.reviewedAnalysis.module} 场景。` : '：本期暂无需要补充调研的明确信号。'}`,
    `3. 继续观察${watchRecord ? `：${watchRecord.reviewedAnalysis.module} 是否持续出现同类反馈。` : '：本期暂无明确观察项。'}`,
    `4. 可进入需求池${backlogRecord ? `：${backlogRecord.reviewedAnalysis.productInsight}` : '：本期暂无可直接沉淀的需求项。'}`
  ];
}

function evidenceRows(records: ApprovedAnalysisRecord[]): string[] {
  return records.map((record, index) => {
    const analysis = record.reviewedAnalysis;
    return `| ${index + 1} | ${escapeCell(record.productName)} | ${escapeCell(
      record.sourceLabel
    )} | ${escapeCell(analysis.evidenceQuote)} | ${escapeCell(analysis.coreConclusion)} |`;
  });
}

export function generateReport(input: GenerateReportInput): GeneratedReport {
  const selectedRecords = input.selectedRecords;
  if (selectedRecords.length === 0) {
    throw new Error('生成报告至少需要选择 1 条人工确认后的产品信号。');
  }

  const metrics = generateReportMetrics(selectedRecords);
  const products = uniq(selectedRecords.map((record) => record.productName));
  const modules = uniq(selectedRecords.map((record) => record.reviewedAnalysis.module));
  const sources = uniq(selectedRecords.map((record) => record.sourceLabel));
  const highImpactCount = selectedRecords.filter(
    (record) => record.reviewedAnalysis.impactLevel === '高'
  ).length;
  const title = input.title.trim() || '地图产品竞品与用户声音分析报告';

  const lines = [
    `# ${title}`,
    '',
    '> 本报告基于人工确认后的产品信号生成，数据来源包括应用商城评论、版本更新日志、社区反馈和竞品体验记录。',
    '',
    '## 一、结论摘要',
    '',
    `- 本期共纳入 ${selectedRecords.length} 条有效产品信号，覆盖 ${products.length} 个产品、${modules.length} 个模块。`,
    `- 高影响信号 ${highImpactCount} 条，主要集中在：${topItems(metrics.moduleDistribution)}。`,
    `- 本期最值得关注的产品机会是：${keyOpportunity(selectedRecords)}`,
    `- 建议优先处理：${recommendedFocus(selectedRecords)}`,
    '',
    '## 二、分析范围',
    '',
    '| 项目 | 内容 |',
    '|---|---|',
    `| 报告类型 | ${escapeCell(input.reportType)} |`,
    `| 生成时间 | ${escapeCell(formatDateTime(input.generatedAt))} |`,
    `| 使用信号数 | ${selectedRecords.length} |`,
    `| 覆盖产品 | ${escapeCell(products.join('、'))} |`,
    `| 覆盖模块 | ${escapeCell(modules.join('、'))} |`,
    `| 数据来源 | ${escapeCell(sources.join('、'))} |`,
    ...(input.note ? [`| 报告备注 | ${escapeCell(input.note)} |`] : []),
    '',
    '## 三、本期关键数据',
    '',
    '| 指标 | 数量 / 说明 |',
    '|---|---:|',
    `| 有效信号总数 | ${selectedRecords.length} |`,
    `| 高影响信号 | ${highImpactCount} |`,
    `| 涉及产品数 | ${products.length} |`,
    `| 涉及模块数 | ${modules.length} |`,
    `| 建议补充 / 优化信号 | ${countByAction(selectedRecords, '补充')} |`,
    `| 继续观察信号 | ${countByAction(selectedRecords, '继续观察')} |`,
    '',
    '## 四、重点发现',
    '',
    ...moduleFindingBlocks(selectedRecords),
    '## 五、竞品与用户声音摘要',
    '',
    ...productSummary(selectedRecords),
    '## 六、产品机会与建议动作',
    '',
    '| 优先级 | 模块 | 问题 / 机会 | 建议动作 | 依据 |',
    '|---|---|---|---|---|',
    ...opportunityRows(selectedRecords),
    '',
    '## 七、下阶段建议',
    '',
    ...nextStepLines(selectedRecords),
    '',
    '## 八、证据索引',
    '',
    '| 编号 | 产品 | 来源 | 原文证据 | 对应结论 |',
    '|---:|---|---|---|---|',
    ...evidenceRows(selectedRecords),
    ''
  ];

  return {
    id: createId(input.generatedAt),
    title,
    reportType: input.reportType,
    markdown: lines.join('\n'),
    selectedRecordIds: selectedRecords.map((record) => record.id),
    generatedAt: input.generatedAt
  };
}
