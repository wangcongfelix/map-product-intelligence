import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: '地图产品竞品分析 Agent',
  description: '用户声音与竞品信号工作台',
  robots: {
    index: false,
    follow: false
  }
};

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <InfobarProvider defaultOpen={false}>
          {children}
          <InfoSidebar side='right' />
        </InfobarProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
