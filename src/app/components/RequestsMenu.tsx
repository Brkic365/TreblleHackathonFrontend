"use client";

import React, { useState } from 'react';
import { Select, createListCollection } from '@ark-ui/react';
import styles from "@/styles/components/RequestsMenu.module.scss";

interface RequestsMenuProps {
  viewMode: 'list' | 'table';
  onViewModeChange: (mode: 'list' | 'table') => void;
  onFilterChange?: (filters: {
    method?: string;
    statusCode?: string;
    timeRange?: string;
  }) => void;
  currentFilters?: {
    method: string;
    statusCode: string;
    timeRange: string;
  };
}

function RequestsMenu({ viewMode, onViewModeChange, onFilterChange, currentFilters }: RequestsMenuProps) {
  const [filters, setFilters] = useState({
    timeRange: currentFilters?.timeRange || '24h',
    method: currentFilters?.method || 'all',
    statusCode: currentFilters?.statusCode || 'all'
  });

  // Sync with parent filter changes (from URL)
  React.useEffect(() => {
    if (currentFilters) {
      setFilters({
        timeRange: currentFilters.timeRange,
        method: currentFilters.method,
        statusCode: currentFilters.statusCode
      });
    }
  }, [currentFilters]);

  // Define all select configurations
  const selectConfigs = [
    {
      key: 'timeRange' as const,
      placeholder: 'Last 24h',
      options: [
        { label: 'Last 1h', value: '1h' },
        { label: 'Last 24h', value: '24h' },
        { label: 'Last 7 days', value: '7d' },
        { label: 'Last 30 days', value: '30d' }
      ]
    },
    {
      key: 'method' as const,
      placeholder: 'Method: All',
      options: [
        { label: 'Method: All', value: 'all' },
        { label: 'Method: GET', value: 'GET' },
        { label: 'Method: POST', value: 'POST' },
        { label: 'Method: PUT', value: 'PUT' },
        { label: 'Method: DELETE', value: 'DELETE' }
      ]
    },
    {
      key: 'statusCode' as const,
      placeholder: 'Response: All',
      options: [
        { label: 'Response: All', value: 'all' },
        { label: 'Response: 2xx', value: '2xx' },
        { label: 'Response: 4xx', value: '4xx' },
        { label: 'Response: 5xx', value: '5xx' }
      ]
    }
  ];

  // Create collections for each select
  const collections = selectConfigs.reduce((acc, config) => {
    acc[config.key] = createListCollection({ items: config.options });
    return acc;
  }, {} as Record<string, any>);

  // Handle filter changes
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (onFilterChange) {
      onFilterChange({ [key]: value });
    }
  };

  const getFilterLabel = (key: string) => {
    switch (key) {
      case 'timeRange': return 'Time Range';
      case 'method': return 'Method';
      case 'statusCode': return 'Status';
      default: return '';
    }
  };

  return (
    <div className={styles.requestsMenuContainer}>
      <section className={styles.requestsMenu}>
        <section className={styles.filtersSection}>
          {/* Render selects using map */}
          {selectConfigs.map((config) => (
            <div key={config.key} className={styles.filterGroup}>
              <label className={styles.filterLabel}>{getFilterLabel(config.key)}</label>
              <Select.Root
                value={[filters[config.key]]}
                onValueChange={(e) => handleFilterChange(config.key, e.value[0])}
                collection={collections[config.key]}
                className={styles.selectRoot}
              >
                <Select.Trigger className={styles.selectTrigger}>
                  <Select.ValueText placeholder={config.placeholder}>
                    {config.key === 'timeRange' && filters.timeRange === '1h' && 'Last 1h'}
                    {config.key === 'timeRange' && filters.timeRange === '24h' && 'Last 24h'}
                    {config.key === 'timeRange' && filters.timeRange === '7d' && 'Last 7d'}
                    {config.key === 'timeRange' && filters.timeRange === '30d' && 'Last 30d'}
                    {config.key === 'method' && filters.method === 'all' && 'All Methods'}
                    {config.key === 'method' && filters.method !== 'all' && filters.method}
                    {config.key === 'statusCode' && filters.statusCode === 'all' && 'All Status'}
                    {config.key === 'statusCode' && filters.statusCode === '2xx' && '2xx'}
                    {config.key === 'statusCode' && filters.statusCode === '4xx' && '4xx'}
                    {config.key === 'statusCode' && filters.statusCode === '5xx' && '5xx'}
                  </Select.ValueText>
                  <Select.Indicator className={styles.selectIndicator}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Select.Indicator>
                </Select.Trigger>
                <Select.Content className={styles.selectContent}>
                  {config.options.map((option) => (
                    <Select.Item key={option.value} item={option} className={styles.selectItem}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>
          ))}
        </section>

        <div className={styles.viewMode}>
          <button
            className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => onViewModeChange('list')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="2" rx="1" fill="currentColor"/>
              <rect x="2" y="7" width="12" height="2" rx="1" fill="currentColor"/>
              <rect x="2" y="11" width="12" height="2" rx="1" fill="currentColor"/>
            </svg>
          </button>
          <button
            className={`${styles.viewButton} ${viewMode === 'table' ? styles.active : ''}`}
            onClick={() => onViewModeChange('table')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="4" height="4" rx="1" fill="currentColor"/>
              <rect x="8" y="2" width="4" height="4" rx="1" fill="currentColor"/>
              <rect x="2" y="8" width="4" height="4" rx="1" fill="currentColor"/>
              <rect x="8" y="8" width="4" height="4" rx="1" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
}

export default RequestsMenu;
