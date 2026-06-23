'use client';

import { IconCopy, IconDownload, IconFileText, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GeneratedReport } from '@/types/report';

interface ReportPreviewProps {
  report?: GeneratedReport;
  onClear: () => void;
}

function downloadFile(markdown: string): void {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    '-',
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0')
  ].join('');
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `map-product-intelligence-report-${stamp}.md`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function ReportPreview({ report, onClear }: ReportPreviewProps) {
  async function handleCopy(): Promise<void> {
    if (!report?.markdown) return;

    try {
      await navigator.clipboard.writeText(report.markdown);
      toast.success('Markdown 已复制。');
    } catch {
      toast.error('复制失败，请手动选中文本复制。');
    }
  }

  function handleDownload(): void {
    if (!report?.markdown) return;
    downloadFile(report.markdown);
    toast.success('Markdown 文件已开始下载。');
  }

  return (
    <Card className='min-w-0 overflow-hidden'>
      <CardHeader className='gap-3'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2 text-base'>
              <IconFileText className='size-4' aria-hidden='true' />
              报告产出
            </CardTitle>
            <p className='text-muted-foreground mt-1 text-sm'>
              基于已确认产品信号生成，可直接复制到周报、月报或竞品分析文档中。
            </p>
          </div>
          <div className='grid gap-2 sm:flex sm:flex-wrap'>
            <Button
              type='button'
              variant='outline'
              className='w-full sm:w-auto'
              onClick={handleCopy}
              disabled={!report?.markdown}
            >
              <IconCopy className='size-4' aria-hidden='true' />
              复制报告
            </Button>
            <Button
              type='button'
              variant='outline'
              className='w-full sm:w-auto'
              onClick={handleDownload}
              disabled={!report?.markdown}
            >
              <IconDownload className='size-4' aria-hidden='true' />
              下载 Markdown
            </Button>
            <Button
              type='button'
              variant='outline'
              className='w-full sm:w-auto'
              onClick={onClear}
              disabled={!report?.markdown}
            >
              <IconTrash className='size-4' aria-hidden='true' />
              清空报告
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='min-w-0'>
        {report?.markdown ? (
          <pre className='bg-muted/50 max-h-[520px] max-w-full overflow-auto rounded-md p-4 text-sm leading-6 whitespace-pre-wrap break-words'>
            {report.markdown}
          </pre>
        ) : (
          <div className='text-muted-foreground flex min-h-48 items-center justify-center rounded-md border border-dashed p-6 text-center text-sm'>
            勾选正式信号后点击“生成报告”，这里会展示可复制、可下载的 Markdown 正文。
          </div>
        )}
      </CardContent>
    </Card>
  );
}
