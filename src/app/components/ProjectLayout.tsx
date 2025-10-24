"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import styles from "@/styles/components/ProjectLayout.module.scss";
import apiClient, { BackendProject } from '@/lib/apiClient';
import { ProjectLayoutProps } from '@/types';

interface ProjectTab {
  id: string;
  label: string;
  href: string;
  icon: string;
}

const projectTabs: ProjectTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/projects/[projectId]/overview',
    icon: '📊'
  },
  {
    id: 'requests',
    label: 'Requests',
    href: '/projects/[projectId]/requests',
    icon: '📋'
  },
  {
    id: 'security',
    label: 'Security',
    href: '/projects/[projectId]/security',
    icon: '🔒'
  },
  {
    id: 'endpoints',
    label: 'Endpoints',
    href: '/projects/[projectId]/endpoints',
    icon: '🔗'
  },
  {
    id: 'api',
    label: 'API',
    href: '/projects/[projectId]/api',
    icon: '⚙️'
  }
];

export default function ProjectLayout({ children, projectId }: ProjectLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isProjectSwitcherOpen, setIsProjectSwitcherOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<BackendProject | null>(null);

  // Fetch projects data
  const { data: backendProjects, error } = useSWR('projects', () => apiClient.getProjects());

  useEffect(() => {
    if (backendProjects) {
      // Find the current project
      const project = backendProjects.find(p => p.id === projectId);
      setCurrentProject(project || null);
    }
  }, [backendProjects, projectId]);

  const handleProjectSwitch = (newProjectId: string) => {
    setIsProjectSwitcherOpen(false);
    // Navigate to the same tab but for the new project
    const currentTab = pathname.split('/').pop() || 'overview';
    router.push(`/projects/${newProjectId}/${currentTab}`);
  };

  const getStatusColor = (status: string) => {
    return status === 'healthy' ? '#10B981' : '#EF4444';
  };

  const isActiveTab = (tabId: string) => {
    return pathname.includes(`/${tabId}`);
  };

  const getTabHref = (tab: ProjectTab) => {
    return tab.href.replace('[projectId]', projectId);
  };

  return (
    <div className={styles.projectLayout}>
      {/* Project Header */}
      <div className={styles.projectHeader}>
        <div className={styles.projectInfo}>
          <div className={styles.projectSwitcher}>
            <button
              className={styles.projectSwitcherButton}
              onClick={() => setIsProjectSwitcherOpen(!isProjectSwitcherOpen)}
            >
              <span className={styles.projectName}>
                {currentProject?.name || 'Loading...'}
              </span>
              <span className={styles.projectStatus} style={{ color: getStatusColor(currentProject?._count?.apiRequestLogs ? 'healthy' : 'error') }}>
                ●
              </span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {isProjectSwitcherOpen && (
              <div className={styles.projectSwitcherDropdown}>
                <div className={styles.projectSwitcherHeader}>
                  <h3>Switch Project</h3>
                  <button
                    className={styles.closeButton}
                    onClick={() => setIsProjectSwitcherOpen(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className={styles.projectList}>
                  {backendProjects?.map((project) => (
                    <button
                      key={project.id}
                      className={`${styles.projectItem} ${project.id === projectId ? styles.active : ''}`}
                      onClick={() => handleProjectSwitch(project.id)}
                    >
                      <div className={styles.projectItemInfo}>
                        <span className={styles.projectItemName}>{project.name}</span>
                        <span className={styles.projectItemStatus} style={{ color: getStatusColor(project._count?.apiRequestLogs ? 'healthy' : 'error') }}>
                          ● {project._count?.apiRequestLogs ? 'healthy' : 'error'}
                        </span>
                      </div>
                      <div className={styles.projectItemStats}>
                        <span>{project._count?.apiRequestLogs?.toLocaleString() || 0} requests</span>
                        <span>120ms</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Navigation */}
      <nav className={styles.projectNavigation}>
        {projectTabs.map((tab) => (
          <Link
            key={tab.id}
            href={getTabHref(tab)}
            className={`${styles.projectTab} ${isActiveTab(tab.id) ? styles.active : ''}`}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </Link>
        ))}
      </nav>

      {/* Project Content */}
      <div className={styles.projectContent}>
        {children}
      </div>
    </div>
  );
}