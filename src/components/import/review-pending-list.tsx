'use client';

import { IconFileText, IconInbox } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SOURCE_CHANNEL_LABELS, RAW_SIGNAL_STATUS_LABELS } from '@/lib/import/import-options';
import { useImportStore } from '@/stores/import-store';

function formatDate(value: string): string {
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

function summarize(content: string): string {
  const normalized = content.replace(/\s+/g, ' ').trim();
  return normalized.length > 120 ? `${normalized.slice(0, 120)}...` : normalized;
}

export function ReviewPendingList() {
  const { rawSignals } = useImportStore();
  const pendingSignals = rawSignals.filter((signal) => signal.status === 'pending_analysis');

  if (pendingSignals.length === 0) {
    return (
      <Card>
        <CardContent className='flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center'>
          <IconInbox className='text-muted-foreground size-10' aria-hidden='true' />
          <div>
            <p className='text-base font-medium'>尚无待分析资料</p>
            <p className='text-muted-foreground mt-1 text-sm'>
              从资料导入页确认保存后，原始资料会进入这里等待后续分析。
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='grid gap-3 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>待分析资料</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-semibold'>{pendingSignals.length}</div>
          </CardContent>
        </Card>
        <Card className='md:col-span-2'>
          <CardContent className='text-muted-foreground flex min-h-full items-center p-4 text-sm'>
            当前仅保存导入资料和待分析状态，AI 审核、通过、忽略等操作将在后续阶段接入。
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <IconFileText className='size-4' aria-hidden='true' />
            待分析记录
          </CardTitle>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='divide-y'>
            {pendingSignals.map((signal) => (
              <article key={signal.id} className='flex flex-col gap-3 p-4 md:p-5'>
                <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='font-medium'>{signal.productName}</span>
                      <Badge variant='secondary'>
                        {signal.customSourceName ?? SOURCE_CHANNEL_LABELS[signal.sourceChannel]}
                      </Badge>
                      {signal.isSynthetic && <Badge variant='outline'>示例数据</Badge>}
                    </div>
                    <p className='text-muted-foreground mt-1 text-xs'>
                      导入时间：{formatDate(signal.importedAt)}
                    </p>
                  </div>
                  <Badge variant='outline'>{RAW_SIGNAL_STATUS_LABELS[signal.status]}</Badge>
                </div>
                <Separator />
                <p className='text-sm leading-6 break-words'>{summarize(signal.rawContent)}</p>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
