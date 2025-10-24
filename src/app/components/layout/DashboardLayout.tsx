"use client";

import { MainLayoutContent } from '@/app/components/layout/MainLayoutContent';
import type { LayoutProps } from '@/types';

export default function DashboardLayout({ children }: LayoutProps) {
  return (
    <MainLayoutContent>{children}</MainLayoutContent>
  );
}
