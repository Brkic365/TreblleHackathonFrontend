"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Select, createListCollection } from '@ark-ui/react';
import styles from "@/styles/pages/ProjectOverview.module.scss";
import { TimeSeriesChart } from '@/app/components/charts/TimeSeriesChart';
import CommonState from '@/app/components/CommonState';
import apiClient, { 
  ProjectOverviewKPIs, 
  ProjectOverviewChartData, 
  ProjectOverviewError, 
  ProjectOverviewSecurityIssue 
} from '@/lib/apiClient';

interface ProjectOverviewProps {
  params: Promise<{ projectId: string }>;
}

interface KPICard {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  additionalInfo?: string;
  reverseTrend?: boolean;
}

// Helper functions
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return '#DC2626';
    case 'high': return '#EA580C';
    case 'medium': return '#D97706';
    case 'low': return '#059669';
    default: return '#6B7280';
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return '↗';
    case 'down': return '↘';
    default: return '→';
  }
};

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up': return '#059669';
    case 'down': return '#DC2626';
    default: return '#6B7280';
  }
};

// Convert API KPIs to display format
const convertKPIsToCards = (kpis: ProjectOverviewKPIs): KPICard[] => {
  return [
    {
      title: 'Avg. Response Time',
      value: `${Math.round(kpis.avgResponseTime)}ms`,
      subtitle: `Total: ${kpis.totalRequests.toLocaleString()} requests`,
      additionalInfo: 'Average response time across all endpoints',
      reverseTrend: true
    },
    {
      title: 'Error Rate',
      value: `${kpis.errorRate.toFixed(2)}%`,
      subtitle: `${kpis.errorCount} errors`,
      additionalInfo: `Out of ${kpis.totalRequests.toLocaleString()} total requests`,
      reverseTrend: true
    },
    {
      title: 'Security Score',
      value: `${kpis.securityScore}/100`,
      subtitle: `${kpis.securityIssueCount} issues`,
      additionalInfo: 'Overall security assessment',
      reverseTrend: false
    },
    {
      title: 'Uptime (30d)',
      value: `${kpis.uptime.toFixed(1)}%`,
      subtitle: 'System availability',
      additionalInfo: 'Last 30 days uptime',
      reverseTrend: false
    }
  ];
};


