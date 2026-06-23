import PageContainer from '@/components/layout/page-container';
import { ReviewWorkspace } from '@/components/review/review-workspace';

export const metadata = {
  title: '待确认'
};

export default function ReviewPage() {
  return (
    <PageContainer
      pageTitle='待确认'
      pageDescription='批量生成 DeepSeek 或 Mock AI 预分析结果，并快速通过、修改或忽略。'
    >
      <ReviewWorkspace />
    </PageContainer>
  );
}
