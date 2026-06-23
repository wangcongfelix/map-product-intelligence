'use client';

import { IconAdjustments, IconMap, IconMountain, IconSparkles } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  CUSTOM_PRODUCT_CATEGORY_LABELS,
  PRESET_PRODUCTS,
  PRODUCT_GROUP_LABELS
} from '@/lib/import/import-options';
import type { CustomProductCategory, ProductGroup } from '@/types/import';

const GROUP_META: Record<
  ProductGroup,
  {
    description: string;
    icon: typeof IconMap;
  }
> = {
  general_map: {
    description: '覆盖通勤、路线、搜索和城市出行体验。',
    icon: IconMap
  },
  outdoor_map: {
    description: '关注轨迹、离线地图、路线资产和户外安全。',
    icon: IconMountain
  },
  custom: {
    description: '录入新的地图、出行或内部竞品对象。',
    icon: IconAdjustments
  }
};

interface ProductSelectorProps {
  productGroup: ProductGroup | '';
  productName: string;
  customProductName: string;
  customProductCategory: CustomProductCategory;
  error?: string;
  onProductGroupChange: (value: ProductGroup) => void;
  onProductNameChange: (value: string) => void;
  onCustomProductNameChange: (value: string) => void;
  onCustomProductCategoryChange: (value: CustomProductCategory) => void;
}

export function ProductSelector({
  productGroup,
  productName,
  customProductName,
  customProductCategory,
  error,
  onProductGroupChange,
  onProductNameChange,
  onCustomProductNameChange,
  onCustomProductCategoryChange
}: ProductSelectorProps) {
  const presetProducts =
    productGroup === 'general_map' || productGroup === 'outdoor_map'
      ? PRESET_PRODUCTS[productGroup]
      : [];

  return (
    <section className='flex min-w-0 flex-col gap-5 rounded-xl border bg-background p-4 md:p-5'>
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-3'>
          <span className='bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold'>
            1
          </span>
          <div className='min-w-0'>
            <h2 className='text-lg font-semibold'>选择产品</h2>
            <p className='text-muted-foreground text-sm'>先确定产品对象，后续信号会按产品沉淀。</p>
          </div>
        </div>
      </div>

      <div className='grid gap-3 lg:grid-cols-3'>
        {(Object.keys(PRODUCT_GROUP_LABELS) as ProductGroup[]).map((group) => {
          const Icon = GROUP_META[group].icon;
          const selected = productGroup === group;

          return (
            <button
              key={group}
              type='button'
              className={[
                'flex min-h-28 min-w-0 flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors',
                selected
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-950 shadow-sm'
                  : 'bg-muted/20 hover:border-primary/30 hover:bg-primary/5'
              ].join(' ')}
              onClick={() => onProductGroupChange(group)}
            >
              <span
                className={[
                  'flex size-10 items-center justify-center rounded-lg',
                  selected ? 'bg-emerald-600 text-white' : 'bg-background text-muted-foreground'
                ].join(' ')}
              >
                <Icon className='size-5' aria-hidden='true' />
              </span>
              <span className='min-w-0'>
                <span className='block font-semibold'>{PRODUCT_GROUP_LABELS[group]}</span>
                <span className='text-muted-foreground mt-1 block text-sm leading-5'>
                  {GROUP_META[group].description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {presetProducts.length > 0 && (
        <div className='flex flex-col gap-2'>
          <Label>
            预置产品 <span className='text-destructive'>*</span>
          </Label>
          <div className='flex flex-wrap gap-2'>
            {presetProducts.map((product) => (
              <Button
                key={product}
                type='button'
                className={[
                  'rounded-full',
                  productName === product && 'border-emerald-300 bg-emerald-50 text-emerald-700'
                ]
                  .filter(Boolean)
                  .join(' ')}
                variant='outline'
                onClick={() => onProductNameChange(product)}
              >
                {productName === product && <IconSparkles className='size-4' aria-hidden='true' />}
                {product}
              </Button>
            ))}
          </div>
        </div>
      )}

      {productGroup === 'custom' && (
        <div className='grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='custom-product-name'>
              产品名称 <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='custom-product-name'
              value={customProductName}
              onChange={(event) => onCustomProductNameChange(event.target.value)}
              placeholder='例如：某城市出行小程序'
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label>所属类别</Label>
            <Select
              value={customProductCategory}
              onValueChange={(value) =>
                onCustomProductCategoryChange(value as CustomProductCategory)
              }
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.keys(CUSTOM_PRODUCT_CATEGORY_LABELS) as CustomProductCategory[]).map(
                    (category) => (
                      <SelectItem key={category} value={category}>
                        {CUSTOM_PRODUCT_CATEGORY_LABELS[category]}
                      </SelectItem>
                    )
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {error && <p className='text-destructive text-sm'>{error}</p>}
    </section>
  );
}
