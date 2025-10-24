"use client";

import React from 'react';
import styles from '@/styles/components/GeoHeatmap.module.scss';

interface GeoHeatmapData {
  country: string;
  countryCode: string;
  avgLatency: number;
  totalRequests: number;
  errorRate: number;
}

interface GeoHeatmapProps {
  data: GeoHeatmapData[];
  isLoading?: boolean;
}

export default function GeoHeatmap({ data, isLoading }: GeoHeatmapProps) {
  const getLatencyColor = (latency: number) => {
    if (latency < 100) return '#059669'; // Green
    if (latency < 200) return '#D97706'; // Orange
    if (latency < 500) return '#DC2626'; // Red
    return '#7C3AED'; // Purple
  };

  const getLatencyLabel = (latency: number) => {
    if (latency < 100) return 'Excellent';
    if (latency < 200) return 'Good';
    if (latency < 500) return 'Fair';
    return 'Poor';
  };

  if (isLoading) {
    return (
      <div className={styles.geoContainer}>
        <div className={styles.geoHeader}>
          <h3 className={styles.geoTitle}>Geographic Performance</h3>
          <p className={styles.geoSubtitle}>Average latency by country</p>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <span>Loading geographic data...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.geoContainer}>
        <div className={styles.geoHeader}>
          <h3 className={styles.geoTitle}>Geographic Performance</h3>
          <p className={styles.geoSubtitle}>Average latency by country</p>
        </div>
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>No geographic data available</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.geoContainer}>
      <div className={styles.geoHeader}>
        <h3 className={styles.geoTitle}>Geographic Performance</h3>
        <p className={styles.geoSubtitle}>Average latency by country</p>
      </div>
      
      <div className={styles.geoContent}>
        <div className={styles.geoTable}>
          <div className={styles.geoTableHeader}>
            <div className={styles.geoTableHeaderCell}>Country</div>
            <div className={styles.geoTableHeaderCell}>Avg Latency</div>
            <div className={styles.geoTableHeaderCell}>Requests</div>
            <div className={styles.geoTableHeaderCell}>Error Rate</div>
          </div>
          
          <div className={styles.geoTableBody}>
            {data.map((item, index) => (
              <div key={item.countryCode} className={styles.geoTableRow}>
                <div className={styles.geoTableCell}>
                  <div className={styles.countryInfo}>
                    <span className={styles.countryFlag}>
                      {item.countryCode.toUpperCase().split('').map((char, i) => 
                        String.fromCodePoint(127397 + char.charCodeAt(0))
                      ).join('')}
                    </span>
                    <span className={styles.countryName}>{item.country}</span>
                  </div>
                </div>
                <div className={styles.geoTableCell}>
                  <div className={styles.latencyInfo}>
                    <span 
                      className={styles.latencyValue}
                      style={{ color: getLatencyColor(item.avgLatency) }}
                    >
                      {item.avgLatency}ms
                    </span>
                    <span 
                      className={styles.latencyLabel}
                      style={{ color: getLatencyColor(item.avgLatency) }}
                    >
                      {getLatencyLabel(item.avgLatency)}
                    </span>
                  </div>
                </div>
                <div className={styles.geoTableCell}>
                  <span className={styles.requestCount}>
                    {item.totalRequests.toLocaleString()}
                  </span>
                </div>
                <div className={styles.geoTableCell}>
                  <span 
                    className={styles.errorRate}
                    style={{ 
                      color: item.errorRate > 5 ? '#DC2626' : item.errorRate > 2 ? '#D97706' : '#059669'
                    }}
                  >
                    {item.errorRate.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.geoLegend}>
          <div className={styles.geoLegendTitle}>Latency Performance</div>
          <div className={styles.geoLegendItems}>
            <div className={styles.geoLegendItem}>
              <div className={styles.geoLegendColor} style={{ backgroundColor: '#059669' }} />
              <span>Excellent (&lt;100ms)</span>
            </div>
            <div className={styles.geoLegendItem}>
              <div className={styles.geoLegendColor} style={{ backgroundColor: '#D97706' }} />
              <span>Good (100-200ms)</span>
            </div>
            <div className={styles.geoLegendItem}>
              <div className={styles.geoLegendColor} style={{ backgroundColor: '#DC2626' }} />
              <span>Fair (200-500ms)</span>
            </div>
            <div className={styles.geoLegendItem}>
              <div className={styles.geoLegendColor} style={{ backgroundColor: '#7C3AED' }} />
              <span>Poor (&gt;500ms)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
