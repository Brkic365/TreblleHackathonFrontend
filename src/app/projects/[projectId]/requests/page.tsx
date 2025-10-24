"use client";

import React, { useState, useMemo, use, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import styles from "@/styles/pages/ProjectRequests.module.scss";
import Requests from '@/app/components/Requests';
import RequestsMenu from '@/app/components/RequestsMenu';
import RequestDetailSidebar from '@/app/components/RequestDetailSidebar';
import CommonState from '@/app/components/CommonState';
import { RequestLog } from '@/types';
import apiClient from '@/lib/apiClient';

interface ProjectRequestsProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectRequests({ params }: ProjectRequestsProps) {
  const { projectId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [selectedRequest, setSelectedRequest] = useState<RequestLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Initialize filters from URL parameters
  const [filters, setFilters] = useState({
    method: 'all',
    statusCode: 'all',
    timeRange: '24h',
    sortBy: 'timestamp',
    order: 'desc'
  });

  // Update filters from URL parameters on page load/refresh
  useEffect(() => {
    const urlFilters = {
      method: searchParams.get('method') || 'all',
      statusCode: searchParams.get('statusCode') || 'all',
      timeRange: searchParams.get('timeRange') || '24h',
      sortBy: searchParams.get('sortBy') || 'timestamp',
      order: searchParams.get('order') || 'desc'
    };
    setFilters(urlFilters);
  }, [searchParams]);

  const itemsPerPage = 20; // Match backend default limit

  // Update URL when filters change
  const updateURL = (newFilters: typeof filters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== 'all' && value !== 'timestamp' && value !== 'desc') {
        params.set(key, value);
      }
    });
    if (newFilters.sortBy !== 'timestamp') params.set('sortBy', newFilters.sortBy);
    if (newFilters.order !== 'desc') params.set('order', newFilters.order);
    
    const newURL = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/projects/${projectId}/requests${newURL}`, { scroll: false });
  };

  // Fetch requests data from API
  const { data: requestsData, error, isLoading } = useSWR(
    `project-requests-${projectId}-${currentPage}-${JSON.stringify(filters)}`,
    () => apiClient.getProjectRequests(projectId, {
      page: currentPage,
      limit: itemsPerPage,
      method: filters.method !== 'all' ? filters.method : undefined,
      statusCode: filters.statusCode !== 'all' ? filters.statusCode : undefined,
      timeRange: filters.timeRange !== '24h' ? filters.timeRange : undefined,
      sortBy: filters.sortBy,
      order: filters.order
    }),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  const handleRequestClick = (request: RequestLog) => {
    setSelectedRequest(request);
  };

  const handleCloseSidebar = () => {
    setSelectedRequest(null);
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
    if (!requestsData?.pagination) return null;
    
    const { page, totalPages, total } = requestsData.pagination;

    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        className={`${styles.pageButton} ${page === 1 ? styles.disabled : ''}`}
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
      >
        Previous
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`${styles.pageButton} ${page === i ? styles.active : ''}`}
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
        className={`${styles.pageButton} ${page === totalPages ? styles.disabled : ''}`}
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </button>
    );

    return (
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, total)} of {total} requests
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
      <div className={styles.requests}>
        <div className={styles.requestsHeader}>
          <h1 className={styles.title}>Request Log</h1>
          <p className={styles.subtitle}>Monitor all requests for this project</p>
        </div>
        <CommonState 
          type="loading" 
          message="Loading requests..." 
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.requests}>
        <div className={styles.requestsHeader}>
          <h1 className={styles.title}>Request Log</h1>
          <p className={styles.subtitle}>Monitor all requests for this project</p>
        </div>
        <CommonState 
          type="error" 
          title="Failed to load requests"
          message={error instanceof Error ? error.message : 'An unexpected error occurred'}
          onRetry={() => window.location.reload()}
          icon="⚠️"
        />
      </div>
    );
  }

  // Empty state
  if (!requestsData?.requests || requestsData.requests.length === 0) {
    return (
      <div className={styles.requests}>
        <div className={styles.requestsHeader}>
          <h1 className={styles.title}>Request Log</h1>
          <p className={styles.subtitle}>Monitor all requests for this project</p>
        </div>
        <div className={styles.requestsContent}>
          <RequestsMenu 
            viewMode={viewMode} 
            onViewModeChange={setViewMode}
            onFilterChange={handleFilterChange}
          />
          <CommonState 
            type="empty" 
            title="No requests found"
            message="No requests match your current filters. Try adjusting your search criteria."
            icon="📋"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.requests}>
      <div className={styles.requestsHeader}>
        <h1 className={styles.title}>Request Log</h1>
        <p className={styles.subtitle}>Monitor all requests for this project</p>
      </div>
      <div className={styles.requestsContent}>
        <RequestsMenu 
          viewMode={viewMode} 
          onViewModeChange={setViewMode}
          onFilterChange={handleFilterChange}
        />
        <Requests 
          viewMode={viewMode} 
          onRequestClick={handleRequestClick}
          requests={requestsData.requests}
          isLoading={isLoading}
        />
        {renderPagination()}
      </div>

      {selectedRequest && (
        <RequestDetailSidebar 
          request={selectedRequest} 
          onClose={handleCloseSidebar} 
        />
      )}
    </div>
  );
}
