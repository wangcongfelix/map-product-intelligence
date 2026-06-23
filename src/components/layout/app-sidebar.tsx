'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { navGroups } from '@/config/nav-config';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '../icons';

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='border-b px-3 py-4 group-data-[collapsible=icon]:items-center'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip='地图产品竞品分析 Agent'
              className='h-14 gap-3 rounded-lg px-3 text-[15px] font-semibold'
            >
              <Link href='/import'>
                <span className='bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md'>
                  <Icons.logo className='size-4' />
                </span>
                <span className='flex min-w-0 flex-col leading-tight'>
                  <span className='truncate font-semibold'>地图产品竞品分析 Agent</span>
                  <span className='text-muted-foreground truncate text-[11px] font-normal'>
                    用户声音与竞品信号工作台
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden px-2 py-3'>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label || 'ungrouped'} className='py-1'>
            {group.label && (
              <SidebarGroupLabel className='px-3 text-[11px] tracking-wide text-muted-foreground/80'>
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarMenu className='gap-1.5'>
              {group.items.map((item) => {
                const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                      className={cn(
                        'h-10 gap-3 rounded-lg px-3 text-[14px] font-medium',
                        '[&_svg]:size-[18px]',
                        isActive &&
                          'bg-primary/10 text-primary ring-1 ring-primary/15 hover:bg-primary/15 hover:text-primary'
                      )}
                    >
                      <Link href={item.url}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
