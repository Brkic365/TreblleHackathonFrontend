"use client";

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import styles from "@/styles/components/ApiEndpointCard.module.scss";
import Button from './Button';
import apiClient from '@/lib/apiClient';

interface ApiEndpoint {
  id: string;
  name: string;
  status: 'healthy' | 'error';
  avgResponseTime: string;
  errors24h: number;
  proxyUrl: string;
  originalBaseUrl: string;
  createdAt: string;
  totalRequests: number;
  lastRequest?: string;
  errorTypes?: { [key: string]: number };
}

interface ApiEndpointCardProps {
  endpoint: ApiEndpoint;
  onViewRequests: () => void;
}

export default function ApiEndpointCard({ endpoint, onViewRequests }: ApiEndpointCardProps) {
  const [copied, setCopied] = useState(false);

  // Fetch additional data for this project
  const { data: kpisData } = useSWR(
    `project-kpis-${endpoint.id}`,
    () => apiClient.getProjectKPIs(endpoint.id, '24h')
  );

  const { data: endpointsData } = useSWR(
    `project-endpoints-${endpoint.id}`,
    () => apiClient.getProjectEndpoints(endpoint.id, { limit: 1 })
  );

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(endpoint.proxyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const getStatusColor = () => {
    return endpoint.status === 'healthy' ? '#10B981' : '#EF4444';
  };

  const getStatusClass = () => {
    if (endpoint.errors24h === 0) return 'healthy';
    if (endpoint.errors24h < 5) return 'warning';
    return 'error';
  };

  const getApiIcon = () => {
    return endpoint.name.charAt(0).toUpperCase();
  };

  const formatLastRequest = (timestamp?: string) => {
    if (!timestamp) return 'No recent activity';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatRequestCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const calculateRequestsPerMinute = () => {
    if (!kpisData?.totalRequests) return 0;
    
    // Calculate requests per minute based on 24h data
    const requestsPerHour = kpisData.totalRequests / 24;
    const requestsPerMinute = requestsPerHour / 60;
    return Math.round(requestsPerMinute);
  };

  const getEndpointsCount = () => {
    return endpointsData?.pagination?.total || 0;
  };

  const getStatusScore = () => {
    if (kpisData?.securityScore) {
      return Math.round(kpisData.securityScore);
    }
    if (endpoint.errors24h === 0) return 98;
    if (endpoint.errors24h < 5) return 85;
    return 65;
  };

  return (
    <div className={styles.endpointCard} onClick={onViewRequests}>
      {/* Left Section - API Info */}
      <div className={styles.cardLeft}>
        <div className={styles.apiIcon}>
          {getApiIcon()}
        </div>
        <div className={styles.apiInfo}>
          <h3 className={styles.apiName}>{endpoint.name}</h3>
          <p className={styles.apiUrl}>{endpoint.originalBaseUrl}</p>
        </div>
      </div>

      {/* Middle Section - Metrics */}
      <div className={styles.cardMiddle}>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>Requests</span>
          <span className={styles.metricValue}>{formatRequestCount(endpoint.totalRequests)}</span>
        </div>
        
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>Requests per min</span>
          <span className={styles.metricValue}>{calculateRequestsPerMinute()}</span>
        </div>
        
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>Endpoints</span>
          <span className={styles.metricValue}>{getEndpointsCount()}</span>
        </div>
      </div>

      {/* Right Section - Issues & Status */}
      <div className={styles.cardRight}>        
        <div className={styles.lastActivity}>
          {formatLastRequest(endpoint.lastRequest)}
        </div>
        
        <div className={styles.statusIndicator}>
          <div className={`${styles.statusCircle} ${styles[getStatusClass()]}`}>
            <span className={styles.statusNumber}>{getStatusScore()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
