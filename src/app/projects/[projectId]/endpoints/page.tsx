"use client";

import React, { useState, useMemo, use, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import styles from "@/styles/pages/ProjectEndpoints.module.scss";
import Endpoints from '@/app/components/Endpoints';
import EndpointsMenu from '@/app/components/EndpointsMenu';
import CommonState from '@/app/components/CommonState';
import apiClient from '@/lib/apiClient';
import { EndpointItem } from '@/types';

interface ProjectEndpointsProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectEndpoints({ params }: ProjectEndpointsProps) {
  const { projectId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Initialize filters from URL parameters
  const [filters, setFilters] = useState({
    method: 'all',
    status: 'all',
    timeRange: '24h'
  });

  // Update filters from URL parameters on page load/refresh
  useEffect(() => {
    const urlFilters = {
      method: searchParams.get('method') || 'all',
      status: searchParams.get('status') || 'all',
      timeRange: searchParams.get('timeRange') || '24h'
    };
    setFilters(urlFilters);
  }, [searchParams]);

  const itemsPerPage = 20;

  // Update URL when filters change
  const updateURL = (newFilters: typeof filters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== 'all') {
        params.set(key, value);
      }
    });
    
    const newURL = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/projects/${projectId}/endpoints${newURL}`, { scroll: false });
  };

  // Fetch endpoints data from backend
  // Note: We don't send timeRange to filter endpoints, only for stats calculation
  // This ensures ALL endpoints are displayed regardless of activity in the timeframe
  const { data: endpointsData, error, isLoading } = useSWR(
    `endpoints-${projectId}-${currentPage}-${JSON.stringify(filters)}`,
    () => apiClient.getProjectEndpoints(projectId, {
      page: currentPage,
      limit: itemsPerPage,
      method: filters.method !== 'all' ? filters.method : undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
      // Don't send timeRange to backend - we want ALL endpoints shown
      // The backend will use timeRange internally for calculating stats but won't filter
      timeRange: filters.timeRange,
      sortBy: 'path',
      order: 'asc'
    })
  );

  const endpoints = endpointsData?.endpoints || [];
  const pagination = endpointsData?.pagination;

  const handleEndpointClick = (endpoint: EndpointItem) => {
    setSelectedEndpoint(endpoint);
  };

  const handleFilterChange = (newFilters: any) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setCurrentPage(1); // Reset to first page when filters change
    updateURL(updatedFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`${styles.pageButton} ${currentPage === i ? styles.active : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        className={`${styles.pageButton} ${currentPage === pagination.totalPages ? styles.disabled : ''}`}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === pagination.totalPages}
      >
        Next
      </button>
    );

    return (
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} endpoints
        </div>
        <div className={styles.paginationButtons}>
          {pages}
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.endpoints}>
        <div className={styles.endpointsHeader}>
          <h1 className={styles.title}>API Endpoints</h1>
          <p className={styles.subtitle}>Monitor all endpoints for this project</p>
        </div>
        <CommonState 
          type="loading" 
          message="Loading endpoints..." 
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.endpoints}>
        <div className={styles.endpointsHeader}>
          <h1 className={styles.title}>API Endpoints</h1>
          <p className={styles.subtitle}>Monitor all endpoints for this project</p>
        </div>
        <CommonState 
          type="error" 
          title="Failed to load endpoints"
          message={error instanceof Error ? error.message : 'An unexpected error occurred'}
          onRetry={() => window.location.reload()}
          icon="⚠️"
        />
      </div>
    );
  }

  // Empty state
  if (!endpoints || endpoints.length === 0) {
    const timeRangeLabel = filters.timeRange === '1h' ? 'last hour' : 
                           filters.timeRange === '24h' ? 'last 24 hours' :
                           filters.timeRange === '7d' ? 'last 7 days' :
                           'last 30 days';
    
    return (
      <div className={styles.endpoints}>
        <div className={styles.endpointsHeader}>
          <h1 className={styles.title}>API Endpoints</h1>
          <p className={styles.subtitle}>Monitor all endpoints for this project</p>
        </div>
        <div className={styles.endpointsContent}>
          <EndpointsMenu 
            viewMode={viewMode} 
            onViewModeChange={setViewMode}
            onFilterChange={handleFilterChange}
            currentFilters={filters}
          />
          <CommonState 
            type="empty" 
            title="No active endpoints found"
            message={`No endpoints had activity in the ${timeRangeLabel}. Try selecting a longer time range or check if any requests have been made.`}
            icon="📡"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.endpoints}>
      <div className={styles.endpointsHeader}>
        <h1 className={styles.title}>API Endpoints</h1>
        <p className={styles.subtitle}>
          Showing {pagination?.total || endpoints.length} active endpoint{pagination?.total !== 1 ? 's' : ''} ({filters.timeRange === '1h' ? 'last hour' : filters.timeRange === '24h' ? 'last 24 hours' : filters.timeRange === '7d' ? 'last 7 days' : 'last 30 days'})
        </p>
      </div>
      
      <div className={styles.endpointsContent}>
        <EndpointsMenu 
          viewMode={viewMode} 
          onViewModeChange={setViewMode}
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />
        
        <Endpoints 
          endpoints={endpoints}
          onEndpointClick={handleEndpointClick}
          viewMode={viewMode}
          isLoading={isLoading}
          projectId={projectId}
        />
        
        {renderPagination()}
      </div>
    </div>
  );
}