export default function ProjectOverview({ params }: ProjectOverviewProps) {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('24h');
  
  // Unwrap the params Promise
  const { projectId } = use(params);

  // Time range options for the select
  const timeRangeOptions = [
    { label: 'Last 1h', value: '1h' },
    { label: 'Last 24h', value: '24h' },
    { label: 'Last 7d', value: '7d' },
    { label: 'Last 30d', value: '30d' }
  ];

  // Create collection for the select
  const timeRangeCollection = createListCollection({ items: timeRangeOptions });

  // Fetch project details
  const { data: projectDetails, error: projectError } = useSWR(
    `project-details-${projectId}`,
    () => apiClient.getProject(projectId)
  );

  // Fetch project overview data using SWR
  const { data: overviewData, error: overviewError, isLoading: overviewLoading } = useSWR(
    `project-overview-${projectId}-${timeRange}`,
    () => apiClient.getProjectOverview(projectId, timeRange),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
    }
  );

  // Fallback to individual API calls if the combined endpoint fails
  const { data: kpisData, error: kpisError } = useSWR(
    overviewData ? null : `project-kpis-${projectId}-${timeRange}`,
    () => apiClient.getProjectKPIs(projectId, timeRange)
  );

  const { data: chartData, error: chartError } = useSWR(
    overviewData ? null : `project-charts-${projectId}-${timeRange}`,
    () => apiClient.getProjectChartData(projectId, timeRange)
  );

  const { data: errorsData, error: errorsError } = useSWR(
    overviewData ? null : `project-errors-${projectId}-${timeRange}`,
    () => apiClient.getProjectErrors(projectId, timeRange)
  );

  const { data: securityData, error: securityError } = useSWR(
    overviewData ? null : `project-security-${projectId}-${timeRange}`,
    () => apiClient.getProjectSecurityIssues(projectId, timeRange)
  );

  // Determine which data to use
  const kpis = overviewData?.kpis || kpisData;
  const requestVolumeData = overviewData?.requestVolumeData || chartData?.requestVolumeData || [];
  const responseTimeData = overviewData?.responseTimeData || chartData?.responseTimeData || [];
  const errors = overviewData?.errors || errorsData || [];
  const securityIssues = overviewData?.securityIssues || securityData || [];

  // Convert KPIs to display format
  const kpiCards = kpis ? convertKPIsToCards(kpis) : [];

  // Check for any errors
  const hasError = overviewError || kpisError || chartError || errorsError || securityError;
  const isLoading = overviewLoading && !overviewData;

  const handleErrorClick = (error: ProjectOverviewError) => {
    // Navigate to requests page with error filter
    router.push(`/projects/${projectId}/requests?error=${error.errorType}`);
  };

  const handleSecurityIssueClick = (issue: ProjectOverviewSecurityIssue) => {
    // Navigate to security page with issue filter
    router.push(`/projects/${projectId}/security?issue=${issue.id}`);
  };

  const handleTimeRangeChange = (newTimeRange: string) => {
    setTimeRange(newTimeRange);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.overview}>
        <CommonState 
          type="loading" 
          message="Loading project overview..." 
        />
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className={styles.overview}>
        <CommonState 
          type="error" 
          title="Failed to load project overview"
          message={overviewError?.message || 'Unable to fetch project data. Please try again.'}
          onRetry={() => window.location.reload()}
          icon="⚠️"
        />
      </div>
    );
  }

  return (
    <div className={styles.overview}>
      {/* Page Header with Time Range Filter */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Overview</h1>
          <div className={styles.timeRangeFilter}>
            <Select.Root
              value={[timeRange]}
              onValueChange={(e) => handleTimeRangeChange(e.value[0])}
              collection={timeRangeCollection}
              className={styles.selectRoot}
            >
              <Select.Trigger className={styles.selectTrigger}>
                <Select.ValueText placeholder="Last 24h" />
                <Select.Indicator className={styles.selectIndicator}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Select.Indicator>
              </Select.Trigger>
              <Select.Content className={styles.selectContent}>
                {timeRangeOptions.map((option) => (
                  <Select.Item key={option.value} item={option} className={styles.selectItem}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>
        </div>
      </div>

      {/* Proxy API Information */}
      {projectDetails && (
        <div className={styles.proxyApiSection}>
          <div className={styles.proxyApiCard}>
            <div className={styles.proxyApiHeader}>
              <h2 className={styles.proxyApiTitle}>Proxy API</h2>
              <div className={styles.proxyApiStatus}>
                <div className={styles.statusDot}></div>
                <span className={styles.statusText}>Active</span>
              </div>
            </div>
            <div className={styles.proxyApiContent}>
              <div className={styles.proxyApiInfo}>
                <div className={styles.proxyApiField}>
                  <label className={styles.proxyApiLabel}>Proxy URL</label>
                  <div className={styles.proxyApiValue}>
                    <code className={styles.proxyApiCode}>{projectDetails.proxyUrl}</code>
                    <button 
                      className={styles.copyButton}
                      onClick={() => {
                        navigator.clipboard.writeText(projectDetails.proxyUrl);
                        // You could add a toast notification here
                      }}
                      title="Copy to clipboard"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6z" fill="currentColor"/>
                        <path d="M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className={styles.proxyApiField}>
                  <label className={styles.proxyApiLabel}>Original API</label>
                  <div className={styles.proxyApiValue}>
                    <code className={styles.proxyApiCode}>{projectDetails.originalBaseUrl}</code>
                  </div>
                </div>
              </div>
              <div className={styles.proxyApiInstructions}>
                <h3 className={styles.instructionsTitle}>How to use your proxy API:</h3>
                <ol className={styles.instructionsList}>
                  <li>Replace your original API URL with the proxy URL above</li>
                  <li>All requests will be automatically monitored and logged</li>
                  <li>Your original API remains unchanged and functional</li>
                  <li>View detailed analytics and logs in this dashboard</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {kpiCards.map((kpi, index) => (
          <div key={index} className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <h3 className={styles.kpiTitle}>{kpi.title}</h3>
              {kpi.change && (
                <div 
                  className={styles.kpiChange}
                  style={{ color: getTrendColor(kpi.reverseTrend ? kpi.trend === 'up' ? 'down' : 'up' : kpi.trend || 'neutral') }}
                >
                  <span className={styles.trendIcon}>{getTrendIcon(kpi.trend || 'neutral')}</span>
                  {kpi.change}
                </div>
              )}
            </div>
            <div className={styles.kpiValue}>{kpi.value}</div>
            {kpi.subtitle && (
              <div className={styles.kpiSubtitle}>{kpi.subtitle}</div>
            )}
            {kpi.additionalInfo && (
              <div className={styles.kpiAdditionalInfo}>{kpi.additionalInfo}</div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        {/* Request Volume Chart */}
        <div className={styles.chartSection}>
          <h2 className={styles.sectionTitle}>Request Volume ({timeRange})</h2>
          <div className={styles.chartContainer}>
            <TimeSeriesChart
              data={requestVolumeData}
              dataKey="value"
              gradientId="volumeChartGradient"
              gradientColors={['#d946ef', '#7f00ff']}
              yAxisFormatter={(num) => (num >= 1000 ? `${num / 1000}k` : String(num))}
            />
          </div>
        </div>

        {/* Response Time Chart */}
        <div className={styles.chartSection}>
          <h2 className={styles.sectionTitle}>Response Time Over Time ({timeRange})</h2>
          <div className={styles.chartContainer}>
            <TimeSeriesChart
              data={responseTimeData}
              dataKey="value"
              gradientId="responseTimeChartGradient"
              gradientColors={['#10b981', '#059669']}
              yAxisFormatter={(num) => `${num}ms`}
            />
          </div>
        </div>
      </div>

      {/* Latest Errors and Security Issues */}
      <div className={styles.issuesGrid}>
        {/* Top Errors */}
        <div className={styles.issuesSection}>
          <h2 className={styles.sectionTitle}>Top Errors ({timeRange})</h2>
          <div className={styles.issuesList}>
            {errors.length > 0 ? (
              errors.map((error) => (
                <div 
                  key={error.id} 
                  className={`${styles.issueItem} ${styles.clickable}`}
                  onClick={() => handleErrorClick(error)}
                >
                  <div className={styles.issueHeader}>
                    <div 
                      className={styles.severityDot}
                      style={{ backgroundColor: getSeverityColor(error.severity) }}
                    />
                    <span className={styles.issueTitle}>{error.message}</span>
                  </div>
                  <div className={styles.issueMeta}>
                    <span className={styles.issueOccurrences}>{error.occurrences} occurrences</span>
                    <span className={styles.issueTimestamp}>{error.timestamp}</span>
                    <span className={`${styles.issueSeverity} ${styles[error.severity]}`}>{error.severity}</span>
                  </div>
                </div>
              ))
            ) : (
              <CommonState 
                type="empty" 
                title="No errors found"
                message="No errors found for the selected time range."
                icon="✅"
              />
            )}
          </div>
        </div>

        {/* Top Security Issues */}
        <div className={styles.issuesSection}>
          <h2 className={styles.sectionTitle}>Top Security Issues ({timeRange})</h2>
          <div className={styles.issuesList}>
            {securityIssues.length > 0 ? (
              securityIssues.map((issue) => (
                <div 
                  key={issue.id} 
                  className={`${styles.issueItem} ${styles.clickable}`}
                  onClick={() => handleSecurityIssueClick(issue)}
                >
                  <div className={styles.issueHeader}>
                    <div 
                      className={styles.severityDot}
                      style={{ backgroundColor: getSeverityColor(issue.severity) }}
                    />
                    <span className={styles.issueTitle}>{issue.title}</span>
                  </div>
                  <div className={styles.issueMeta}>
                    <span className={styles.issueTimestamp}>{issue.timestamp}</span>
                    <span className={`${styles.issueSeverity} ${styles[issue.severity]}`}>{issue.severity}</span>
                  </div>
                  <p className={styles.issueDescription}>{issue.description}</p>
                  {issue.recommendation && (
                    <p className={styles.issueRecommendation}>
                      <strong>Recommendation:</strong> {issue.recommendation}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <CommonState 
                type="empty" 
                title="No security issues found"
                message="No security issues found for the selected time range."
                icon="🔒"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
