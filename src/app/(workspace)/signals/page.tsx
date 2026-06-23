import PageContainer from '@/components/layout/page-container';
import { SignalsTable } from '@/components/signals/signals-table';

export const metadata = {
  title: '信号总表'
};

export default function SignalsPage() {
  return (
    <PageContainer
      pageTitle='信号总表'
      pageDescription='集中管理所有经过人工确认的有效产品信号。'
    >
      <SignalsTable />
    </PageContainer>
  );
}
