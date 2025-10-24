"use client";

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/pages/Settings.module.scss';
import apiClient from '@/lib/apiClient';

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}


export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // User profile data
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: session?.user?.name || 'John Doe',
    email: session?.user?.email || 'john.doe@example.com',
    avatar: session?.user?.image || '/api/placeholder/40/40',
  });

  // Password change data
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });


  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'danger', label: 'Danger Zone', icon: '⚠️' }
  ];

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    try {
      await apiClient.updateUserProfile({ name: userProfile.name });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setIsLoading(false);
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long' });
      setIsLoading(false);
      return;
    }
    
    try {
      await apiClient.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      // Clear password fields
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Password change error:', error);
      setMessage({ type: 'error', text: 'Failed to update password. Please check your current password.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const data = await apiClient.exportUserData();
      
      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `runtime-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      console.error('Data export error:', error);
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    if (!confirm('This will permanently delete all your data including projects, requests, and analytics. Are you absolutely sure?')) {
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      await apiClient.deleteAccount();
      setMessage({ type: 'success', text: 'Account deleted successfully. You will be signed out.' });
      
      // Sign out and redirect after a delay
      setTimeout(async () => {
        await signOut({ callbackUrl: '/' });
      }, 2000);
    } catch (error) {
      console.error('Account deletion error:', error);
      setMessage({ type: 'error', text: 'Failed to delete account. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };


  const renderProfileTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Profile Information</h3>
        <form onSubmit={handleProfileUpdate} className={styles.form}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <img src={userProfile.avatar} alt="Profile" />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <div className={styles.emailDisplay}>
                {userProfile.email}
              </div>
            </div>
          </div>

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Change Password</h3>
        <form onSubmit={handlePasswordChange} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              className={styles.input}
              required
              minLength={8}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              className={styles.input}
              required
              minLength={8}
            />
          </div>
          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );


  const renderDangerTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Export Data</h3>
        <div className={styles.dangerItem}>
          <div className={styles.dangerInfo}>
            <div className={styles.dangerTitle}>Export Account Data</div>
            <div className={styles.dangerDescription}>
              Download all your account data including projects, requests, and analytics
            </div>
          </div>
          <button 
            className={styles.exportButton}
            onClick={handleExportData}
            disabled={isLoading}
          >
            {isLoading ? 'Exporting...' : 'Export Data'}
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Delete Account</h3>
        <div className={styles.dangerItem}>
          <div className={styles.dangerInfo}>
            <div className={styles.dangerTitle}>Permanently Delete Account</div>
            <div className={styles.dangerDescription}>
              This action cannot be undone. All your data will be permanently deleted.
            </div>
          </div>
          <button 
            className={styles.deleteAccountButton}
            onClick={handleDeleteAccount}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'security': return renderSecurityTab();
      case 'danger': return renderDangerTab();
      default: return renderProfileTab();
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsHeader}>
        <h1 className={styles.settingsTitle}>Account Settings</h1>
        <p className={styles.settingsSubtitle}>Manage your account preferences and security settings</p>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className={styles.messageClose}>
            ×
          </button>
        </div>
      )}

      <div className={styles.settingsContent}>
        <div className={styles.settingsSidebar}>
          <nav className={styles.tabsNav}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className={styles.settingsMain}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}