'use client';

import { IconDatabaseImport, IconShieldCheck } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { SYNTHETIC_IMPORT_EXAMPLE } from '@/lib/import/import-options';
import { splitSourceText } from '@/lib/import/split-source-text';
import type { ImportMode } from '@/types/import';

interface TextImportPanelProps {
  importMode: ImportMode;
  rawInput: string;
  error?: string;
  onImportModeChange: (value: ImportMode) => void;
  onRawInputChange: (value: string, isSynthetic?: boolean) => void;
}

export function TextImportPanel({
  importMode,
  rawInput,
  error,
  onImportModeChange,
  onRawInputChange
}: TextImportPanelProps) {
  const pendingCount =
    rawInput.trim().length === 0
      ? 0
      : importMode === 'single'
        ? 1
        : splitSourceText(rawInput).items.length;

  return (
    <section className='flex min-w-0 flex-col gap-5 rounded-xl border bg-background p-4 md:p-5'>
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-3'>
          <span className='bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold'>
            3
          </span>
          <div className='min-w-0'>
            <h2 className='text-lg font-semibold'>输入资料</h2>
            <p className='text-muted-foreground text-sm'>粘贴用户声音、更新说明或竞品观察记录。</p>
          </div>
        </div>
      </div>

      <Tabs value={importMode} onValueChange={(value) => onImportModeChange(value as ImportMode)}>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <TabsList className='grid w-full grid-cols-2 sm:w-fit'>
            <TabsTrigger value='single'>单条文本</TabsTrigger>
            <TabsTrigger value='batch'>批量文本</TabsTrigger>
          </TabsList>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='w-full sm:w-auto'
            onClick={() => onRawInputChange(SYNTHETIC_IMPORT_EXAMPLE, true)}
          >
            <IconDatabaseImport className='size-4' aria-hidden='true' />
            加载示例数据
          </Button>
        </div>

        <TabsContent value='single' className='flex flex-col gap-2'>
          <Label htmlFor='single-import-text'>
            原始文本 <span className='text-destructive'>*</span>
          </Label>
          <Textarea
            id='single-import-text'
            value={rawInput}
            onChange={(event) => onRawInputChange(event.target.value, false)}
            placeholder='粘贴一条评论、更新说明或体验记录。'
            className='min-h-56 resize-y text-base leading-7'
          />
        </TabsContent>

        <TabsContent value='batch' className='flex flex-col gap-2'>
          <Label htmlFor='batch-import-text'>
            批量文本 <span className='text-destructive'>*</span>
          </Label>
          <Textarea
            id='batch-import-text'
            value={rawInput}
            onChange={(event) => onRawInputChange(event.target.value, false)}
            placeholder='可使用空行、---、1.、1、或（1）区分多条资料。'
            className='min-h-72 resize-y text-base leading-7'
          />
          <p className='text-muted-foreground text-xs'>
            支持空行、分隔线和编号拆分，普通换行会保留在单条内容内部。
          </p>
        </TabsContent>
      </Tabs>

      <div className='grid gap-3 sm:grid-cols-3'>
        <div className='rounded-lg border bg-muted/30 px-3 py-2 text-sm'>
          <span className='text-muted-foreground block'>当前字符数</span>
          <span className='text-lg font-semibold tabular-nums'>{rawInput.length}</span>
        </div>
        <div className='rounded-lg border bg-muted/30 px-3 py-2 text-sm'>
          <span className='text-muted-foreground block'>预计导入</span>
          <span className='text-lg font-semibold tabular-nums'>{pendingCount} 条</span>
        </div>
        <div className='flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground'>
          <IconShieldCheck className='size-4 shrink-0' aria-hidden='true' />
          内容仅用于本次导入，不参与 AI 训练
        </div>
      </div>

      {rawInput.includes('synthetic_test_case') && (
        <p className='rounded-md border border-dashed px-3 py-2 text-sm'>
          当前内容包含示例数据 / synthetic_test_case，仅用于本地测试。
        </p>
      )}

      {error && <p className='text-destructive text-sm'>{error}</p>}
    </section>
  );
}
