"use client";

import React, { useState } from 'react';
import { Select, createListCollection } from '@ark-ui/react';
import styles from "@/styles/components/RequestsMenu.module.scss";

interface RequestsMenuProps {
  viewMode: 'list' | 'table';
  onViewModeChange: (mode: 'list' | 'table') => void;
  onFilterChange?: (filters: {
    method?: string;
    status?: string;
    timeRange?: string;
  }) => void;
}

function RequestsMenu({ viewMode, onViewModeChange, onFilterChange }: RequestsMenuProps) {
  const [filters, setFilters] = useState({
    timeRange: '24h',
    method: 'all',
    statusCode: 'all'
  });

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

  return (
    <div className={styles.requestsMenuContainer}>
      <section className={styles.requestsMenu}>
        <section className={styles.filtersSection}>
          {/* Render selects using map */}
          {selectConfigs.map((config) => (
            <Select.Root
              key={config.key}
              value={[filters[config.key]]}
              onValueChange={(e) => handleFilterChange(config.key, e.value[0])}
              collection={collections[config.key]}
              className={styles.selectRoot}
            >
              <Select.Trigger className={styles.selectTrigger}>
                <Select.ValueText placeholder={config.placeholder} />
                <Select.Indicator className={styles.selectIndicator}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
          ))}
        </section>

        <section className={styles.viewModeSection}>
          <div className={styles.viewModeToggle}>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => onViewModeChange('list')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M2 3h12M2 8h12M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'table' ? styles.active : ''}`}
              onClick={() => onViewModeChange('table')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M3 3h10v10H3zM6 6h4M6 10h4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </button>
          </div>
        </section>
      </section>
    </div>
  );
}

export default RequestsMenu;
