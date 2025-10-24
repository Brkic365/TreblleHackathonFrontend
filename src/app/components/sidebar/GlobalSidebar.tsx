"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDashboard } from '@/hooks/useDashboard';
import { GLOBAL_SIDEBAR_ITEMS } from '@/constants/sidebar';
import styles from '@/styles/components/GlobalSidebar.module.scss';

export function GlobalSidebar() {
  const pathname = usePathname();
  const { isGlobalSidebarCollapsed } = useDashboard();

  const isActiveItem = (href: string): boolean => {
    if (href === '/projects') {
      return pathname.startsWith('/projects');
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className={`${styles.globalSidebar} ${isGlobalSidebarCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarContent}>
        <nav className={styles.sidebarNav}>
          {GLOBAL_SIDEBAR_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`${styles.sidebarItem} ${isActiveItem(item.href) ? styles.active : ''}`}
              title={isGlobalSidebarCollapsed ? item.label : undefined}
            >
              <span className={styles.sidebarIcon}>{item.icon}</span>
              <span className={styles.sidebarLabel}>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
