import type { SidebarItem, ProjectTab } from '@/types';

export const GLOBAL_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: 'projects',
    label: 'Projects',
    href: '/projects',
    icon: '📊'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/analytics',
    icon: '📈'
  },
  {
    id: 'settings',
    label: 'Account Settings',
    href: '/settings',
    icon: '⚙️'
  }
];

export const PROJECT_TABS: ProjectTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/projects/[projectId]/overview',
    icon: '📊'
  },
  {
    id: 'api',
    label: 'API',
    href: '/projects/[projectId]/api',
    icon: '🔌'
  },
  {
    id: 'requests',
    label: 'Requests',
    href: '/projects/[projectId]/requests',
    icon: '📋'
  },
  {
    id: 'endpoints',
    label: 'Endpoints',
    href: '/projects/[projectId]/endpoints',
    icon: '🔗'
  }
];
