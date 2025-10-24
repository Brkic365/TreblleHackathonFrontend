"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useScrollLock() {
  const pathname = usePathname();

  useEffect(() => {
    // Define routes that should have scroll locked
    const lockedRoutes = [
      '/dashboard',
      '/projects',
      '/analytics', 
      '/settings',
      '/login',
      '/signup'
    ];

    // Check if current route should have scroll locked
    const shouldLockScroll = lockedRoutes.some(route => 
      pathname.startsWith(route)
    );

    // Store original overflow values
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    if (shouldLockScroll) {
      // Lock scroll
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Unlock scroll
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    // Cleanup function to restore original scroll state
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [pathname]);
}
