"use client";

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import styles from "@/styles/pages/ProjectApi.module.scss";
import apiClient, { BackendProject } from '@/lib/apiClient';

interface ProjectApiProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectApi({ params }: ProjectApiProps) {
  const router = useRouter();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  
  // Unwrap the params Promise
  const { projectId } = use(params);

  // Fetch project details
  const { data: projectDetails, error: projectError, isLoading: projectLoading } = useSWR(
    `project-details-${projectId}`,
    () => apiClient.getProject(projectId)
  );

  const handleCopyUrl = async (url: string, type: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(type);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  // Loading state
  if (projectLoading) {
    return (
      <div className={styles.apiPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading API information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (projectError || !projectDetails) {
    return (
      <div className={styles.apiPage}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>Failed to load API information</h2>
          <p className={styles.errorMessage}>
            {projectError?.message || 'Unable to fetch project details. Please try again.'}
          </p>
          <button 
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.apiPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>API Configuration</h1>
          <div className={styles.apiStatus}>
            <div className={styles.statusDot}></div>
            <span className={styles.statusText}>Active</span>
          </div>
        </div>
      </div>

      {/* API URLs Section */}
      <div className={styles.apiUrlsSection}>
        <div className={styles.apiCard}>
          <div className={styles.apiCardHeader}>
            <h2 className={styles.apiCardTitle}>Proxy API URL</h2>
            <p className={styles.apiCardDescription}>
              Use this URL to replace your original API endpoint. All requests will be monitored and logged.
            </p>
          </div>
          <div className={styles.apiUrlContainer}>
            <div className={styles.apiUrlField}>
              <label className={styles.apiUrlLabel}>Your Proxy URL</label>
              <div className={styles.apiUrlValue}>
                <code className={styles.apiUrlCode}>{projectDetails.proxyUrl}</code>
                <button 
                  className={`${styles.copyButton} ${copiedUrl === 'proxy' ? styles.copied : ''}`}
                  onClick={() => handleCopyUrl(projectDetails.proxyUrl, 'proxy')}
                  title="Copy proxy URL"
                >
                  {copiedUrl === 'proxy' ? (
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="currentColor"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6z" fill="currentColor"/>
                      <path d="M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z" fill="currentColor"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.apiCard}>
          <div className={styles.apiCardHeader}>
            <h2 className={styles.apiCardTitle}>Original API URL</h2>
            <p className={styles.apiCardDescription}>
              Your original API endpoint. This remains unchanged and functional.
            </p>
          </div>
          <div className={styles.apiUrlContainer}>
            <div className={styles.apiUrlField}>
              <label className={styles.apiUrlLabel}>Original Endpoint</label>
              <div className={styles.apiUrlValue}>
                <code className={styles.apiUrlCode}>{projectDetails.originalBaseUrl}</code>
                <button 
                  className={`${styles.copyButton} ${copiedUrl === 'original' ? styles.copied : ''}`}
                  onClick={() => handleCopyUrl(projectDetails.originalBaseUrl, 'original')}
                  title="Copy original URL"
                >
                  {copiedUrl === 'original' ? (
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="currentColor"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6z" fill="currentColor"/>
                      <path d="M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z" fill="currentColor"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Instructions */}
      <div className={styles.integrationSection}>
        <div className={styles.integrationCard}>
          <h2 className={styles.integrationTitle}>Integration Instructions</h2>
          <div className={styles.integrationSteps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Replace Your API URL</h3>
                <p className={styles.stepDescription}>
                  Update your application to use the proxy URL instead of your original API URL.
                </p>
                <div className={styles.codeExample}>
                  <div className={styles.codeHeader}>Before:</div>
                  <code className={styles.codeBlock}>
                    const API_URL = "{projectDetails.originalBaseUrl}";
                  </code>
                </div>
                <div className={styles.codeExample}>
                  <div className={styles.codeHeader}>After:</div>
                  <code className={styles.codeBlock}>
                    const API_URL = "{projectDetails.proxyUrl}";
                  </code>
                </div>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Test Your Integration</h3>
                <p className={styles.stepDescription}>
                  Make a test request to verify everything is working correctly.
                </p>
                <div className={styles.codeExample}>
                  <code className={styles.codeBlock}>
                    curl -X GET "{projectDetails.proxyUrl}/your-endpoint"
                  </code>
                </div>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Monitor Your API</h3>
                <p className={styles.stepDescription}>
                  View real-time analytics, logs, and performance metrics in this dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className={styles.featuresSection}>
        <h2 className={styles.featuresTitle}>What You Get</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3 className={styles.featureTitle}>Real-time Analytics</h3>
            <p className={styles.featureDescription}>
              Monitor request volume, response times, and error rates in real-time.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔍</div>
            <h3 className={styles.featureTitle}>Request Logging</h3>
            <p className={styles.featureDescription}>
              Detailed logs of every API request with headers, body, and response data.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🛡️</div>
            <h3 className={styles.featureTitle}>Security Monitoring</h3>
            <p className={styles.featureDescription}>
              Automatic security analysis and vulnerability detection for your API.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3 className={styles.featureTitle}>Performance Insights</h3>
            <p className={styles.featureDescription}>
              Identify slow endpoints and optimize your API performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
