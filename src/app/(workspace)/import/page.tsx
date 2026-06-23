import PageContainer from '@/components/layout/page-container';
import { ImportWorkspace } from '@/components/import/import-workspace';

export const metadata = {
  title: '资料导入'
};

export default function ImportPage() {
  return (
    <PageContainer
      pageTitle='资料导入'
      pageDescription='选择地图产品与资料来源，导入用户评论、更新日志或竞品资料。'
    >
      <ImportWorkspace />
    </PageContainer>
  );
}
