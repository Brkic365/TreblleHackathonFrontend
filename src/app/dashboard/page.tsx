"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

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
    
    // User is authenticated, redirect to projects
    router.replace('/projects');
  }, [router, session, status]);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontSize: '1.125rem',
      color: 'white'
    }}>
      {status === 'loading' ? 'Loading...' : 'Redirecting to projects...'}
    </div>
  );
}
