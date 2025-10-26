"use client";

import React from 'react';
import styles from "@/styles/components/Endpoint.module.scss";
import { formatNormalizedPath } from '@/utils/endpointNormalization';

interface EndpointItem {
  id: string;
  method: string;
  path: string;
  avgResponseTime: number;
  errorRate: number;
  requestCount: number;
  lastRequest: string;
  status: 'healthy' | 'warning' | 'error';
}

interface EndpointProps {
  endpoint: EndpointItem;
  onClick: () => void;
}

export default function Endpoint({ endpoint, onClick }: EndpointProps) {
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return '#059669';
      case 'POST': return '#2563EB';
      case 'PUT': return '#D97706';
      case 'DELETE': return '#DC2626';
      case 'PATCH': return '#7C3AED';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#059669';
      case 'warning': return '#D97706';
      case 'error': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const formatResponseTime = (time: number) => {
    return time < 1000 ? `${time}ms` : `${(time / 1000).toFixed(1)}s`;
  };

  const formatErrorRate = (rate: number) => {
    // Cap error rate at 100%
    const cappedRate = Math.min(rate, 1);
    return `${(cappedRate * 100).toFixed(1)}%`;
  };
  
  const getStatusReason = () => {
    // Cap error rate at 100%
    const cappedErrorRate = Math.min(endpoint.errorRate, 1);
    const errorRatePercent = (cappedErrorRate * 100).toFixed(1);
    
    if (endpoint.errorRate > 0.1) {
      return `${errorRatePercent}% error rate - High failure rate`;
    } else if (endpoint.errorRate > 0) {
      return `${errorRatePercent}% error rate - Some failures detected`;
    } else {
      return 'No errors detected - All requests successful';
    }
  };

  const formatRequestCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };


  const formatLastRequest = (timestamp: string) => {
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
      
      // For older dates, show formatted date
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <div className={styles.endpoint} onClick={onClick}>
      <div className={styles.endpointHeader}>
        <div className={styles.methodPath}>
          <span 
            className={styles.method}
            style={{ backgroundColor: getMethodColor(endpoint.method) }}
          >
            {endpoint.method}
          </span>
          <span 
            className={styles.path}
            dangerouslySetInnerHTML={{ __html: formatNormalizedPath(endpoint.path) }}
          />
        </div>
        <div className={styles.statusContainer}>
          <div 
            className={styles.status}
            style={{ color: getStatusColor(endpoint.status) }}
          >
            {endpoint.status}
          </div>
          <div className={styles.statusTooltip}>
            <div className={styles.tooltipContent}>
              {getStatusReason()}
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.endpointMetrics}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Avg Response</span>
          <span className={styles.metricValue}>{formatResponseTime(endpoint.avgResponseTime)}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Error Rate</span>
          <span className={styles.metricValue}>{formatErrorRate(endpoint.errorRate)}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Requests</span>
          <span className={styles.metricValue}>{formatRequestCount(endpoint.requestCount)}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Last Request</span>
          <span className={styles.metricValue}>{formatLastRequest(endpoint.lastRequest)}</span>
        </div>
      </div>
    </div>
  );
}
