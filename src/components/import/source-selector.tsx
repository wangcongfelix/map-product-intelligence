'use client';

import {
  IconAppWindow,
  IconBell,
  IconClipboardText,
  IconMessageCircle,
  IconNotebook,
  IconWorld
} from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SOURCE_CHANNEL_HINTS, SOURCE_CHANNEL_LABELS } from '@/lib/import/import-options';
import type { SourceChannel } from '@/types/import';

const SOURCE_META: Record<SourceChannel, { icon: typeof IconAppWindow; description: string }> = {
  app_store_review: {
    icon: IconAppWindow,
    description: '用户评分、评论和版本反馈。'
  },
  community_comment: {
    icon: IconMessageCircle,
    description: '社区讨论、路线评论和用户问答。'
  },
  release_notes: {
    icon: IconClipboardText,
    description: '版本说明、修复记录和新增能力。'
  },
  official_announcement: {
    icon: IconBell,
    description: '官网公告和正式产品动态。'
  },
  competitor_observation: {
    icon: IconNotebook,
    description: '竞品体验、产品经理观察记录。'
  },
  other: {
    icon: IconWorld,
    description: '内部访谈、线下反馈或其他来源。'
  }
};

interface SourceSelectorProps {
  sourceChannel: SourceChannel | '';
  customSourceName: string;
  error?: string;
  onSourceChannelChange: (value: SourceChannel) => void;
  onCustomSourceNameChange: (value: string) => void;
}

export function SourceSelector({
  sourceChannel,
  customSourceName,
  error,
  onSourceChannelChange,
  onCustomSourceNameChange
}: SourceSelectorProps) {
  return (
    <section className='flex min-w-0 flex-col gap-5 rounded-xl border bg-background p-4 md:p-5'>
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-3'>
          <span className='bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold'>
            2
          </span>
          <div className='min-w-0'>
            <h2 className='text-lg font-semibold'>来源配置</h2>
            <p className='text-muted-foreground text-sm'>记录资料语境，方便后续筛选和报告归因。</p>
          </div>
        </div>
      </div>

      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
        {(Object.keys(SOURCE_CHANNEL_LABELS) as SourceChannel[]).map((channel) => {
          const Icon = SOURCE_META[channel].icon;
          const selected = sourceChannel === channel;

          return (
            <button
              key={channel}
              type='button'
              className={[
                'flex min-h-24 min-w-0 items-start gap-3 rounded-xl border p-4 text-left transition-colors',
                selected
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-950 shadow-sm'
                  : 'bg-muted/20 hover:border-primary/30 hover:bg-primary/5'
              ].join(' ')}
              onClick={() => onSourceChannelChange(channel)}
            >
              <span
                className={[
                  'flex size-9 shrink-0 items-center justify-center rounded-lg',
                  selected ? 'bg-emerald-600 text-white' : 'bg-background text-muted-foreground'
                ].join(' ')}
              >
                <Icon className='size-5' aria-hidden='true' />
              </span>
              <span className='min-w-0'>
                <span className='block font-semibold'>{SOURCE_CHANNEL_LABELS[channel]}</span>
                <span className='text-muted-foreground mt-1 block text-sm leading-5'>
                  {SOURCE_META[channel].description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {sourceChannel === 'other' && (
        <div className='flex max-w-xl flex-col gap-2'>
          <Label htmlFor='custom-source-name'>
            自定义渠道名称 <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='custom-source-name'
            value={customSourceName}
            onChange={(event) => onCustomSourceNameChange(event.target.value)}
            placeholder='例如：内部访谈记录'
          />
        </div>
      )}

      {sourceChannel && (
        <p className='bg-muted/70 text-muted-foreground rounded-md border px-3 py-2 text-sm'>
          {SOURCE_CHANNEL_HINTS[sourceChannel]}
        </p>
      )}

      <div className='rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800'>
        当前模式：AI 将自动提取功能痛点、场景偏好和版本敏感信号，解析结果将推送至信号总表供审核。
      </div>

      {error && <p className='text-destructive text-sm'>{error}</p>}
    </section>
  );
}
