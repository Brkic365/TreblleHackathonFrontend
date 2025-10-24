"use client";

import React from 'react';
import {createListCollection, Select} from '@ark-ui/react/select';
import styles from "@/styles/components/EndpointsMenu.module.scss";

interface EndpointsMenuProps {
  viewMode: 'list' | 'table';
  onViewModeChange: (mode: 'list' | 'table') => void;
  onFilterChange: (filters: {
    method?: string;
    status?: string;
    timeRange?: string;
  }) => void;
  currentFilters?: {
    method: string;
    status: string;
    timeRange: string;
  };
}

export default function EndpointsMenu({ 
  viewMode, 
  onViewModeChange, 
  onFilterChange,
  currentFilters
}: EndpointsMenuProps) {
  const [methodFilter, setMethodFilter] = React.useState<string>(currentFilters?.method || 'all');
  const [statusFilter, setStatusFilter] = React.useState<string>(currentFilters?.status || 'all');
  const [timeRangeFilter, setTimeRangeFilter] = React.useState<string>(currentFilters?.timeRange || '24h');

  // Sync with parent filter changes (from URL)
  React.useEffect(() => {
    if (currentFilters) {
      setMethodFilter(currentFilters.method);
      setStatusFilter(currentFilters.status);
      setTimeRangeFilter(currentFilters.timeRange);
    }
  }, [currentFilters]);

  const handleMethodChange = (value: string) => {
    setMethodFilter(value);
    onFilterChange({ method: value });
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    onFilterChange({ status: value });
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRangeFilter(value);
    onFilterChange({ timeRange: value });
  };

  return (
    <div className={styles.endpointsMenu}>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Method</label>
          <Select.Root 
            value={[methodFilter]} 
            onValueChange={(e) => handleMethodChange(e.value[0])} 
            collection={createListCollection({ 
              items: [
                { label: "All Methods", value: "all" },
                { label: "GET", value: "GET" },
                { label: "POST", value: "POST" },
                { label: "PUT", value: "PUT" },
                { label: "DELETE", value: "DELETE" },
                { label: "PATCH", value: "PATCH" }
              ]
            })}
          >
            <Select.Trigger className={styles.selectTrigger}>
              <Select.ValueText placeholder="All Methods">
                {methodFilter === 'all' ? 'All Methods' : methodFilter}
              </Select.ValueText>
              <Select.Indicator>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Select.Indicator>
            </Select.Trigger>
            <Select.Content className={styles.selectContent}>
              <Select.Item item={{ label: "All Methods", value: "all" }} className={styles.selectItem}>All Methods</Select.Item>
              <Select.Item item={{ label: "GET", value: "GET" }} className={styles.selectItem}>GET</Select.Item>
              <Select.Item item={{ label: "POST", value: "POST" }} className={styles.selectItem}>POST</Select.Item>
              <Select.Item item={{ label: "PUT", value: "PUT" }} className={styles.selectItem}>PUT</Select.Item>
              <Select.Item item={{ label: "DELETE", value: "DELETE" }} className={styles.selectItem}>DELETE</Select.Item>
              <Select.Item item={{ label: "PATCH", value: "PATCH" }} className={styles.selectItem}>PATCH</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Status</label>
          <Select.Root 
            value={[statusFilter]} 
            onValueChange={(e) => handleStatusChange(e.value[0])} 
            collection={createListCollection({ 
              items: [
                { label: "All Status", value: "all" },
                { label: "Healthy", value: "healthy" },
                { label: "Warning", value: "warning" },
                { label: "Error", value: "error" }
              ]
            })}
          >
            <Select.Trigger className={styles.selectTrigger}>
              <Select.ValueText placeholder="All Status">
                {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Select.ValueText>
              <Select.Indicator>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Select.Indicator>
            </Select.Trigger>
            <Select.Content className={styles.selectContent}>
              <Select.Item item={{ label: "All Status", value: "all" }} className={styles.selectItem}>All Status</Select.Item>
              <Select.Item item={{ label: "Healthy", value: "healthy" }} className={styles.selectItem}>Healthy</Select.Item>
              <Select.Item item={{ label: "Warning", value: "warning" }} className={styles.selectItem}>Warning</Select.Item>
              <Select.Item item={{ label: "Error", value: "error" }} className={styles.selectItem}>Error</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Time Range</label>
          <Select.Root 
            value={[timeRangeFilter]} 
            onValueChange={(e) => handleTimeRangeChange(e.value[0])} 
            collection={createListCollection({ 
              items: [
                { label: "Last 1h", value: "1h" },
                { label: "Last 24h", value: "24h" },
                { label: "Last 7d", value: "7d" },
                { label: "Last 30d", value: "30d" }
              ]
            })}
          >
            <Select.Trigger className={styles.selectTrigger}>
              <Select.ValueText placeholder="Last 24h">
                {timeRangeFilter === '1h' ? 'Last 1h' : 
                 timeRangeFilter === '24h' ? 'Last 24h' : 
                 timeRangeFilter === '7d' ? 'Last 7d' : 
                 timeRangeFilter === '30d' ? 'Last 30d' : 'Last 24h'}
              </Select.ValueText>
              <Select.Indicator>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Select.Indicator>
            </Select.Trigger>
            <Select.Content className={styles.selectContent}>
              <Select.Item item={{ label: "Last 1h", value: "1h" }} className={styles.selectItem}>Last 1h</Select.Item>
              <Select.Item item={{ label: "Last 24h", value: "24h" }} className={styles.selectItem}>Last 24h</Select.Item>
              <Select.Item item={{ label: "Last 7d", value: "7d" }} className={styles.selectItem}>Last 7d</Select.Item>
              <Select.Item item={{ label: "Last 30d", value: "30d" }} className={styles.selectItem}>Last 30d</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
      </div>

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
    </div>
  );
}
