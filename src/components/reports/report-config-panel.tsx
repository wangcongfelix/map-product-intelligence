'use client';

import { IconDownload, IconFileChart, IconFileText } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_REPORT_TITLE, REPORT_TYPES } from '@/types/report';
import type { ReportTimeRange, ReportType } from '@/types/report';

export interface ReportConfigState {
  title: string;
  reportType: ReportType;
  timeRange: ReportTimeRange;
  productName: string;
  module: string;
  impactLevel: string;
  recommendedAction: string;
  provider: 'all' | 'mock' | 'deepseek';
  note: string;
}

interface ReportConfigPanelProps {
  config: ReportConfigState;
  products: string[];
  modules: string[];
  canGenerate: boolean;
  canExportCharts: boolean;
  canDownloadMarkdown: boolean;
  onChange: (patch: Partial<ReportConfigState>) => void;
  onGenerate: () => void;
  onExportCharts: () => void;
  onDownloadMarkdown: () => void;
}

export const DEFAULT_REPORT_CONFIG: ReportConfigState = {
  title: DEFAULT_REPORT_TITLE,
  reportType: '用户声音阶段分析',
  timeRange: 'all',
  productName: 'all',
  module: 'all',
  impactLevel: 'all',
  recommendedAction: 'all',
  provider: 'all',
  note: ''
};

export function ReportConfigPanel({
  config,
  products,
  modules,
  canGenerate,
  canExportCharts,
  canDownloadMarkdown,
  onChange,
  onGenerate,
  onExportCharts,
  onDownloadMarkdown
}: ReportConfigPanelProps) {
  return (
    <Card className='overflow-hidden'>
      <CardContent className='grid gap-4 p-4 md:p-5'>
        <div className='grid gap-3 lg:grid-cols-6'>
          <div className='grid gap-2'>
            <Label>报告类型</Label>
            <Select
              value={config.reportType}
              onValueChange={(reportType: ReportType) => onChange({ reportType })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2'>
            <Label>时间范围</Label>
            <Select
              value={config.timeRange}
              onValueChange={(timeRange: ReportTimeRange) => onChange({ timeRange })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>全部时间</SelectItem>
                <SelectItem value='last7days'>最近 7 天</SelectItem>
                <SelectItem value='last30days'>最近 30 天</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2'>
            <Label>产品筛选</Label>
            <Select
              value={config.productName}
              onValueChange={(productName) => onChange({ productName })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>全部产品</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product} value={product}>
                    {product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2'>
            <Label>模块筛选</Label>
            <Select value={config.module} onValueChange={(module) => onChange({ module })}>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>全部模块</SelectItem>
                {modules.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2'>
            <Label>分析来源</Label>
            <Select
              value={config.provider}
              onValueChange={(provider: ReportConfigState['provider']) => onChange({ provider })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>全部来源</SelectItem>
                <SelectItem value='mock'>Mock AI</SelectItem>
                <SelectItem value='deepseek'>DeepSeek</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='grid content-end'>
            <Button type='button' onClick={onGenerate} disabled={!canGenerate}>
              <IconFileText className='size-4' aria-hidden='true' />
              生成报告
            </Button>
          </div>
        </div>

        <div className='grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]'>
          <div className='grid gap-2'>
            <Label htmlFor='report-title'>报告标题</Label>
            <Input
              id='report-title'
              value={config.title}
              onChange={(event) => onChange({ title: event.target.value })}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='report-note'>报告备注</Label>
            <Textarea
              id='report-note'
              value={config.note}
              onChange={(event) => onChange({ note: event.target.value })}
              placeholder='本期背景或汇报对象'
              className='min-h-9 resize-none'
            />
          </div>
          <div className='grid content-end'>
            <Button
              type='button'
              variant='outline'
              onClick={onExportCharts}
              disabled={!canExportCharts}
            >
              <IconFileChart className='size-4' aria-hidden='true' />
              导出图表 PNG
            </Button>
          </div>
          <div className='grid content-end'>
            <Button
              type='button'
              variant='outline'
              onClick={onDownloadMarkdown}
              disabled={!canDownloadMarkdown}
            >
              <IconDownload className='size-4' aria-hidden='true' />
              下载 Markdown
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
