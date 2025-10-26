"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import styles from '@/styles/components/DashboardNavbar.module.scss';
import {useRouter} from 'next/navigation';

interface DashboardNavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onSignOut: () => void;
  isMobileSidebarOpen?: boolean;
  onToggleMobileSidebar?: () => void;
}

export default function DashboardNavbar({ user, onSignOut, isMobileSidebarOpen, onToggleMobileSidebar }: DashboardNavbarProps) {
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <nav className={styles.dashboardNavbar}>
      <div className={styles.navbarContent}>
        {/* Mobile hamburger menu button */}
        <button 
          className={styles.mobileMenuButton}
          onClick={onToggleMobileSidebar}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className={styles.logo} onClick={() => router.push('/')}>
          <h1>RunTime</h1>
        </div>
        
        <div className={styles.userSection}>
          <button
            className={styles.userButton}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            <div className={styles.userAvatar}>
              {user.image ? (
                <img src={user.image} alt={user.name || 'User'} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name || 'User'}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
            <svg 
              className={`${styles.dropdownIcon} ${isUserMenuOpen ? styles.open : ''}`}
              width="16" 
              height="16" 
              viewBox="0 0 16 16"
            >
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {isUserMenuOpen && (
            <div className={styles.userDropdown}>
              <div className={styles.userDropdownHeader}>
                <div className={styles.userDropdownAvatar}>
                  {user.image ? (
                    <img src={user.image} alt={user.name || 'User'} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className={styles.userDropdownInfo}>
                  <span className={styles.userDropdownName}>{user.name || 'User'}</span>
                  <span className={styles.userDropdownEmail}>{user.email}</span>
                </div>
              </div>
              
              <div className={styles.userDropdownDivider} />
              
              <div className={styles.userDropdownActions}>
                
                <button className={styles.userDropdownAction} onClick={() => router.push('/settings')}>
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" fill="currentColor"/>
                  </svg>
                  Settings
                </button>
                
                <div className={styles.userDropdownDivider} />
                
                <button 
                  className={styles.userDropdownAction}
                  onClick={onSignOut}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0v2z" fill="currentColor"/>
                    <path d="M.5 8a.5.5 0 0 1 .5-.5h5.793L4.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L6.793 8.5H1a.5.5 0 0 1-.5-.5z" fill="currentColor"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay for user menu */}
      {isUserMenuOpen && (
        <div 
          className={styles.userMenuOverlay}
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </nav>
  );
}
