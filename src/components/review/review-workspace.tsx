'use client';

import * as React from 'react';
import { IconAlertCircle, IconCheck, IconEyeOff, IconSparkles } from '@tabler/icons-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { SOURCE_CHANNEL_LABELS } from '@/lib/import/import-options';
import {
  actionBadgeClass,
  impactBadgeClass,
  productBadgeClass,
  reviewStatusBadgeClass
} from '@/lib/signal-style';
import { useImportStore } from '@/stores/import-store';
import {
  IMPACT_LEVEL_OPTIONS,
  PRODUCT_MODULE_OPTIONS,
  RECOMMENDED_ACTION_OPTIONS,
  SIGNAL_TYPE_OPTIONS
} from '@/types/analysis';
import type { AnalysisProvider, AnalysisRecord, SignalAnalysis } from '@/types/analysis';
import type { RawSignal } from '@/types/import';

function summarize(content: string, maxLength = 120): string {
  const normalized = content.replace(/\s+/g, ' ').trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}...` : normalized;
}

function sourceLabel(signal: RawSignal | undefined): string {
  if (!signal) return '未知来源';
  return signal.customSourceName ?? SOURCE_CHANNEL_LABELS[signal.sourceChannel];
}

function confidenceLabel(confidence: number): string {
  if (confidence >= 0.85) return '高';
  if (confidence >= 0.65) return '中';
  return '低';
}

function providerLabel(record: AnalysisRecord): string {
  return record.provider === 'deepseek' ? 'DeepSeek' : 'Mock AI';
}

function formatConfidence(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function PendingAnalysisPanel({
  pendingSignals,
  provider,
  isAnalyzing,
  lastMessage,
  lastErrors,
  onProviderChange,
  onAnalyzeAll,
  findSignal
}: {
  pendingSignals: RawSignal[];
  provider: AnalysisProvider;
  isAnalyzing: boolean;
  lastMessage: string;
  lastErrors: Array<{ rawSignalId: string; message: string }>;
  onProviderChange: (provider: AnalysisProvider) => void;
  onAnalyzeAll: () => void;
  findSignal: (id: string) => RawSignal | undefined;
}) {
  return (
    <Card className='overflow-hidden'>
      <CardHeader className='gap-3'>
        <div className='flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2 text-base'>
              <IconSparkles className='size-4' aria-hidden='true' />
              待分析资料
            </CardTitle>
            <p className='text-muted-foreground mt-1 text-sm'>
              先生成 AI 预分类，再进入下方待确认列表集中审核。
            </p>
            <p className='text-muted-foreground mt-1 text-xs'>
              默认使用 DeepSeek 生成正式 AI 预分析；未配置 API Key 时可切换 Mock AI 进行流程演示。
            </p>
          </div>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            <Select
              value={provider}
              onValueChange={(value: AnalysisProvider) => onProviderChange(value)}
              disabled={isAnalyzing}
            >
              <SelectTrigger className='w-full sm:w-44'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='deepseek'>DeepSeek</SelectItem>
                <SelectItem value='mock'>Mock AI</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type='button'
              className='w-full sm:w-auto'
              onClick={onAnalyzeAll}
              disabled={pendingSignals.length === 0 || isAnalyzing}
            >
              {isAnalyzing ? '分析中...' : '分析待分析资料'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='grid gap-3'>
        {lastMessage && (
          <div className='bg-muted text-muted-foreground rounded-md px-3 py-2 text-sm'>
            {lastMessage}
          </div>
        )}
        {lastErrors.length > 0 && (
          <div className='grid gap-2'>
            {lastErrors.map((error) => {
              const signal = findSignal(error.rawSignalId);
              return (
                <div
                  key={error.rawSignalId}
                  className='flex gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'
                >
                  <IconAlertCircle className='mt-0.5 size-4 shrink-0' aria-hidden='true' />
                  <span>
                    {signal?.productName ?? '未知产品'}：{error.message}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {pendingSignals.length === 0 ? (
          <p className='text-muted-foreground text-sm'>暂无待分析资料。</p>
        ) : (
          <div className='grid gap-2 md:grid-cols-2 xl:grid-cols-3'>
            {pendingSignals.slice(0, 6).map((signal) => (
              <div key={signal.id} className='rounded-lg border bg-muted/20 p-3'>
                <div className='flex flex-wrap items-center gap-2'>
                  <Badge variant='outline' className={productBadgeClass(signal.productName)}>
                    {signal.productName}
                  </Badge>
                  <Badge variant='outline'>{sourceLabel(signal)}</Badge>
                </div>
                <p className='mt-2 text-sm leading-6'>{summarize(signal.rawContent, 72)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReviewTable({
  records,
  activeRecordId,
  findSignal,
  onActivate
}: {
  records: AnalysisRecord[];
  activeRecordId?: string;
  findSignal: (id: string) => RawSignal | undefined;
  onActivate: (recordId: string) => void;
}) {
  return (
    <Card className='min-w-0 overflow-hidden'>
      <CardHeader>
        <CardTitle className='text-base'>待确认列表</CardTitle>
        <p className='text-muted-foreground text-sm'>
          一行一条 AI 预分类结果，点击任意行后在下方集中审核。
        </p>
      </CardHeader>
      <CardContent className='p-0'>
        {records.length === 0 ? (
          <div className='text-muted-foreground flex min-h-40 items-center justify-center p-6 text-center text-sm'>
            暂无待确认分析结果。
          </div>
        ) : (
          <div className='max-w-full overflow-x-auto'>
            <Table className='min-w-[1120px]'>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-12'>选择</TableHead>
                  <TableHead>产品</TableHead>
                  <TableHead>来源</TableHead>
                  <TableHead>模块</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>影响</TableHead>
                  <TableHead>核心结论</TableHead>
                  <TableHead>建议</TableHead>
                  <TableHead>置信度</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => {
                  const signal = findSignal(record.rawSignalId);
                  const analysis = record.aiAnalysis;
                  const active = activeRecordId === record.id;

                  return (
                    <TableRow
                      key={record.id}
                      data-state={active && 'selected'}
                      className='cursor-pointer'
                      onClick={() => onActivate(record.id)}
                    >
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                          checked={active}
                          onCheckedChange={() => onActivate(record.id)}
                          aria-label={`审核 ${signal?.productName ?? '未知产品'} 信号`}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={productBadgeClass(signal?.productName ?? '')}
                        >
                          {signal?.productName ?? '未知产品'}
                        </Badge>
                      </TableCell>
                      <TableCell>{sourceLabel(signal)}</TableCell>
                      <TableCell>{analysis.module}</TableCell>
                      <TableCell>{analysis.signalType}</TableCell>
                      <TableCell>
                        <Badge variant='outline' className={impactBadgeClass(analysis.impactLevel)}>
                          {analysis.impactLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className='max-w-80 whitespace-normal'>
                        {analysis.coreConclusion}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={actionBadgeClass(analysis.recommendedAction)}
                        >
                          {analysis.recommendedAction}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatConfidence(analysis.confidence)}</TableCell>
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={reviewStatusBadgeClass(record.reviewStatus)}
                        >
                          待审核
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AuditWorkspace({
  record,
  signal,
  draft,
  onDraftChange,
  onApprove,
  onUpdateAndApprove,
  onIgnore
}: {
  record?: AnalysisRecord;
  signal?: RawSignal;
  draft?: SignalAnalysis;
  onDraftChange: (patch: Partial<SignalAnalysis>) => void;
  onApprove: () => void;
  onUpdateAndApprove: () => void;
  onIgnore: () => void;
}) {
  if (!record || !draft) {
    return (
      <Card>
        <CardContent className='text-muted-foreground flex min-h-56 items-center justify-center p-6 text-center text-sm'>
          从上方列表选择一条待确认记录后，在这里完成审核。
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='overflow-hidden'>
      <CardHeader>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between'>
          <div>
            <CardTitle className='text-base'>产品经理审核区</CardTitle>
            <div className='mt-2 flex flex-wrap gap-2'>
              <Badge variant='outline' className={productBadgeClass(signal?.productName ?? '')}>
                {signal?.productName ?? '未知产品'}
              </Badge>
              <Badge variant='outline'>{sourceLabel(signal)}</Badge>
              <Badge variant={record.provider === 'deepseek' ? 'default' : 'secondary'}>
                {providerLabel(record)}
              </Badge>
              <Badge variant='outline'>置信度 {confidenceLabel(record.aiAnalysis.confidence)}</Badge>
            </div>
          </div>
          <div className='grid gap-2 sm:flex sm:flex-wrap'>
            <Button type='button' className='w-full sm:w-auto' onClick={onApprove}>
              <IconCheck className='size-4' aria-hidden='true' />
              通过
            </Button>
            <Button type='button' variant='outline' className='w-full sm:w-auto' onClick={onUpdateAndApprove}>
              修改并通过
            </Button>
            <Button type='button' variant='outline' className='w-full sm:w-auto' onClick={onIgnore}>
              <IconEyeOff className='size-4' aria-hidden='true' />
              忽略
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='grid gap-5'>
        <div className='grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]'>
          <section className='rounded-lg border bg-muted/20 p-4'>
            <p className='text-sm font-semibold'>原始文本</p>
            <p className='mt-2 text-sm leading-6 break-words'>{signal?.rawContent ?? '原文不存在'}</p>
          </section>
          <section className='rounded-lg border bg-emerald-50 p-4 text-emerald-950'>
            <p className='text-sm font-semibold'>AI 结论摘要</p>
            <p className='mt-2 text-sm leading-6'>{record.aiAnalysis.coreConclusion}</p>
            <p className='mt-3 text-xs text-emerald-700'>
              AI 先给出明确分类，人工只需判断是否通过或纠偏。
            </p>
          </section>
        </div>

        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <div className='grid gap-2'>
            <Label>模块</Label>
            <Select
              value={draft.module}
              onValueChange={(module: SignalAnalysis['module']) => onDraftChange({ module })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_MODULE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2'>
            <Label>类型</Label>
            <Select
              value={draft.signalType}
              onValueChange={(signalType: SignalAnalysis['signalType']) =>
                onDraftChange({ signalType })
              }
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIGNAL_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2'>
            <Label>影响程度</Label>
            <Select
              value={draft.impactLevel}
              onValueChange={(impactLevel: SignalAnalysis['impactLevel']) =>
                onDraftChange({ impactLevel })
              }
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMPACT_LEVEL_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2'>
            <Label>建议动作</Label>
            <Select
              value={draft.recommendedAction}
              onValueChange={(recommendedAction: SignalAnalysis['recommendedAction']) =>
                onDraftChange({ recommendedAction })
              }
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECOMMENDED_ACTION_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='grid gap-4 lg:grid-cols-2'>
          <div className='grid gap-2'>
            <Label>核心结论</Label>
            <Input
              value={draft.coreConclusion}
              onChange={(event) => onDraftChange({ coreConclusion: event.target.value })}
            />
          </div>
          <div className='grid gap-2'>
            <Label>AI 依据 / 证据</Label>
            <Input
              value={draft.evidenceQuote}
              onChange={(event) => onDraftChange({ evidenceQuote: event.target.value })}
            />
          </div>
          <div className='grid gap-2'>
            <Label>产品启示</Label>
            <Textarea
              value={draft.productInsight}
              onChange={(event) => onDraftChange({ productInsight: event.target.value })}
              className='min-h-24 resize-y'
            />
          </div>
          <div className='grid gap-2'>
            <Label>用户场景</Label>
            <Textarea
              value={draft.userScenario}
              onChange={(event) => onDraftChange({ userScenario: event.target.value })}
              className='min-h-24 resize-y'
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReviewWorkspace() {
  const {
    rawSignals,
    analysisRecords,
    analyzePendingSignals,
    approveAnalysis,
    updateAndApproveAnalysis,
    ignoreAnalysis,
    getPendingAnalysisSignals,
    getPendingReviewRecords,
    getApprovedRecords
  } = useImportStore();
  const [analysisProvider, setAnalysisProvider] = React.useState<AnalysisProvider>('deepseek');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [lastMessage, setLastMessage] = React.useState('');
  const [lastErrors, setLastErrors] = React.useState<Array<{ rawSignalId: string; message: string }>>(
    []
  );
  const [activeRecordId, setActiveRecordId] = React.useState<string>();
  const [draft, setDraft] = React.useState<SignalAnalysis>();

  const pendingAnalysisSignals = getPendingAnalysisSignals();
  const pendingReviewRecords = getPendingReviewRecords();
  const approvedRecords = getApprovedRecords();
  const ignoredCount = analysisRecords.filter((record) => record.reviewStatus === 'ignored').length;
  const activeRecord =
    pendingReviewRecords.find((record) => record.id === activeRecordId) ?? pendingReviewRecords[0];

  React.useEffect(() => {
    if (!activeRecord) {
      setActiveRecordId(undefined);
      setDraft(undefined);
      return;
    }
    if (activeRecord.id !== activeRecordId) setActiveRecordId(activeRecord.id);
    setDraft(activeRecord.aiAnalysis);
  }, [activeRecord, activeRecordId]);

  function findSignal(rawSignalId: string): RawSignal | undefined {
    return rawSignals.find((signal) => signal.id === rawSignalId);
  }

  function updateDraft(patch: Partial<SignalAnalysis>): void {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  }

  async function handleAnalyzeAll(): Promise<void> {
    setIsAnalyzing(true);
    setLastMessage(`正在分析 1 / ${pendingAnalysisSignals.length}，服务端会顺序处理。`);
    setLastErrors([]);

    const result = await analyzePendingSignals(analysisProvider);
    const message =
      result.message ??
      `分析完成：成功 ${result.createdCount} 条，失败 ${result.failedCount} 条。`;

    setLastMessage(message);
    setLastErrors(result.errors);
    setIsAnalyzing(false);

    if (result.failedCount > 0 || result.message) toast.error(message);
    else toast.success(message);
  }

  function handleApprove(): void {
    if (!activeRecord) return;
    approveAnalysis(activeRecord.id);
    toast.success('已通过，信号已进入总表。');
  }

  function handleUpdateAndApprove(): void {
    if (!activeRecord || !draft) return;
    updateAndApproveAnalysis(activeRecord.id, {
      ...draft,
      confidence: Math.min(1, Math.max(0, draft.confidence))
    });
    toast.success('已修改并通过，信号已进入总表。');
  }

  function handleIgnore(): void {
    if (!activeRecord) return;
    ignoreAnalysis(activeRecord.id);
    toast.success('已忽略，该记录不会进入信号总表。');
  }

  return (
    <div className='flex min-w-0 flex-col gap-4'>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {[
          ['待分析资料数', pendingAnalysisSignals.length],
          ['待确认分析数', pendingReviewRecords.length],
          ['已通过信号数', approvedRecords.length],
          ['已忽略数', ignoredCount]
        ].map(([label, value]) => (
          <Card key={label} className='gap-2 py-4'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-semibold'>{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PendingAnalysisPanel
        pendingSignals={pendingAnalysisSignals}
        provider={analysisProvider}
        isAnalyzing={isAnalyzing}
        lastMessage={lastMessage}
        lastErrors={lastErrors}
        onProviderChange={setAnalysisProvider}
        onAnalyzeAll={handleAnalyzeAll}
        findSignal={findSignal}
      />

      <ReviewTable
        records={pendingReviewRecords}
        activeRecordId={activeRecord?.id}
        findSignal={findSignal}
        onActivate={setActiveRecordId}
      />

      <AuditWorkspace
        record={activeRecord}
        signal={activeRecord ? findSignal(activeRecord.rawSignalId) : undefined}
        draft={draft}
        onDraftChange={updateDraft}
        onApprove={handleApprove}
        onUpdateAndApprove={handleUpdateAndApprove}
        onIgnore={handleIgnore}
      />
    </div>
  );
}
