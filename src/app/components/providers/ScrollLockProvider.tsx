"use client";

import { ReactNode } from 'react';
import { useScrollLock } from '@/hooks/useScrollLock';

interface ScrollLockProviderProps {
  children: ReactNode;
}

export default function ScrollLockProvider({ children }: ScrollLockProviderProps) {
  useScrollLock();
  return <>{children}</>;
}
