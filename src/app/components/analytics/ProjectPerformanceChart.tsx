"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from '@/styles/components/ProjectPerformanceChart.module.scss';

interface ProjectPerformanceData {
  projectId: string;
  projectName: string;
  avgLatency: number;
  totalRequests: number;
  errorRate: number;
}

interface ProjectPerformanceChartProps {
  data: ProjectPerformanceData[];
  isLoading?: boolean;
}

export default function ProjectPerformanceChart({ data, isLoading }: ProjectPerformanceChartProps) {
  const formatLatency = (value: number) => `${value}ms`;
  
  // Debug logging
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.tooltip}>
          <div className={styles.tooltipTitle}>{label}</div>
          <div className={styles.tooltipContent}>
            <div className={styles.tooltipItem}>
              <span className={styles.tooltipLabel}>Avg Latency:</span>
              <span className={styles.tooltipValue}>{formatLatency(data.avgLatency)}</span>
            </div>
            <div className={styles.tooltipItem}>
              <span className={styles.tooltipLabel}>Total Requests:</span>
              <span className={styles.tooltipValue}>{data.totalRequests.toLocaleString()}</span>
            </div>
            <div className={styles.tooltipItem}>
              <span className={styles.tooltipLabel}>Error Rate:</span>
              <span className={styles.tooltipValue}>{data.errorRate.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Project Performance</h3>
          <p className={styles.chartSubtitle}>Average latency by project</p>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <span>Loading performance data...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Project Performance</h3>
          <p className={styles.chartSubtitle}>Average latency by project</p>
        </div>
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>No performance data available</span>
        </div>
        <div className={styles.debugInfo}>
          <p>Debug: data = {JSON.stringify(data)}</p>
          <p>Debug: data.length = {data?.length || 'undefined'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Project Performance</h3>
        <p className={styles.chartSubtitle}>Average latency by project</p>
      </div>
      
      <div className={styles.chartContent}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="projectName"
              stroke="rgba(255, 255, 255, 0.6)"
              fontSize={10}
              axisLine={false}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tickFormatter={formatLatency}
              stroke="rgba(255, 255, 255, 0.6)"
              fontSize={12}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="avgLatency" 
              fill="url(#latencyGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            
            <defs>
              <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E1207A" />
                <stop offset="100%" stopColor="#9103EB" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Alternative table view */}
      <div className={styles.tableView}>
        <h4>Performance Summary</h4>
        <div className={styles.table}>
          {data.map((project, index) => (
            <div key={project.projectId} className={styles.tableRow}>
              <div className={styles.projectName}>{project.projectName}</div>
              <div className={styles.latencyBar}>
                <div 
                  className={styles.latencyFill}
                  style={{ 
                    width: `${Math.min((project.avgLatency / Math.max(...data.map(p => p.avgLatency))) * 100, 100)}%` 
                  }}
                />
              </div>
              <div className={styles.latencyValue}>{formatLatency(project.avgLatency)}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Debug info */}
      <div className={styles.debugInfo}>
        <p>Data points: {data.length}</p>
        <p>Sample data: {data.length > 0 ? `${data[0].projectName}: ${data[0].avgLatency}ms` : 'No data'}</p>
      </div>
    </div>
  );
}
