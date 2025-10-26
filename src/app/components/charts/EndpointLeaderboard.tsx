"use client";

import React from 'react';
import styles from '@/styles/components/EndpointLeaderboard.module.scss';

interface EndpointData {
  endpoint: string;
  method: string;
  avgLatency: number;
  totalRequests: number;
  errorRate: number;
  lastError?: string;
  projectName?: string;
}

interface EndpointLeaderboardProps {
  title: string;
  data: EndpointData[];
  isLoading?: boolean;
  maxItems?: number;
}

export default function EndpointLeaderboard({ 
  title, 
  data, 
  isLoading = false, 
  maxItems = 5 
}: EndpointLeaderboardProps) {
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return '#059669';
      case 'POST': return '#2563EB';
      case 'PUT': return '#D97706';
      case 'DELETE': return '#DC2626';
      case 'PATCH': return '#7C3AED';
      default: return '#6B7280';
    }
  };

  const getErrorRateColor = (errorRate: number) => {
    if (errorRate === 0) return '#059669';
    if (errorRate < 5) return '#D97706';
    return '#DC2626';
  };

  const displayData = data.slice(0, maxItems);

  if (isLoading) {
    return (
      <div className={styles.leaderboardContainer}>
        <div className={styles.leaderboardHeader}>
          <h3 className={styles.leaderboardTitle}>{title}</h3>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <span>Loading endpoint data...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.leaderboardContainer}>
        <div className={styles.leaderboardHeader}>
          <h3 className={styles.leaderboardTitle}>{title}</h3>
        </div>
        <div className={styles.emptyState}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>No endpoint data available</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.leaderboardContainer}>
      <div className={styles.leaderboardHeader}>
        <h3 className={styles.leaderboardTitle}>{title}</h3>
        <div className={styles.leaderboardCount}>
          {displayData.length} of {data.length}
        </div>
      </div>
      
      <div className={styles.leaderboardContent}>
        <div className={styles.leaderboardTable}>
          <div className={styles.leaderboardTableHeader}>
            <div className={styles.leaderboardTableHeaderCell}>Endpoint</div>
            <div className={styles.leaderboardTableHeaderCell}>Project</div>
            <div className={styles.leaderboardTableHeaderCell}>Method</div>
            <div className={styles.leaderboardTableHeaderCell}>Latency</div>
            <div className={styles.leaderboardTableHeaderCell}>Requests</div>
            <div className={styles.leaderboardTableHeaderCell}>Error Rate</div>
          </div>
          
          <div className={styles.leaderboardTableBody}>
            {displayData.map((item, index) => (
              <div key={`${item.method}-${item.endpoint}`} className={styles.leaderboardTableRow}>
                <div className={styles.leaderboardTableCell} data-label="Endpoint">
                  <div className={styles.endpointInfo}>
                    <div className={styles.endpointRank}>#{index + 1}</div>
                    <code className={styles.endpointPath}>{item.endpoint}</code>
                  </div>
                </div>
                <div className={styles.leaderboardTableCell} data-label="Project">
                  <span className={styles.projectName}>
                    {item.projectName || 'Unknown'}
                  </span>
                </div>
                <div className={styles.leaderboardTableCell} data-label="Method">
                  <span 
                    className={styles.methodBadge}
                    style={{ backgroundColor: getMethodColor(item.method) }}
                  >
                    {item.method}
                  </span>
                </div>
                <div className={styles.leaderboardTableCell} data-label="Latency">
                  <span className={styles.latencyValue}>
                    {item.avgLatency}ms
                  </span>
                </div>
                <div className={styles.leaderboardTableCell} data-label="Requests">
                  <span className={styles.requestCount}>
                    {item.totalRequests.toLocaleString()}
                  </span>
                </div>
                <div className={styles.leaderboardTableCell} data-label="Error Rate">
                  <div className={styles.errorInfo}>
                    <span 
                      className={styles.errorRate}
                      style={{ color: getErrorRateColor(item.errorRate) }}
                    >
                      {item.errorRate.toFixed(2)}%
                    </span>
                    {item.lastError && (
                      <div className={styles.lastError}>
                        Last: {item.lastError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
