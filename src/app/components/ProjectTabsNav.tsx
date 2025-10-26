"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PROJECT_TABS } from '@/constants/sidebar';
import styles from '@/styles/components/ProjectTabsNav.module.scss';

interface ProjectTabsNavProps {
  projectId: string;
}

export default function ProjectTabsNav({ projectId }: ProjectTabsNavProps) {
  const pathname = usePathname();

  const isActiveTab = (tabId: string): boolean => {
    return pathname.endsWith(tabId);
  };

  return (
    <nav className={styles.projectTabsNav}>
      <div className={styles.tabsContainer}>
        {PROJECT_TABS.map((tab) => {
          const href = tab.href.replace('[projectId]', projectId);
          return (
            <Link
              key={tab.id}
              href={href}
              className={`${styles.tabLink} ${isActiveTab(tab.id) ? styles.active : ''}`}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

