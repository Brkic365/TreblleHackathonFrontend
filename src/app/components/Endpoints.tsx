"use client";

import React from 'react';
import Endpoint from './Endpoint';
import CommonState from './CommonState';
import styles from "@/styles/components/Endpoints.module.scss";
import { EndpointItem } from '@/types';
import { groupEndpointsByNormalizedPath, formatNormalizedPath } from '@/utils/endpointNormalization';

interface GroupedEndpoint {
  method: string;
  path: string;
  normalizedPath: string;
  count: number;
  avgResponseTime: number;
  errorRate: number;
  requestCount: number;
  lastRequest: string;
  status: 'healthy' | 'warning' | 'error';
  originalEndpoints: EndpointItem[];
}

interface EndpointsProps {
  endpoints: EndpointItem[];
  onEndpointClick: (endpoint: EndpointItem) => void;
  viewMode: 'list' | 'table';
  isLoading?: boolean;
  projectId: string;
}

export default function Endpoints({ endpoints, onEndpointClick, viewMode, isLoading, projectId }: EndpointsProps) {
  // Loading state
  if (isLoading) {
    return <CommonState type="loading" message="Loading endpoints..." />;
  }

  // Empty state
  if (!endpoints || endpoints.length === 0) {
    return (
      <CommonState 
        type="empty" 
        title="No endpoints found"
        message="No API endpoints have been detected for this project yet."
        icon="📡"
      />
    );
  }

  // Group endpoints by normalized path
  const groupedEndpoints = groupEndpointsByNormalizedPath(endpoints) as GroupedEndpoint[];

  const handleEndpointClick = (groupedEndpoint: GroupedEndpoint) => {
    // For now, click on the first original endpoint in the group
    // In the future, we could show a modal with all variants
    if (groupedEndpoint.originalEndpoints.length > 0) {
      onEndpointClick(groupedEndpoint.originalEndpoints[0]);
    }
  };

  if (viewMode === 'table') {
    return (
      <div className={styles.endpointsTable}>
        <div className={styles.tableHeader}>
          <div className={styles.headerCell}>Method</div>
          <div className={styles.headerCell}>Path</div>
          <div className={styles.headerCell}>Avg Response</div>
          <div className={styles.headerCell}>Error Rate</div>
          <div className={styles.headerCell}>Requests</div>
          <div className={styles.headerCell}>Status</div>
          <div className={styles.headerCell}>Last Request</div>
        </div>
        <div className={styles.tableBody}>
          {groupedEndpoints.map((endpoint) => (
            <div 
              key={`${endpoint.method}-${endpoint.normalizedPath}`} 
              className={styles.tableRow}
              onClick={() => handleEndpointClick(endpoint)}
            >
              <div className={styles.tableCell} data-label="Method">
                <span 
                  className={styles.methodBadge}
                  style={{ 
                    backgroundColor: getMethodColor(endpoint.method),
                    color: 'white'
                  }}
                >
                  {endpoint.method}
                </span>
              </div>
              <div className={styles.tableCell} data-label="Path">
                <span 
                  className={styles.endpointPath}
                  dangerouslySetInnerHTML={{ 
                    __html: formatNormalizedPath(endpoint.normalizedPath) 
                  }}
                />
                {endpoint.count > 1 && (
                  <span className={styles.endpointCount}>
                    ({endpoint.count} variants)
                  </span>
                )}
              </div>
              <div className={styles.tableCell} data-label="Avg Response">
                {formatResponseTime(endpoint.avgResponseTime)}
              </div>
              <div className={styles.tableCell} data-label="Error Rate">
                {formatErrorRate(endpoint.errorRate)}
              </div>
              <div className={styles.tableCell} data-label="Requests">
                {formatRequestCount(endpoint.requestCount)}
              </div>
              <div className={styles.tableCell} data-label="Status">
                <div className={styles.statusContainer}>
                  <span 
                    className={styles.statusBadge}
                    style={{ color: getStatusColor(endpoint.status) }}
                  >
                    {endpoint.status}
                  </span>
                  <div className={styles.statusTooltip}>
                    <div className={styles.tooltipContent}>
                      {(() => {
                        const cappedRate = Math.min(endpoint.errorRate, 1);
                        const errorPercent = (cappedRate * 100).toFixed(1);
                        if (endpoint.errorRate > 0.1) {
                          return `⚠️ ${errorPercent}% error rate - High failure rate`;
                        } else if (endpoint.errorRate > 0) {
                          return `⚠️ ${errorPercent}% error rate - Some failures detected`;
                        } else {
                          return 'No errors detected - All requests successful';
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.tableCell} data-label="Last Request">
                {formatLastRequest(endpoint.lastRequest)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.endpointsList}>
      {groupedEndpoints.map((endpoint) => (
        <Endpoint
          key={`${endpoint.method}-${endpoint.normalizedPath}`}
          endpoint={{
            id: `${endpoint.method}-${endpoint.normalizedPath}`,
            method: endpoint.method,
            path: endpoint.normalizedPath,
            avgResponseTime: endpoint.avgResponseTime,
            errorRate: endpoint.errorRate,
            requestCount: endpoint.requestCount,
            lastRequest: endpoint.lastRequest,
            status: endpoint.status
          }}
          onClick={() => handleEndpointClick(endpoint)}
        />
      ))}
    </div>
  );
}

// Helper functions
function getMethodColor(method: string) {
  switch (method.toUpperCase()) {
    case 'GET': return '#059669';
    case 'POST': return '#2563EB';
    case 'PUT': return '#D97706';
    case 'DELETE': return '#DC2626';
    case 'PATCH': return '#7C3AED';
    default: return '#6B7280';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'healthy': return '#059669';
    case 'warning': return '#D97706';
    case 'error': return '#DC2626';
    default: return '#6B7280';
  }
}

function formatResponseTime(time: number) {
  return time < 1000 ? `${time}ms` : `${(time / 1000).toFixed(1)}s`;
}

function formatErrorRate(rate: number) {
  return `${(rate * 100).toFixed(1)}%`;
}

function formatRequestCount(count: number) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function formatLastRequest(timestamp: string) {
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
}