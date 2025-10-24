"use client";

import React from 'react';
import styles from "@/styles/components/Request.module.scss";

interface RequestProps {
  request: {
    id: string;
    method: string;
    path: string;
    statusCode: number;
    responseTime: number;
    timestamp: string;
  };
  onClick?: () => void;
}

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

export default function Request({ request, onClick }: RequestProps) {
  return (
    <div className={styles.requestCard} onClick={onClick}>
      <div className={styles.requestMethod}>
        <span 
          className={styles.methodBadge}
          style={{ backgroundColor: getMethodColor(request.method) }}
        >
          {request.method}
        </span>
      </div>
      
      <div className={styles.requestInfo}>
        <div className={styles.requestPath}>
          <code>{request.path}</code>
        </div>
        
        <div className={styles.requestMeta}>
          <span 
            className={styles.statusCode}
            style={{ color: getStatusCodeColor(request.statusCode || 200) }}
          >
            {request.statusCode || 200}
          </span>
          <span className={styles.responseTime}>{request.responseTime || 0}ms</span>
          <span className={styles.timestamp}>{formatTimestamp(request.timestamp || new Date().toISOString())}</span>
        </div>
      </div>
    </div>
  );
}
