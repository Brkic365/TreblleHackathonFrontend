"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from "@/styles/pages/Projects.module.scss";
import Button from '@/app/components/Button';
import ApiEndpointCard from '@/app/components/ApiEndpointCard';
import CommonState from '@/app/components/CommonState';
import apiClient, { BackendProject } from '@/lib/apiClient';

// Define a type for your project data for type safety
interface Project {
  id: string;
  name: string;
  proxyUrl: string;
  originalBaseUrl: string;
  status: 'healthy' | 'error';
  avgResponseTime: string;
  errors24h: number;
  createdAt: string;
  totalRequests: number;
  lastRequest: string;
  errorTypes: Record<string, number>;
}

// Helper function to convert backend project to frontend format
const convertBackendProject = (backendProject: BackendProject, requestCount: number = 0): Project => {
  // Use actual request count if provided, otherwise fall back to _count
  const totalRequests = requestCount || backendProject._count?.apiRequestLogs || 0;
  const avgResponseTime = totalRequests > 0 ? '120ms' : '0ms';
  const errors24h = Math.floor(totalRequests * 0.02); // Mock 2% error rate
  const status = errors24h > 5 ? 'error' : 'healthy';
  
  return {
    id: backendProject.id,
    name: backendProject.name,
    proxyUrl: backendProject.proxyUrl,
    originalBaseUrl: backendProject.originalBaseUrl,
    status,
    avgResponseTime,
    errors24h,
    createdAt: backendProject.createdAt,
    totalRequests,
    lastRequest: new Date().toISOString(), // Mock current time
    errorTypes: errors24h > 0 ? { '4xx': Math.floor(errors24h * 0.6), '5xx': Math.floor(errors24h * 0.4) } : {}
  };
};

export default function Projects() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectUrl, setNewProjectUrl] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      // Only fetch if the session is loaded and authenticated
      if (status === 'authenticated') {
        try {
          setIsLoading(true);
          setError(null);
          const backendProjects = await apiClient.getProjects();
          
          // Fetch request counts for each project
          const projectsWithCounts = await Promise.allSettled(
            backendProjects.map(async (backendProject) => {
              try {
                // Get the total count of requests for this project
                const requestsData = await apiClient.getProjectRequests(backendProject.id, {
                  page: 1,
                  limit: 1, // We only need the total count, not the actual requests
                  timeRange: '30d'
                });
                const requestCount = requestsData.pagination.total;
                return convertBackendProject(backendProject, requestCount);
              } catch (err) {
                console.warn(`Failed to fetch request count for project ${backendProject.id}:`, err);
                // Fall back to using _count or 0
                return convertBackendProject(backendProject);
              }
            })
          );
          
          // Extract successful results and handle failures gracefully
          const successfulProjects = projectsWithCounts
            .filter((result): result is PromiseFulfilledResult<Project> => result.status === 'fulfilled')
            .map(result => result.value);
          
          setProjects(successfulProjects);
        } catch (err: any) {
          console.error('Failed to fetch projects:', err);
          setError(err.message || 'Failed to fetch projects.');
          setProjects([]);
        } finally {
          setIsLoading(false);
        }
      } else if (status === 'unauthenticated') {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [status]); // Re-run the effect when the session status changes

  const handleAddNewApi = () => {
    setShowCreateForm(true);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !newProjectUrl.trim()) {
      alert('Please fill in both project name and URL');
      return;
    }

    try {
      setIsCreatingProject(true);
      const backendProject = await apiClient.createProject(newProjectName.trim(), newProjectUrl.trim());
      const convertedProject = convertBackendProject(backendProject);
      setProjects(prev => [...prev, convertedProject]);
      setNewProjectName('');
      setNewProjectUrl('');
      setShowCreateForm(false);
    } catch (err: any) {
      console.error('Failed to create project:', err);
      alert(`Failed to create project: ${err.message}`);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setNewProjectName('');
    setNewProjectUrl('');
  };

  const handleViewProject = (endpointId: string) => {
    router.push(`/projects/${endpointId}/overview`);
  };

  // Show loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className={styles.projects}>
        <div className={styles.projectsContent}>
          <CommonState 
            type="loading" 
            message="Loading projects..." 
          />
        </div>
      </div>
    );
  }

  // Show error state
  if (error && projects.length === 0) {
    return (
      <div className={styles.projects}>
        <div className={styles.projectsContent}>
          <CommonState 
            type="error" 
            title="Error Loading Projects"
            message={error}
            onRetry={() => window.location.reload()}
            icon="⚠️"
          />
        </div>
      </div>
    );
  }

  const isEmpty = projects.length === 0;

  return (
    <div className={styles.projects}>
      <div className={styles.projectsContent}>
        {isEmpty ? (
          // Empty State - Onboarding
          <div className={styles.emptyState}>
            <div className={styles.emptyStateContent}>
              <h1>Welcome to RunTime!</h1>
              <p>Let's start monitoring your first API.</p>
              {showCreateForm ? (
                <div className={styles.createForm}>
                  <h3>Create Your First Project</h3>
                  <div className={styles.formGroup}>
                    <label>Project Name</label>
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="My API Project"
                      disabled={isCreatingProject}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>API Base URL</label>
                    <input
                      type="url"
                      value={newProjectUrl}
                      onChange={(e) => setNewProjectUrl(e.target.value)}
                      placeholder="https://api.example.com"
                      disabled={isCreatingProject}
                    />
                  </div>
                  <div className={styles.formActions}>
                    <Button 
                      text={isCreatingProject ? "Creating..." : "Create Project"} 
                      style="red" 
                      size="l" 
                      action={handleCreateProject}
                    />
                    <Button 
                      text="Cancel" 
                      style="secondary" 
                      size="l" 
                      action={handleCancelCreate}
                    />
                  </div>
                </div>
              ) : (
                <Button 
                  text="+ Add Your First API" 
                  style="red" 
                  size="l" 
                  action={handleAddNewApi} 
                />
              )}
            </div>
          </div>
        ) : (
          // Populated State - Projects List
          <div className={styles.populatedState}>
            <div className={styles.projectsHeader}>
              <div className={styles.headerLeft}>
                <h1>Your Projects</h1>
                <p className={styles.subtitle}>Monitor and analyze your API performance</p>
                {error && (
                  <p className={styles.warningText}>
                    ⚠️ Using fallback data. Backend connection failed: {error}
                  </p>
                )}
              </div>
              <Button 
                text="+ Add New API" 
                style="red" 
                size="m" 
                action={handleAddNewApi} 
              />
            </div>

            {showCreateForm ? (
              <div className={styles.createForm}>
                <h3>Add New Project</h3>
                <div className={styles.formGroup}>
                  <label>Project Name</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="My API Project"
                    disabled={isCreatingProject}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>API Base URL</label>
                  <input
                    type="url"
                    value={newProjectUrl}
                    onChange={(e) => setNewProjectUrl(e.target.value)}
                    placeholder="https://api.example.com"
                    disabled={isCreatingProject}
                  />
                </div>
                <div className={styles.formActions}>
                  <Button 
                    text={isCreatingProject ? "Creating..." : "Create Project"} 
                    style="red" 
                    size="l" 
                    action={handleCreateProject}
                  />
                  <Button 
                    text="Cancel" 
                    style="secondary" 
                    size="l" 
                    action={handleCancelCreate}
                  />
                </div>
              </div>
            ) : (
              <div className={styles.projectsGrid}>
                {projects.map((project) => (
                  <ApiEndpointCard
                    key={project.id}
                    endpoint={project}
                    onViewRequests={() => handleViewProject(project.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

