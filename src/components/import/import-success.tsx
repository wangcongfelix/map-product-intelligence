'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ImportSuccessProps {
  count: number;
  onContinue: () => void;
  onViewReview: () => void;
}

export function ImportSuccess({ count, onContinue, onViewReview }: ImportSuccessProps) {
  return (
    <Card className='border-primary/30 bg-primary/5'>
      <CardContent className='flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <p className='font-medium'>已导入 {count} 条资料，当前状态为“待分析”。</p>
          <p className='text-muted-foreground text-sm'>你可以继续导入，或前往待确认页面查看。</p>
        </div>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <Button type='button' variant='outline' className='w-full sm:w-auto' onClick={onContinue}>
            继续导入
          </Button>
          <Button type='button' className='w-full sm:w-auto' onClick={onViewReview}>
            查看待确认页面
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
