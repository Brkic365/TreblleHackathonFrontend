"use client";

import { useDashboard } from '@/hooks/useDashboard';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setActiveProjectId } = useDashboard();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/analytics') {
      setActiveProjectId(null);
    }
  }, [pathname, setActiveProjectId]);

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
