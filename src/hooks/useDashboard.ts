import { useContext } from 'react';
import { DashboardContext } from '@/context/DashboardContext';
import type { DashboardContextType } from '@/types';

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
