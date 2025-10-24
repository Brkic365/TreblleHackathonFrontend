"use client";

import React from 'react';
import { TimeSeriesChart } from '@/app/components/charts/TimeSeriesChart';
import styles from "@/styles/components/Endpoint.module.scss";

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

// Mock performance data for charts
const mockPerformanceData = [
  { time: '00:00', value: 120 },
  { time: '04:00', value: 95 },
  { time: '08:00', value: 180 },
  { time: '12:00', value: 220 },
  { time: '16:00', value: 150 },
  { time: '20:00', value: 110 },
  { time: '24:00', value: 125 }
];

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
    return `${(rate * 100).toFixed(1)}%`;
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
          <span className={styles.path}>{endpoint.path}</span>
        </div>
        <div 
          className={styles.status}
          style={{ color: getStatusColor(endpoint.status) }}
        >
          {endpoint.status}
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

      <div className={styles.chartSection}>
        <div className={styles.chartContainer}>
          <TimeSeriesChart
            data={mockPerformanceData}
            dataKey="value"
            gradientId={`endpointChartGradient${endpoint.id}`}
            gradientColors={['#d946ef', '#7f00ff']}
            yAxisFormatter={(num) => `${num}ms`}
          />
        </div>
      </div>
    </div>
  );
}
