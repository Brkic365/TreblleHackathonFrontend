"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import styles from '@/styles/components/RequestsTrendChart.module.scss';

interface RequestsTrendData {
  timestamp: string;
  successful: number;
  errors: number;
  total: number;
}

interface RequestsTrendChartProps {
  data: RequestsTrendData[];
  isLoading?: boolean;
}

export default function RequestsTrendChart({ data, isLoading }: RequestsTrendChartProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, 'MMM dd');
  };

  const formatTooltipTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, 'MMM dd, yyyy HH:mm');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.tooltip}>
          <div className={styles.tooltipTitle}>{formatTooltipTimestamp(label)}</div>
          <div className={styles.tooltipContent}>
            <div className={styles.tooltipItem}>
              <div className={styles.tooltipItemHeader}>
                <div className={styles.tooltipColor} style={{ backgroundColor: '#059669' }} />
                <span className={styles.tooltipLabel}>Successful</span>
              </div>
              <span className={styles.tooltipValue}>{data.successful.toLocaleString()}</span>
            </div>
            <div className={styles.tooltipItem}>
              <div className={styles.tooltipItemHeader}>
                <div className={styles.tooltipColor} style={{ backgroundColor: '#DC2626' }} />
                <span className={styles.tooltipLabel}>Errors</span>
              </div>
              <span className={styles.tooltipValue}>{data.errors.toLocaleString()}</span>
            </div>
            <div className={styles.tooltipItem}>
              <div className={styles.tooltipItemHeader}>
                <span className={styles.tooltipLabel}>Total</span>
              </div>
              <span className={styles.tooltipValue}>{data.total.toLocaleString()}</span>
            </div>
            <div className={styles.tooltipItem}>
              <div className={styles.tooltipItemHeader}>
                <span className={styles.tooltipLabel}>Error Rate</span>
              </div>
              <span className={styles.tooltipValue}>
                {data.total > 0 ? ((data.errors / data.total) * 100).toFixed(2) : 0}%
              </span>
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
          <h3 className={styles.chartTitle}>Request Trends</h3>
          <p className={styles.chartSubtitle}>Successful vs error requests over time</p>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <span>Loading trend data...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Request Trends</h3>
          <p className={styles.chartSubtitle}>Successful vs error requests over time</p>
        </div>
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>No trend data available</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Request Volume Over Time</h3>
        <p className={styles.chartSubtitle}>Total requests and error rate trends</p>
      </div>
      
      <div className={styles.chartContent}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#059669" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="timestamp"
              tickFormatter={formatTimestamp}
              stroke="rgba(255, 255, 255, 0.6)"
              fontSize={12}
            />
            <YAxis 
              stroke="rgba(255, 255, 255, 0.6)"
              fontSize={12}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="successful"
              stackId="1"
              stroke="#059669"
              fill="url(#successGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="errors"
              stackId="1"
              stroke="#DC2626"
              fill="url(#errorGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className={styles.chartLegend}>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#059669' }} />
          <span>Successful Requests</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#DC2626' }} />
          <span>Error Requests</span>
        </div>
      </div>
    </div>
  );
}
