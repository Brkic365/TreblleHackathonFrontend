"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/vs2015.css';
import { RequestLog } from '@/types';
import styles from "@/styles/components/RequestDetailSidebar.module.scss";

interface RequestDetailSidebarProps {
  request: RequestLog;
  onClose: () => void;
}

type TabType = 'overview' | 'request' | 'response' | 'security';

// Register JSON language
hljs.registerLanguage('json', json);

export default function RequestDetailSidebar({ request, onClose }: RequestDetailSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const highlightJson = (value: any) => {
    try {
      // Handle different data types
      let jsonString: string;
      
      if (typeof value === 'string') {
        jsonString = value;
      } else if (typeof value === 'object' && value !== null) {
        jsonString = JSON.stringify(value, null, 2);
      } else if (value === null || value === undefined) {
        jsonString = 'null';
      } else {
        jsonString = String(value);
      }

      // Try to parse and format if it's valid JSON
      try {
        const parsed = JSON.parse(jsonString);
        const formatted = JSON.stringify(parsed, null, 2);
        return hljs.highlight(formatted, { language: 'json' }).value;
      } catch {
        // If not valid JSON, highlight as plain text
        return hljs.highlight(jsonString, { language: 'plaintext' }).value;
      }
    } catch (error) {
      console.error('Error highlighting JSON:', error);
      return hljs.highlight(String(value || ''), { language: 'plaintext' }).value;
    }
  };

  const getStatusCodeColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return '#059669';
    if (statusCode >= 400 && statusCode < 500) return '#D97706';
    if (statusCode >= 500) return '#DC2626';
    return '#6B7280';
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      // If less than 1 minute ago
      if (diffInMinutes < 1) {
        return 'Just now';
      }
      
      // If less than 1 hour ago
      if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      }
      
      // If less than 24 hours ago
      if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours}h ago`;
      }
      
      // If less than 7 days ago
      if (diffInMinutes < 10080) {
        const days = Math.floor(diffInMinutes / 1440);
        return `${days}d ago`;
      }
      
      // For older dates, show formatted date with time
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview' },
    { id: 'request' as TabType, label: 'Request' },
    { id: 'response' as TabType, label: 'Response' },
    { id: 'security' as TabType, label: 'Security' }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={styles.overlay}
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={styles.sidebar}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.requestInfo}>
              <div className={styles.methodPath}>
                <span className={styles.method}>{request.method}</span>
                <span className={styles.path}>{request.path}</span>
              </div>
              <div className={styles.statusTime}>
                <span 
                  className={styles.statusCode}
                  style={{ color: getStatusCodeColor(request.statusCode) }}
                >
                  {request.statusCode}
                </span>
                <span className={styles.timestamp}>{formatTimestamp(request.timestamp)}</span>
              </div>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className={styles.content}>
            {activeTab === 'overview' && (
              <div className={styles.overviewContent}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Status</span>
                    <span 
                      className={styles.infoValue}
                      style={{ color: getStatusCodeColor(request.statusCode) }}
                    >
                      {request.statusCode}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Method</span>
                    <span className={styles.infoValue}>{request.method}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Full Path</span>
                    <span className={styles.infoValue}>{request.path}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Timestamp</span>
                    <span className={styles.infoValue}>{formatTimestamp(request.timestamp)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Duration</span>
                    <span className={styles.infoValue}>{request.duration}ms</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>IP Address</span>
                    <span className={styles.infoValue}>{request.ipAddress}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Location</span>
                    <span className={styles.infoValue}>{request.location}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Security Score</span>
                    <span className={styles.infoValue}>{request.securityScore}/100</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Request Size</span>
                    <span className={styles.infoValue}>{request.requestSize} bytes</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Response Size</span>
                    <span className={styles.infoValue}>{request.responseSize} bytes</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'request' && (
              <div className={styles.requestContent}>
                {/* Headers */}
                <div className={styles.section}>
                  <button 
                    className={styles.sectionHeader}
                    onClick={() => toggleSection('requestHeaders')}
                  >
                    <span>Headers</span>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 16 16"
                      style={{ 
                        transform: expandedSections.has('requestHeaders') ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {expandedSections.has('requestHeaders') && (
                    <div className={styles.sectionContent}>
                      {Object.entries(request.requestHeaders).map(([key, value]) => (
                        <div key={key} className={styles.headerItem}>
                          <span className={styles.headerKey}>{key}:</span>
                          <span className={styles.headerValue}>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Query Params */}
                {request.queryParams && Object.keys(request.queryParams).length > 0 && (
                  <div className={styles.section}>
                    <button 
                      className={styles.sectionHeader}
                      onClick={() => toggleSection('queryParams')}
                    >
                      <span>Query Parameters</span>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16"
                        style={{ 
                          transform: expandedSections.has('queryParams') ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }}
                      >
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {expandedSections.has('queryParams') && (
                      <div className={styles.sectionContent}>
                        {Object.entries(request.queryParams).map(([key, value]) => (
                          <div key={key} className={styles.headerItem}>
                            <span className={styles.headerKey}>{key}:</span>
                            <span className={styles.headerValue}>{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Request Body */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span>Request Body</span>
                    {request.requestBody && (
                      <button 
                        className={styles.copyButton}
                        onClick={() => copyToClipboard(request.requestBody!)}
                      >
                        Copy
                      </button>
                    )}
                  </div>
                  <div className={styles.bodyContent}>
                    {request.requestBody ? (
                      <pre className={styles.codeBlock}>
                        <code 
                          dangerouslySetInnerHTML={{ 
                            __html: highlightJson(request.requestBody) 
                          }} 
                        />
                      </pre>
                    ) : (
                      <div className={styles.emptyBody}>No request body</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'response' && (
              <div className={styles.responseContent}>
                {/* Response Headers */}
                <div className={styles.section}>
                  <button 
                    className={styles.sectionHeader}
                    onClick={() => toggleSection('responseHeaders')}
                  >
                    <span>Headers</span>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 16 16"
                      style={{ 
                        transform: expandedSections.has('responseHeaders') ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {expandedSections.has('responseHeaders') && (
                    <div className={styles.sectionContent}>
                      {Object.entries(request.responseHeaders).map(([key, value]) => (
                        <div key={key} className={styles.headerItem}>
                          <span className={styles.headerKey}>{key}:</span>
                          <span className={styles.headerValue}>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Response Body */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span>Response Body</span>
                    {request.responseBody && (
                      <button 
                        className={styles.copyButton}
                        onClick={() => copyToClipboard(request.responseBody!)}
                      >
                        Copy
                      </button>
                    )}
                  </div>
                  <div className={styles.bodyContent}>
                    {request.responseBody ? (
                      <pre className={styles.codeBlock}>
                        <code 
                          dangerouslySetInnerHTML={{ 
                            __html: highlightJson(request.responseBody) 
                          }} 
                        />
                      </pre>
                    ) : (
                      <div className={styles.emptyBody}>No response body</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className={styles.securityContent}>
                <div className={styles.securityScore}>
                  <h3>Security Score</h3>
                  <div className={styles.scoreValue}>{request.securityScore}/100</div>
                </div>

                <div className={styles.securityIssues}>
                  <h3>Security Issues</h3>
                  {request.securityIssues.length > 0 ? (
                    <div className={styles.issuesList}>
                      {request.securityIssues.map((issue, index) => (
                        <div key={index} className={styles.issueItem}>
                          <div className={styles.issueHeader}>
                            <span 
                              className={`${styles.severityBadge} ${styles[issue.severity]}`}
                            >
                              {issue.severity.toUpperCase()}
                            </span>
                            <span className={styles.issueTitle}>{issue.title}</span>
                          </div>
                          <p className={styles.issueDescription}>{issue.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.noIssues}>No security issues detected</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
