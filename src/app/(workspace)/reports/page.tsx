import PageContainer from '@/components/layout/page-container';
import { ReportWorkspace } from '@/components/reports/report-workspace';

export const metadata = {
  title: '报告中心'
};

export default function ReportsPage() {
  return (
    <PageContainer
      pageTitle='报告中心'
      pageDescription='从已确认的正式信号中筛选、勾选，并生成图表、关键汇总表和 Markdown 报告。'
    >
      <ReportWorkspace />
    </PageContainer>
  );
}
