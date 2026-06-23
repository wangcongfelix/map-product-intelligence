import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: '工作台',
    items: [
      {
        title: '资料导入',
        url: '/import',
        icon: 'upload',
        items: []
      },
      {
        title: '待确认',
        url: '/review',
        icon: 'checks',
        items: []
      },
      {
        title: '信号总表',
        url: '/signals',
        icon: 'signals',
        items: []
      },
      {
        title: '报告中心',
        url: '/reports',
        icon: 'reports',
        items: []
      }
    ]
  }
];
