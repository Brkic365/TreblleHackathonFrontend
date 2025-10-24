"use client";

import { useDashboard } from '@/hooks/useDashboard';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setActiveProjectId } = useDashboard();
  const pathname = usePathname();

  // Only reset project state when we're on the main projects page (not in a specific project)
  useEffect(() => {
    if (pathname === '/projects') {
      setActiveProjectId(null);
    }
  }, [pathname, setActiveProjectId]);

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
