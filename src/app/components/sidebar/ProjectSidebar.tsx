"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { PROJECT_TABS } from '@/constants/sidebar';
import apiClient, { BackendProject } from '@/lib/apiClient';
import type { ProjectSidebarProps, Project } from '@/types';
import styles from '@/styles/components/ProjectSidebar.module.scss';

export function ProjectSidebar({ projectId }: ProjectSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isProjectSwitcherOpen, setIsProjectSwitcherOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch user's projects from API (optional - will use fallback if fails)
  const { data: backendProjects } = useSWR(
    'user-projects',
    () => apiClient.getProjects(),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  // Convert backend projects to frontend format
  const projects: Project[] = React.useMemo(() => 
    backendProjects?.map((backendProject: BackendProject) => ({
      id: backendProject.id,
      name: backendProject.name,
      status: 'healthy' as const, // You can determine this based on your business logic
      avgResponseTime: '120ms', // Default value - you can calculate this from request logs
      errors24h: 0, // Default value - you can calculate this from request logs
      proxyUrl: backendProject.proxyUrl,
      apiRoute: backendProject.originalBaseUrl,
      createdAt: backendProject.createdAt,
      totalRequests: backendProject._count?.apiRequestLogs || 0,
    })) || [], [backendProjects]
  );

  useEffect(() => {
    const project = projects.find(p => p.id === projectId);
    setCurrentProject(project || null);
  }, [projectId, projects]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProjectSwitcherOpen) {
        const target = event.target as Element;
        if (!target.closest(`.${styles.projectSwitcher}`)) {
          setIsProjectSwitcherOpen(false);
          setSearchQuery('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProjectSwitcherOpen]);

  const handleProjectSwitch = (newProjectId: string): void => {
    setIsProjectSwitcherOpen(false);
    setSearchQuery('');
    const currentTab = pathname.split('/').pop() || 'overview';
    router.push(`/projects/${newProjectId}/${currentTab}`);
  };

  const getStatusColor = (status: string): string => {
    return status === 'healthy' ? '#10B981' : '#EF4444';
  };

  const isActiveTab = (tabId: string): boolean => {
    return pathname.endsWith(tabId);
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Always show navigation with fallback data
  const displayProject = currentProject || {
    id: projectId,
    name: `Project ${projectId}`,
    status: 'healthy' as const,
    avgResponseTime: '120ms',
    errors24h: 0,
    proxyUrl: 'https://proxy.example.com',
    apiRoute: 'api.example.com',
    createdAt: new Date().toISOString(),
    totalRequests: 0,
  };

  return (
    <aside className={styles.projectSidebar}>
      {/* Project Context Header */}
      <div className={styles.projectHeader}>
        <div className={styles.projectSwitcher}>
          <button 
            className={styles.switcherButton}
            onClick={() => setIsProjectSwitcherOpen(!isProjectSwitcherOpen)}
          >
              <span className={styles.projectName}>{displayProject.name}</span>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {isProjectSwitcherOpen && (
            <div className={styles.projectDropdown}>
              <div className={styles.searchContainer}>
                <div className={styles.searchInputWrapper}>
                  <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" fill="currentColor"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsProjectSwitcherOpen(false);
                        setSearchQuery('');
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className={styles.projectList}>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <button
                      key={project.id}
                      className={`${styles.projectOption} ${project.id === projectId ? styles.active : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleProjectSwitch(project.id);
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <div className={styles.projectOptionInfo}>
                        <span className={styles.projectOptionName}>{project.name}</span>
                        <div className={styles.projectOptionMeta}>
                          <div 
                            className={styles.statusDot} 
                            style={{ backgroundColor: getStatusColor(project.status) }}
                          />
                          <span className={styles.projectOptionStatus}>
                            {project.status === 'healthy' ? 'Healthy' : 'Issues'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className={styles.noResults}>
                    <span>No projects found</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.projectInfo}>
          <div className={styles.projectDetails}>
                <div className={styles.projectApiRoute}>
                  <span className={styles.apiRouteLabel}>API Route:</span>
                  <span className={styles.apiRouteValue}>{displayProject.apiRoute || 'api.example.com'}</span>
                </div>
                <div className={styles.projectStatus}>
                  <div 
                    className={styles.statusIndicator} 
                    style={{ backgroundColor: getStatusColor(displayProject.status) }}
                  />
                  <span className={styles.statusText}>
                    {displayProject.status === 'healthy' ? 'Healthy' : 'Issues'}
                  </span>
                </div>
          </div>
        </div>
      </div>

      {/* Project Navigation */}
      <nav className={styles.projectSidebarNav}>
        {PROJECT_TABS.map((tab) => {
          const href = tab.href.replace('[projectId]', projectId);
          return (
            <Link
              key={tab.id}
              href={href}
              className={`${styles.projectTabLink} ${isActiveTab(tab.id) ? styles.active : ''}`}
            >
              <span className={styles.projectTabIcon}>{tab.icon}</span>
              <span className={styles.projectTabLabel}>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
