'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { actionBadgeClass, impactBadgeClass, productBadgeClass } from '@/lib/signal-style';
import type { ApprovedAnalysisRecord } from '@/types/report';

interface ReportSignalSelectorProps {
  records: ApprovedAnalysisRecord[];
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
}

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

export function ReportSignalSelector({
  records,
  selectedIds,
  onSelectIds
}: ReportSignalSelectorProps) {
  const visibleIds = records.map((record) => record.id);
  const selectedSet = new Set(selectedIds);
  const selectedVisibleCount = visibleIds.filter((id) => selectedSet.has(id)).length;

  function toggleRecord(id: string, checked: boolean): void {
    if (checked) {
      onSelectIds(Array.from(new Set([...selectedIds, id])));
      return;
    }
    onSelectIds(selectedIds.filter((selectedId) => selectedId !== id));
  }

  function selectVisible(): void {
    onSelectIds(Array.from(new Set([...selectedIds, ...visibleIds])));
  }

  function clearSelection(): void {
    onSelectIds([]);
  }

  return (
    <Card className='w-full min-w-0 overflow-hidden'>
      <CardHeader className='gap-3'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <CardTitle className='text-base'>正式信号筛选</CardTitle>
            <p className='text-muted-foreground mt-1 text-sm'>
              当前筛选 {records.length} 条，已勾选 {selectedVisibleCount} 条用于图表和报告。
            </p>
          </div>
          <div className='grid gap-2 sm:flex sm:flex-wrap'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='w-full sm:w-auto'
              onClick={selectVisible}
              disabled={records.length === 0}
            >
              全选当前筛选结果
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='w-full sm:w-auto'
              onClick={clearSelection}
              disabled={selectedIds.length === 0}
            >
              清空选择
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='min-w-0 p-0'>
        {records.length === 0 ? (
          <div className='text-muted-foreground flex min-h-48 items-center justify-center p-6 text-center text-sm'>
            请先在 /review 中通过或修改通过一些 AI 分析结果，正式信号会沉淀到这里用于生成报告。
          </div>
        ) : (
          <div className='w-full max-w-full overflow-x-auto'>
            <Table className='min-w-[1040px]'>
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
                  <TableHead>审核时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => {
                  const analysis = record.reviewedAnalysis;
                  return (
                    <TableRow key={record.id} data-state={selectedSet.has(record.id) && 'selected'}>
                      <TableCell>
                        <Checkbox
                          checked={selectedSet.has(record.id)}
                          onCheckedChange={(checked) => toggleRecord(record.id, checked === true)}
                          aria-label={`选择 ${record.productName} 信号`}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline' className={productBadgeClass(record.productName)}>
                          {record.productName}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.sourceLabel}</TableCell>
                      <TableCell>{analysis.module}</TableCell>
                      <TableCell>{analysis.signalType}</TableCell>
                      <TableCell>
                        <Badge variant='outline' className={impactBadgeClass(analysis.impactLevel)}>
                          {analysis.impactLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className='max-w-96 whitespace-normal'>
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
                      <TableCell>{formatDate(record.reviewedAt)}</TableCell>
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
