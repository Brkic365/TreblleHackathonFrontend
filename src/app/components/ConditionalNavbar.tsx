"use client";

import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useDashboard } from '@/hooks/useDashboard';
import Navbar from './Navbar';
import DashboardNavbar from './layout/DashboardNavbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { isMobileSidebarOpen, toggleMobileSidebar } = useDashboard();
  
  const isPublicPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname == "/";
  
  if (isPublicPage) {
    return <Navbar />;
  }
  
  if (status === "loading") {
    return null;
  }
  
  if (!session) {
    return <Navbar />;
  }
  
  return (
    <DashboardNavbar 
      user={session.user} 
      onSignOut={() => signOut()}
      isMobileSidebarOpen={isMobileSidebarOpen}
      onToggleMobileSidebar={toggleMobileSidebar}
    />
  );
}
