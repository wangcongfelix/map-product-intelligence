'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { SplitItem } from '@/types/import';

interface SplitPreviewProps {
  items: SplitItem[];
  globalWarnings: string[];
  onItemChange: (id: string, value: string) => void;
  onItemDelete: (id: string) => void;
  onReSplit: () => void;
  onBackToInput: () => void;
  onConfirmImport: () => void;
}

export function SplitPreview({
  items,
  globalWarnings,
  onItemChange,
  onItemDelete,
  onReSplit,
  onBackToInput,
  onConfirmImport
}: SplitPreviewProps) {
  const warningCount = items.filter((item) => item.warnings.length > 0).length;
  const normalCount = items.length - warningCount;

  return (
    <section className='flex min-w-0 flex-col gap-4'>
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-2'>
          <span className='bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold'>
            4
          </span>
          <h2 className='text-base font-semibold'>拆分预览与确认</h2>
        </div>
        <p className='text-muted-foreground pl-8 text-sm'>
          编辑预览结果不会覆盖最初粘贴的原始文本。
        </p>
      </div>

      <div className='grid gap-3 sm:grid-cols-3'>
          <Card className='gap-2 py-4'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>共识别</CardTitle>
            </CardHeader>
            <CardContent className='text-2xl font-semibold'>{items.length} 条</CardContent>
          </Card>
        <Card className='gap-2 py-4'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>正常</CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-semibold'>{normalCount} 条</CardContent>
        </Card>
        <Card className='gap-2 py-4'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>存在警告</CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-semibold'>{warningCount} 条</CardContent>
        </Card>
      </div>

      {globalWarnings.length > 0 && (
        <div className='bg-muted text-muted-foreground rounded-md px-3 py-2 text-sm'>
          {globalWarnings.join('；')}
        </div>
      )}

      <div className='flex flex-col gap-3'>
        {items.map((item, index) => (
          <Card key={item.id} className='overflow-hidden'>
            <CardHeader className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex min-w-0 flex-wrap items-center gap-2'>
                <CardTitle className='text-sm'>资料 {index + 1}</CardTitle>
                {item.warnings.length > 0 ? (
                  <Badge variant='outline'>存在警告</Badge>
                ) : (
                  <Badge variant='secondary'>正常</Badge>
                )}
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-muted-foreground text-xs'>{item.characterCount} 字符</span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type='button' variant='outline' size='sm'>
                      删除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认删除这条资料？</AlertDialogTitle>
                      <AlertDialogDescription>
                        删除只影响当前预览结果，不会修改你粘贴的原始文本。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onItemDelete(item.id)}>
                        确认删除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent className='flex flex-col gap-2'>
              <Textarea
                value={item.content}
                onChange={(event) => onItemChange(item.id, event.target.value)}
                className='min-h-28 resize-y'
              />
              {item.warnings.length > 0 && (
                <p className='text-muted-foreground text-xs'>{item.warnings.join('；')}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
        <Button type='button' variant='outline' className='w-full sm:w-auto' onClick={onBackToInput}>
          返回修改原始文本
        </Button>
        <Button type='button' variant='outline' className='w-full sm:w-auto' onClick={onReSplit}>
          重新按原始文本拆分
        </Button>
        <Button
          type='button'
          className='w-full sm:w-auto'
          disabled={items.length === 0}
          onClick={onConfirmImport}
        >
          确认导入
        </Button>
      </div>
    </section>
  );
}
