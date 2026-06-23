'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { exportReportChartsPng, ReportCharts } from '@/components/reports/report-charts';
import { DEFAULT_REPORT_CONFIG, ReportConfigPanel } from '@/components/reports/report-config-panel';
import type { ReportConfigState } from '@/components/reports/report-config-panel';
import { ReportPreview } from '@/components/reports/report-preview';
import { ReportSignalSelector } from '@/components/reports/report-signal-selector';
import { generateReportMetrics } from '@/services/reports/generate-report-metrics';
import { useImportStore } from '@/stores/import-store';
import type { ApprovedAnalysisRecord, ReportFilters } from '@/types/report';

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) =>
    left.localeCompare(right, 'zh-CN')
  );
}

function isWithinTimeRange(
  record: ApprovedAnalysisRecord,
  timeRange: ReportConfigState['timeRange']
) {
  if (timeRange === 'all') return true;

  const sourceDate = record.reviewedAt ?? record.createdAt;
  const timestamp = new Date(sourceDate).getTime();
  if (Number.isNaN(timestamp)) return true;

  const days = timeRange === 'last7days' ? 7 : 30;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return timestamp >= cutoff;
}

function matchesConfig(record: ApprovedAnalysisRecord, config: ReportConfigState): boolean {
  const analysis = record.reviewedAnalysis;
  return (
    isWithinTimeRange(record, config.timeRange) &&
    (config.productName === 'all' || record.productName === config.productName) &&
    (config.module === 'all' || analysis.module === config.module) &&
    (config.impactLevel === 'all' || analysis.impactLevel === config.impactLevel) &&
    (config.recommendedAction === 'all' ||
      analysis.recommendedAction === config.recommendedAction) &&
    (config.provider === 'all' || record.provider === config.provider)
  );
}

function toReportFilters(config: ReportConfigState): ReportFilters {
  return {
    productNames: config.productName === 'all' ? [] : [config.productName],
    modules: config.module === 'all' ? [] : [config.module],
    impactLevels: config.impactLevel === 'all' ? [] : [config.impactLevel],
    recommendedActions: config.recommendedAction === 'all' ? [] : [config.recommendedAction],
    providers: config.provider === 'all' ? ['all'] : [config.provider],
    timeRange: config.timeRange
  };
}

function reportFileStamp(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    '-',
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0')
  ].join('');
}

function downloadMarkdown(markdown: string): void {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `map-product-intelligence-report-${reportFileStamp()}.md`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function ReportWorkspace() {
  const {
    currentReportDraft,
    currentReportSelection,
    generateReport,
    clearCurrentReportDraft,
    setCurrentReportSelection,
    getApprovedRecordsForReports
  } = useImportStore();
  const [config, setConfig] = React.useState<ReportConfigState>(DEFAULT_REPORT_CONFIG);
  const approvedRecords = getApprovedRecordsForReports();
  const filteredRecords = approvedRecords.filter((record) => matchesConfig(record, config));
  const selectedSet = new Set(currentReportSelection);
  const selectedRecords = filteredRecords.filter((record) => selectedSet.has(record.id));
  const metrics = React.useMemo(() => generateReportMetrics(selectedRecords), [selectedRecords]);

  const products = uniqueSorted(approvedRecords.map((record) => record.productName));
  const modules = uniqueSorted(approvedRecords.map((record) => record.reviewedAnalysis.module));

  function updateConfig(patch: Partial<ReportConfigState>): void {
    setConfig((current) => ({ ...current, ...patch }));
  }

  function handleGenerateReport(): void {
    if (selectedRecords.length === 0) {
      toast.error('请先勾选至少 1 条正式信号。');
      return;
    }

    try {
      generateReport({
        title: config.title.trim() || DEFAULT_REPORT_CONFIG.title,
        reportType: config.reportType,
        selectedRecords,
        filters: toReportFilters(config),
        note: config.note.trim(),
        generatedAt: new Date().toISOString()
      });
      toast.success('报告已生成。');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '报告生成失败。');
    }
  }

  function handleExportCharts(): void {
    if (selectedRecords.length === 0) {
      toast.error('请先勾选信号后再导出图表。');
      return;
    }
    exportReportChartsPng(metrics);
    toast.success('图表 PNG 已开始下载。');
  }

  function handleDownloadMarkdown(): void {
    if (!currentReportDraft?.markdown) {
      toast.error('请先生成报告。');
      return;
    }
    downloadMarkdown(currentReportDraft.markdown);
    toast.success('Markdown 文件已开始下载。');
  }

  return (
    <div className='flex min-w-0 flex-col gap-4'>
      <div className='bg-muted/40 grid gap-3 rounded-lg border p-4 md:grid-cols-3'>
        <div>
          <p className='text-sm font-medium'>筛选与勾选</p>
          <p className='text-muted-foreground mt-1 text-xs'>只读取人工确认后的正式信号。</p>
        </div>
        <div>
          <p className='text-sm font-medium'>生成汇报图表</p>
          <p className='text-muted-foreground mt-1 text-xs'>4 张分布图可导出 PNG 放进 PPT。</p>
        </div>
        <div>
          <p className='text-sm font-medium'>报告产出</p>
          <p className='text-muted-foreground mt-1 text-xs'>
            可直接复制到周报、月报或竞品分析文档中。
          </p>
        </div>
      </div>

      <div className='grid gap-3 sm:grid-cols-3'>
        <Card className='gap-2 py-4'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>正式信号数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-semibold'>{approvedRecords.length}</div>
          </CardContent>
        </Card>
        <Card className='gap-2 py-4'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>当前筛选结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-semibold'>{filteredRecords.length}</div>
          </CardContent>
        </Card>
        <Card className='gap-2 py-4'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>已勾选用于报告</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-semibold'>{selectedRecords.length}</div>
          </CardContent>
        </Card>
      </div>

      <ReportConfigPanel
        config={config}
        products={products}
        modules={modules}
        canGenerate={selectedRecords.length > 0}
        canExportCharts={selectedRecords.length > 0}
        canDownloadMarkdown={Boolean(currentReportDraft?.markdown)}
        onChange={updateConfig}
        onGenerate={handleGenerateReport}
        onExportCharts={handleExportCharts}
        onDownloadMarkdown={handleDownloadMarkdown}
      />

      <ReportSignalSelector
        records={filteredRecords}
        selectedIds={currentReportSelection}
        onSelectIds={setCurrentReportSelection}
      />

      <ReportCharts metrics={metrics} />
      <ReportPreview
        report={currentReportDraft}
        onClear={clearCurrentReportDraft}
      />
    </div>
  );
}
