'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { IconCheck } from '@tabler/icons-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductSelector } from './product-selector';
import { SourceSelector } from './source-selector';
import { TextImportPanel } from './text-import-panel';
import { SplitPreview } from './split-preview';
import { ImportSuccess } from './import-success';
import { splitSourceText } from '@/lib/import/split-source-text';
import { useImportStore, DEFAULT_IMPORT_DRAFT } from '@/stores/import-store';
import type {
  CustomProductCategory,
  ImportBatch,
  ImportDraft,
  ImportMode,
  ProductGroup,
  RawSignal,
  SourceChannel,
  SplitItem
} from '@/types/import';

interface FormErrors {
  product?: string;
  source?: string;
  input?: string;
}

interface ImportFormState extends ImportDraft {}

function createId(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}-${random}`;
}

function createSingleSplitItem(content: string): SplitItem {
  const trimmed = content.trim();
  return {
    id: createId('split'),
    content: trimmed,
    characterCount: trimmed.length,
    warnings: trimmed.length < 8 ? ['内容长度过短'] : []
  };
}

function refreshItemWarnings(items: SplitItem[]): SplitItem[] {
  const duplicateMap = new Map<string, number[]>();
  const baseItems = items
    .map((item) => ({
      ...item,
      content: item.content.trim(),
      characterCount: item.content.trim().length,
      warnings: item.content.trim().length < 8 ? ['内容长度过短'] : []
    }))
    .filter((item) => item.content.length > 0);

  baseItems.forEach((item, index) => {
    const indexes = duplicateMap.get(item.content) ?? [];
    indexes.push(index);
    duplicateMap.set(item.content, indexes);
  });

  duplicateMap.forEach((indexes) => {
    if (indexes.length <= 1) return;

    indexes.forEach((index) => {
      baseItems[index].warnings.push('检测到完全重复资料');
    });
  });

  return baseItems;
}

function resolveProductName(form: ImportFormState): string {
  return form.productGroup === 'custom' ? form.customProductName.trim() : form.productName.trim();
}

function validateForm(form: ImportFormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.productGroup) {
    errors.product = '请选择产品类型。';
  } else if (!resolveProductName(form)) {
    errors.product =
      form.productGroup === 'custom' ? '请填写自定义产品名称。' : '请选择一个预置产品。';
  }

  if (!form.sourceChannel) {
    errors.source = '请选择资料来源。';
  } else if (form.sourceChannel === 'other' && !form.customSourceName.trim()) {
    errors.source = '请填写自定义渠道名称。';
  }

  if (!form.rawInput.trim()) {
    errors.input = '请粘贴需要导入的资料。';
  }

  return errors;
}

function StepPill({
  index,
  title,
  description,
  complete,
  active
}: {
  index: number;
  title: string;
  description: string;
  complete: boolean;
  active: boolean;
}) {
  return (
    <div
      className={[
        'flex min-w-0 items-center gap-3 rounded-xl border p-3 transition-colors',
        complete
          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
          : active
            ? 'border-primary/30 bg-primary/5'
            : 'bg-background'
      ].join(' ')}
    >
      <span
        className={[
          'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
          complete
            ? 'bg-emerald-600 text-white'
            : active
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
        ].join(' ')}
      >
        {complete ? <IconCheck className='size-4' aria-hidden='true' /> : index}
      </span>
      <span className='min-w-0'>
        <span className='block text-sm font-semibold'>{title}</span>
        <span className='text-muted-foreground block truncate text-xs'>{description}</span>
      </span>
    </div>
  );
}

export function ImportWorkspace() {
  const router = useRouter();
  const { currentDraft, addImportBatch, resetCurrentDraft, setCurrentDraft } = useImportStore();
  const [form, setForm] = React.useState<ImportFormState>(DEFAULT_IMPORT_DRAFT);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [previewItems, setPreviewItems] = React.useState<SplitItem[]>([]);
  const [previewWarnings, setPreviewWarnings] = React.useState<string[]>([]);
  const [lastImportCount, setLastImportCount] = React.useState(0);
  const [draftLoaded, setDraftLoaded] = React.useState(false);

  React.useEffect(() => {
    if (draftLoaded) return;
    setForm(currentDraft);
    setDraftLoaded(true);
  }, [currentDraft, draftLoaded]);

  function updateForm(patch: Partial<ImportFormState>): void {
    setForm((current) => {
      const next = { ...current, ...patch };
      setCurrentDraft(next);
      return next;
    });
  }

  function handleProductGroupChange(productGroup: ProductGroup): void {
    updateForm({
      productGroup,
      productName: '',
      customProductName: productGroup === 'custom' ? form.customProductName : ''
    });
    setErrors((current) => ({ ...current, product: undefined }));
  }

  function handleProductNameChange(productName: string): void {
    updateForm({ productName });
    setErrors((current) => ({ ...current, product: undefined }));
  }

  function handleCustomProductNameChange(customProductName: string): void {
    updateForm({ customProductName });
    setErrors((current) => ({ ...current, product: undefined }));
  }

  function handleCustomProductCategoryChange(customProductCategory: CustomProductCategory): void {
    updateForm({ customProductCategory });
  }

  function handleSourceChannelChange(sourceChannel: SourceChannel): void {
    updateForm({
      sourceChannel,
      customSourceName: sourceChannel === 'other' ? form.customSourceName : ''
    });
    setErrors((current) => ({ ...current, source: undefined }));
  }

  function handleImportModeChange(importMode: ImportMode): void {
    updateForm({ importMode, isSynthetic: false });
    setPreviewItems([]);
    setPreviewWarnings([]);
  }

  function handleRawInputChange(rawInput: string, isSynthetic = false): void {
    updateForm({ rawInput, isSynthetic });
    setErrors((current) => ({ ...current, input: undefined }));
    setPreviewItems([]);
    setPreviewWarnings([]);
  }

  function handlePreview(): void {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (form.importMode === 'single') {
      setPreviewItems(refreshItemWarnings([createSingleSplitItem(form.rawInput)]));
      setPreviewWarnings([]);
      return;
    }

    const result = splitSourceText(form.rawInput);
    setPreviewItems(result.items);
    setPreviewWarnings(result.warnings);
  }

  function handleItemChange(id: string, value: string): void {
    setPreviewItems((items) =>
      refreshItemWarnings(
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                content: value
              }
            : item
        )
      )
    );
  }

  function handleItemDelete(id: string): void {
    setPreviewItems((items) => refreshItemWarnings(items.filter((item) => item.id !== id)));
    toast.success('已删除当前预览条目');
  }

  function handleConfirmImport(): void {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || previewItems.length === 0) {
      return;
    }

    const now = new Date().toISOString();
    const batchId = createId('batch');
    const productName = resolveProductName(form);
    const batch: ImportBatch = {
      id: batchId,
      productGroup: form.productGroup as ProductGroup,
      productName,
      sourceChannel: form.sourceChannel as SourceChannel,
      customSourceName:
        form.sourceChannel === 'other' ? form.customSourceName.trim() || undefined : undefined,
      importMode: form.importMode,
      rawInput: form.rawInput,
      itemCount: previewItems.length,
      createdAt: now
    };

    const signals: RawSignal[] = previewItems.map((item) => ({
      id: createId('raw-signal'),
      batchId,
      productGroup: form.productGroup as ProductGroup,
      productName,
      sourceChannel: form.sourceChannel as SourceChannel,
      customSourceName:
        form.sourceChannel === 'other' ? form.customSourceName.trim() || undefined : undefined,
      rawContent: item.content,
      status: 'pending_analysis',
      isSynthetic: form.isSynthetic || form.rawInput.includes('synthetic_test_case'),
      importedAt: now
    }));

    addImportBatch(batch, signals);
    setLastImportCount(signals.length);
    setPreviewItems([]);
    setPreviewWarnings([]);
    toast.success(`已导入 ${signals.length} 条资料，当前状态为“待分析”。`);
  }

  function handleContinueImport(): void {
    setForm(DEFAULT_IMPORT_DRAFT);
    setPreviewItems([]);
    setPreviewWarnings([]);
    setLastImportCount(0);
    setErrors({});
    resetCurrentDraft();
  }

  const hasProduct = Boolean(form.productGroup && resolveProductName(form));
  const hasSource = Boolean(
    form.sourceChannel && (form.sourceChannel !== 'other' || form.customSourceName.trim())
  );
  const hasInput = Boolean(form.rawInput.trim());

  return (
    <div className='flex min-w-0 flex-col gap-4'>
      <div className='grid gap-3 lg:grid-cols-3'>
        <StepPill
          index={1}
          title='选择产品'
          description='确认地图产品和业务类型'
          complete={hasProduct}
          active={!hasProduct}
        />
        <StepPill
          index={2}
          title='来源配置'
          description='记录资料来自哪里'
          complete={hasSource}
          active={hasProduct && !hasSource}
        />
        <StepPill
          index={3}
          title='输入资料'
          description='粘贴文本并预览拆分'
          complete={hasInput}
          active={hasProduct && hasSource}
        />
      </div>

      <Card className='overflow-hidden'>
        <CardContent className='flex flex-col gap-6 p-4 md:p-6'>
          <ProductSelector
            productGroup={form.productGroup}
            productName={form.productName}
            customProductName={form.customProductName}
            customProductCategory={form.customProductCategory}
            error={errors.product}
            onProductGroupChange={handleProductGroupChange}
            onProductNameChange={handleProductNameChange}
            onCustomProductNameChange={handleCustomProductNameChange}
            onCustomProductCategoryChange={handleCustomProductCategoryChange}
          />
          <SourceSelector
            sourceChannel={form.sourceChannel}
            customSourceName={form.customSourceName}
            error={errors.source}
            onSourceChannelChange={handleSourceChannelChange}
            onCustomSourceNameChange={(customSourceName) => updateForm({ customSourceName })}
          />
          <TextImportPanel
            importMode={form.importMode}
            rawInput={form.rawInput}
            error={errors.input}
            onImportModeChange={handleImportModeChange}
            onRawInputChange={handleRawInputChange}
          />
          <div className='border-t pt-4'>
            <Button type='button' className='w-full sm:w-auto' onClick={handlePreview}>
              预览拆分结果
            </Button>
          </div>
        </CardContent>
      </Card>

      {previewItems.length > 0 && (
        <SplitPreview
          items={previewItems}
          globalWarnings={previewWarnings}
          onItemChange={handleItemChange}
          onItemDelete={handleItemDelete}
          onReSplit={handlePreview}
          onBackToInput={() => {
            setPreviewItems([]);
            setPreviewWarnings([]);
          }}
          onConfirmImport={handleConfirmImport}
        />
      )}

      {lastImportCount > 0 && (
        <ImportSuccess
          count={lastImportCount}
          onContinue={handleContinueImport}
          onViewReview={() => router.push('/review')}
        />
      )}
    </div>
  );
}
