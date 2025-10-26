"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useDashboard } from '@/hooks/useDashboard';
import { GlobalSidebar } from '@/app/components/sidebar/GlobalSidebar';
import { ProjectSidebar } from '@/app/components/sidebar/ProjectSidebar';
import type { LayoutProps } from '@/types';
import styles from '@/styles/layout/MainLayoutContent.module.scss';

export function MainLayoutContent({ children }: LayoutProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isGlobalSidebarCollapsed, activeProjectId, isMobileSidebarOpen, setIsMobileSidebarOpen } = useDashboard();

  // Authentication protection
  useEffect(() => {
    if (status === 'loading') {
      // Still loading, don't redirect yet
      return;
    }
    
    if (status === 'unauthenticated' || !session) {
      // User is not authenticated, redirect to login
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (status === 'unauthenticated' || !session) {
    return null;
  }

  const handleLogout = (): void => {
    // TODO: Implement actual logout logic
    router.push('/login');
  };

  return (
    <div className={styles.dashboardLayout}>
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div 
          className={styles.mobileOverlay}
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div
        className={styles.dashboardGrid}
        data-l1-collapsed={isGlobalSidebarCollapsed}
        data-l2-visible={!!activeProjectId}
        data-mobile-open={isMobileSidebarOpen}
      >
        <div onClick={() => setIsMobileSidebarOpen(false)}>
          <GlobalSidebar />
        </div>

        {/* The ProjectSidebar is only rendered when a project is active */}
        {activeProjectId && (
          <div onClick={() => setIsMobileSidebarOpen(false)}>
            <ProjectSidebar projectId={activeProjectId} />
          </div>
        )}

        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
