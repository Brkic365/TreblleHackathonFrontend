"use client";

import React, { createContext, useState, ReactNode } from 'react';
import type { DashboardContextType } from '@/types';

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Create the provider component
export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [isGlobalSidebarCollapsed, setCollapsed] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleGlobalSidebar = () => {
    // Prevent un-collapsing if a project is active
    if (activeProjectId) return;
    setCollapsed(prev => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
  };

  // This function is the core logic: when a project is selected,
  // we update the active ID and force the global sidebar to collapse.
  const handleSetActiveProjectId = (projectId: string | null) => {
    setActiveProjectId(projectId);
    if (projectId) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  };

  return (
    <DashboardContext.Provider value={{
      isGlobalSidebarCollapsed,
      toggleGlobalSidebar,
      activeProjectId,
      setActiveProjectId: handleSetActiveProjectId,
      isMobileSidebarOpen,
      toggleMobileSidebar,
      setIsMobileSidebarOpen,
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export { DashboardContext };