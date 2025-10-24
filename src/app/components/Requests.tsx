"use client";

import React from 'react';
import Request from './Request';
import CommonState from './CommonState';
import { RequestLog } from '@/types';
import styles from "@/styles/components/Requests.module.scss";

interface RequestsProps {
  viewMode: 'list' | 'table';
  onRequestClick?: (request: RequestLog) => void;
  requests: RequestLog[];
  isLoading?: boolean;
}

export default function Requests({ viewMode, onRequestClick, requests, isLoading }: RequestsProps) {
  const handleRequestClick = (request: RequestLog) => {
    if (onRequestClick) {
      onRequestClick(request);
    }
  };

  // Loading state
  if (isLoading) {
    return <CommonState type="loading" message="Loading requests..." />;
  }

  // Empty state
  if (!requests || requests.length === 0) {
    return (
      <CommonState 
        type="empty" 
        title="No requests found"
        message="No requests match your current filters. Try adjusting your search criteria."
        icon="📋"
      />
    );
  }

  if (viewMode === 'table') {
    return (
      <div className={styles.requestsTable}>
        <div className={styles.tableHeader}>
          <div className={styles.headerCell}>Method</div>
          <div className={styles.headerCell}>Path</div>
          <div className={styles.headerCell}>Status</div>
          <div className={styles.headerCell}>Response Time</div>
          <div className={styles.headerCell}>Timestamp</div>
        </div>
        
        <div className={styles.tableBody}>
          {requests.map((request) => (
            <div 
              key={request.id} 
              className={styles.tableRow}
              onClick={() => handleRequestClick(request)}
            >
              <div className={styles.tableCell}>
                <span 
                  className={styles.methodBadge}
                  style={{ backgroundColor: getMethodColor(request.method) }}
                >
                  {request.method}
                </span>
              </div>
              <div className={styles.tableCell}>
                <code className={styles.pathCode}>{request.path}</code>
              </div>
              <div className={styles.tableCell}>
                <span 
                  className={styles.statusCode}
                  style={{ color: getStatusCodeColor(request.statusCode) }}
                >
                  {request.statusCode}
                </span>
              </div>
              <div className={styles.tableCell}>
                <span className={styles.responseTime}>{request.responseTime}ms</span>
              </div>
              <div className={styles.tableCell}>
                <span className={styles.timestamp}>{formatTimestamp(request.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.requestsList}>
      {requests.map((request) => (
        <Request
          key={request.id}
          request={request}
          onClick={() => handleRequestClick(request)}
        />
      ))}
    </div>
  );
}

// Helper functions
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

const getStatusCodeColor = (statusCode: number) => {
  if (statusCode >= 200 && statusCode < 300) return '#059669';
  if (statusCode >= 400 && statusCode < 500) return '#D97706';
  if (statusCode >= 500) return '#DC2626';
  return '#6B7280';
};

const formatTimestamp = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    // If less than 1 minute ago
    if (diffInMinutes < 1) {
      return 'Just now';
    }
    
    // If less than 1 hour ago
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    // If less than 24 hours ago
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    }
    
    // If less than 7 days ago
    if (diffInMinutes < 10080) {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
    
    // For older dates, show formatted date with time
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  } catch (error) {
    return 'Unknown';
  }
};
