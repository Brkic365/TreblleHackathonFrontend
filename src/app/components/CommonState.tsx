"use client";

import React from 'react';
import styles from '@/styles/components/CommonStates.module.scss';

interface CommonStateProps {
  type: 'loading' | 'error' | 'empty';
  title?: string;
  message?: string;
  onRetry?: () => void;
  icon?: string;
}

export default function CommonState({ 
  type, 
  title, 
  message, 
  onRetry, 
  icon 
}: CommonStateProps) {
  if (type === 'loading') {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>{message || 'Loading...'}</p>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorIcon}>{icon || '⚠️'}</div>
        <h3>{title || 'Something went wrong'}</h3>
        <p>{message || 'There was an error loading the data. Please try again.'}</p>
        {onRetry && (
          <button className={styles.retryButton} onClick={onRetry}>
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (type === 'empty') {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>{icon || '📭'}</div>
        <h3>{title || 'No data found'}</h3>
        <p>{message || 'There is no data to display at the moment.'}</p>
      </div>
    );
  }

  return null;
}
