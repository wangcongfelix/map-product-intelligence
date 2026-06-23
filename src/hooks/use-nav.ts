'use client';

import { useMemo } from 'react';
import type { NavGroup, NavItem } from '@/types';

export function useFilteredNavItems(items: NavItem[]) {
  return useMemo(() => items.filter((item) => !item.disabled), [items]);
}

export function useFilteredNavGroups(groups: NavGroup[]) {
  return useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => !item.disabled)
        }))
        .filter((group) => group.items.length > 0),
    [groups]
  );
}
