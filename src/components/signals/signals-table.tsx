'use client';

import { IconEye } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { SOURCE_CHANNEL_LABELS } from '@/lib/import/import-options';
import {
  actionBadgeClass,
  impactBadgeClass,
  productBadgeClass,
  reviewStatusBadgeClass,
  reviewStatusLabel
} from '@/lib/signal-style';
import { useImportStore } from '@/stores/import-store';
import type { AnalysisRecord, SignalAnalysis } from '@/types/analysis';
import type { RawSignal } from '@/types/import';

function formatDate(value?: string): string {
  if (!value) return '-';

  try {
    return new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function sourceLabel(signal: RawSignal | undefined): string {
  if (!signal) return '未知来源';
  return signal.customSourceName ?? SOURCE_CHANNEL_LABELS[signal.sourceChannel];
}

function providerLabel(record: AnalysisRecord): string {
  return record.provider === 'deepseek' ? 'DeepSeek' : 'Mock AI';
}

function SignalDetailDialog({
  record,
  signal,
  analysis
}: {
  record: AnalysisRecord;
  signal: RawSignal | undefined;
  analysis: SignalAnalysis;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type='button' variant='outline' size='sm'>
          <IconEye className='size-4' aria-hidden='true' />
          查看
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>信号详情</DialogTitle>
          <DialogDescription>
            展示原文、模型初始判断、人工确认结果和分析来源。
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4'>
          <section className='grid gap-2'>
            <h3 className='text-sm font-semibold'>分析来源</h3>
            <div className='flex flex-wrap gap-2'>
              <Badge variant={record.provider === 'deepseek' ? 'default' : 'secondary'}>
                {providerLabel(record)}
              </Badge>
              {record.modelName && <Badge variant='outline'>{record.modelName}</Badge>}
              <Badge variant='outline'>Prompt {record.promptVersion}</Badge>
              <Badge variant={record.modifiedFields?.length ? 'secondary' : 'outline'}>
                {record.modifiedFields?.length ? '人工修改过' : '未修改'}
              </Badge>
            </div>
          </section>
          <section className='grid gap-2'>
            <h3 className='text-sm font-semibold'>原始资料</h3>
            <p className='text-sm leading-6 break-words'>{signal?.rawContent ?? '原文不存在'}</p>
          </section>
          <section className='grid gap-2'>
            <h3 className='text-sm font-semibold'>模型原始判断</h3>
            <div className='grid gap-2 text-sm md:grid-cols-2'>
              <p>模块：{record.aiAnalysis.module}</p>
              <p>信号类型：{record.aiAnalysis.signalType}</p>
              <p>影响程度：{record.aiAnalysis.impactLevel}</p>
              <p>建议动作：{record.aiAnalysis.recommendedAction}</p>
              <p className='md:col-span-2'>核心结论：{record.aiAnalysis.coreConclusion}</p>
              <p className='md:col-span-2'>产品启示：{record.aiAnalysis.productInsight}</p>
            </div>
          </section>
          <section className='grid gap-2'>
            <h3 className='text-sm font-semibold'>人工确认结果</h3>
            <div className='grid gap-2 text-sm md:grid-cols-2'>
              <p>模块：{analysis.module}</p>
              <p>信号类型：{analysis.signalType}</p>
              <p>影响程度：{analysis.impactLevel}</p>
              <p>建议动作：{analysis.recommendedAction}</p>
              <p>审核状态：{record.reviewStatus === 'modified' ? '修改通过' : '通过'}</p>
              <p>审核时间：{formatDate(record.reviewedAt)}</p>
              <p className='md:col-span-2'>核心结论：{analysis.coreConclusion}</p>
              <p className='md:col-span-2'>产品启示：{analysis.productInsight}</p>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SignalsTable() {
  const { rawSignals, getApprovedRecords } = useImportStore();
  const approvedRecords = getApprovedRecords();

  function findSignal(rawSignalId: string): RawSignal | undefined {
    return rawSignals.find((signal) => signal.id === rawSignalId);
  }

  if (approvedRecords.length === 0) {
    return (
      <Card>
        <CardContent className='text-muted-foreground flex min-h-64 items-center justify-center p-6 text-center text-sm'>
          通过审核的产品信号会在这里沉淀为总表。
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full min-w-0 overflow-hidden'>
      <CardContent className='min-w-0 p-0'>
        <div className='w-full max-w-full overflow-x-auto'>
          <Table className='min-w-[1120px]'>
            <TableHeader>
              <TableRow>
                <TableHead>产品</TableHead>
                <TableHead>来源</TableHead>
                <TableHead>模块</TableHead>
                <TableHead>信号类型</TableHead>
                <TableHead>影响程度</TableHead>
                <TableHead>核心结论</TableHead>
                <TableHead>产品启示</TableHead>
                <TableHead>建议动作</TableHead>
                <TableHead>审核状态</TableHead>
                <TableHead>审核时间</TableHead>
                <TableHead>详情</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedRecords.map((record) => {
                const signal = findSignal(record.rawSignalId);
                const analysis = record.reviewedAnalysis;
                if (!analysis) return null;

                return (
                  <TableRow key={record.id} className='h-14'>
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
                    <TableCell className='max-w-64 whitespace-normal'>
                      {analysis.coreConclusion}
                    </TableCell>
                    <TableCell className='max-w-72 whitespace-normal'>
                      {analysis.productInsight}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className={actionBadgeClass(analysis.recommendedAction)}
                      >
                        {analysis.recommendedAction}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className={reviewStatusBadgeClass(record.reviewStatus)}
                      >
                        {reviewStatusLabel(record.reviewStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(record.reviewedAt)}</TableCell>
                    <TableCell>
                      <SignalDetailDialog record={record} signal={signal} analysis={analysis} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
