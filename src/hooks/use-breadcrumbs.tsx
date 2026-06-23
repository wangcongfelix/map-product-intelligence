'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/import': [{ title: '资料导入', link: '/import' }],
  '/review': [
    { title: '资料导入', link: '/import' },
    { title: '待确认', link: '/review' }
  ],
  '/signals': [
    { title: '资料导入', link: '/import' },
    { title: '信号总表', link: '/signals' }
  ],
  '/reports': [
    { title: '资料导入', link: '/import' },
    { title: '报告中心', link: '/reports' }
  ]
};

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path
      };
    });
  }, [pathname]);

  return breadcrumbs;
}
