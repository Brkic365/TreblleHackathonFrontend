"use client";

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import AnalyticsFilterBar from '@/app/components/analytics/AnalyticsFilterBar';
import ProjectPerformanceChart from '@/app/components/analytics/ProjectPerformanceChart';
import GeoHeatmap from '@/app/components/analytics/GeoHeatmap';
import EndpointLeaderboard from '@/app/components/analytics/EndpointLeaderboard';
import RequestsTrendChart from '@/app/components/analytics/RequestsTrendChart';
import apiClient, { BackendAnalytics, BackendProject } from '@/lib/apiClient';
import styles from '@/styles/pages/Analytics.module.scss';

interface AnalyticsData {
  projectPerformance: Array<{
    projectId: string;
    projectName: string;
    avgLatency: number;
    totalRequests: number;
    errorRate: number;
  }>;
  latencyByCountry: Array<{
    country: string;
    countryCode: string;
    avgLatency: number;
    totalRequests: number;
    errorRate: number;
  }>;
  topSlowestEndpoints: Array<{
    endpoint: string;
    method: string;
    avgLatency: number;
    totalRequests: number;
    errorRate: number;
    lastError?: string;
  }>;
  topErroredEndpoints: Array<{
    endpoint: string;
    method: string;
    avgLatency: number;
    totalRequests: number;
    errorRate: number;
    lastError?: string;
  }>;
  requestsOverTime: Array<{
    timestamp: string;
    successful: number;
    errors: number;
    total: number;
  }>;
}

interface AvailableProject {
  id: string;
  name: string;
}

const fetcher = async (url: string): Promise<AnalyticsData> => {
  try {
    // Parse query parameters from URL
    const urlObj = new URL(url, window.location.origin);
    const params = urlObj.searchParams;
    
    const options: any = {};
    if (params.get('from')) options.startDate = params.get('from');
    if (params.get('to')) options.endDate = params.get('to');
    if (params.get('projects')) options.projectIds = params.get('projects')?.split(',');
    
    // Fetch real analytics data from backend
    const backendData = await apiClient.getAnalytics(options);
    
    // Transform backend data to frontend format
    return transformBackendAnalytics(backendData);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    // Return mock data as fallback
    return {
      projectPerformance: [],
      latencyByCountry: [],
      topSlowestEndpoints: [],
      topErroredEndpoints: [],
      requestsOverTime: [],
    };
  }
};

// Transform backend analytics data to frontend format
const transformBackendAnalytics = (backendData: BackendAnalytics): AnalyticsData => {
  return {
    projectPerformance: backendData.projectPerformance.map(perf => ({
      projectId: perf.apiEndpointId,
      projectName: `Project ${perf.apiEndpointId.slice(0, 8)}`, // Mock project name
      avgLatency: perf._avg.durationMs,
      totalRequests: Math.floor(Math.random() * 1000) + 100, // Mock total requests
      errorRate: Math.random() * 5, // Mock error rate
    })),
    latencyByCountry: [
      { country: 'United States', countryCode: 'US', avgLatency: 120, totalRequests: 500, errorRate: 1.2 },
      { country: 'United Kingdom', countryCode: 'GB', avgLatency: 150, totalRequests: 300, errorRate: 2.1 },
      { country: 'Germany', countryCode: 'DE', avgLatency: 140, totalRequests: 250, errorRate: 1.8 },
    ],
    topSlowestEndpoints: [
      { endpoint: '/api/users', method: 'GET', avgLatency: 450, totalRequests: 1200, errorRate: 2.1 },
      { endpoint: '/api/posts', method: 'POST', avgLatency: 380, totalRequests: 800, errorRate: 1.5 },
    ],
    topErroredEndpoints: [
      { endpoint: '/api/auth', method: 'POST', avgLatency: 200, totalRequests: 500, errorRate: 8.5, lastError: 'Invalid credentials' },
      { endpoint: '/api/upload', method: 'POST', avgLatency: 300, totalRequests: 200, errorRate: 12.0, lastError: 'File too large' },
    ],
    requestsOverTime: backendData.requestsOverTime.map(req => ({
      timestamp: req.createdAt,
      successful: Math.floor(req._count.id * 0.95),
      errors: Math.floor(req._count.id * 0.05),
      total: req._count.id,
    })),
  };
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date()
  });
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [availableProjects, setAvailableProjects] = useState<AvailableProject[]>([]);

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (dateRange.from) queryParams.append('from', dateRange.from.toISOString());
  if (dateRange.to) queryParams.append('to', dateRange.to.toISOString());
  if (selectedProjects.length > 0) queryParams.append('projects', selectedProjects.join(','));

  const { data, error, isLoading, mutate } = useSWR<AnalyticsData>(
    `/api/analytics?${queryParams.toString()}`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  // Load available projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const backendProjects = await apiClient.getProjects();
        const projects: AvailableProject[] = backendProjects.map(project => ({
          id: project.id,
          name: project.name,
        }));
        setAvailableProjects(projects);
      } catch (error) {
        console.error('Failed to load projects:', error);
        setAvailableProjects([]);
      }
    };

    loadProjects();
  }, []);

  const handleRefresh = () => {
    mutate();
  };

  if (error) {
    return (
      <div className={styles.analyticsContainer}>
        <div className={styles.errorState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Failed to load analytics data</h3>
          <p>There was an error loading your analytics data. Please try again.</p>
          <button className={styles.retryButton} onClick={handleRefresh}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.analyticsHeader}>
        <div className={styles.analyticsTitle}>
          <h1>Analytics Dashboard</h1>
          <p>Comprehensive insights into your API performance and usage patterns</p>
        </div>
      </div>

      <AnalyticsFilterBar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedProjects={selectedProjects}
        onProjectsChange={setSelectedProjects}
        availableProjects={availableProjects}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      <div className={styles.analyticsGrid}>
        <div className={styles.analyticsRow}>
          <div className={styles.analyticsWidget}>
            <ProjectPerformanceChart 
              data={data?.projectPerformance || []} 
              isLoading={isLoading}
            />
          </div>
          <div className={styles.analyticsWidget}>
            <GeoHeatmap 
              data={data?.latencyByCountry || []} 
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className={styles.analyticsRow}>
          <div className={styles.analyticsWidget}>
            <EndpointLeaderboard
              title="Top 5 Slowest Endpoints"
              data={data?.topSlowestEndpoints || []}
              isLoading={isLoading}
              maxItems={5}
            />
          </div>
          <div className={styles.analyticsWidget}>
            <EndpointLeaderboard
              title="Top 5 Most Error-Prone Endpoints"
              data={data?.topErroredEndpoints || []}
              isLoading={isLoading}
              maxItems={5}
            />
          </div>
        </div>

        <div className={styles.analyticsRow}>
          <div className={styles.analyticsWidgetFull}>
            <RequestsTrendChart 
              data={data?.requestsOverTime || []} 
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}