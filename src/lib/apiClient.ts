import { getSession } from 'next-auth/react';
import { RequestLog, EndpointItem } from '@/types';

// Types for backend API responses
export interface BackendUser {
  id: string;
  email: string;
}

export interface BackendProject {
  id: string;
  name: string;
  originalBaseUrl: string;
  proxyUrl: string;
  userId: string;
  createdAt: string;
  _count?: {
    apiRequestLogs: number;
  };
}

export interface BackendRequestLog {
  id: string;
  method: string;
  path: string;
  responseCode: number;
  durationMs: number;
  ipAddress: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  securityScore: number;
  securityIssues: Array<{
    type: string;
    severity: string;
    description: string;
    recommendation: string;
  }>;
  createdAt: string;
}

export interface BackendAnalytics {
  kpis: {
    totalRequests: number;
    avgLatency: number;
  };
  projectPerformance: Array<{
    apiEndpointId: string;
    _avg: {
      durationMs: number;
    };
    _count?: {
      id: number;
      error?: number;
    };
  }>;
  latencyByCountry?: Array<{
    country: string;
    countryCode: string;
    avgLatency: number;
    totalRequests: number;
    errorRate: number;
  }>;
  topSlowestEndpoints?: Array<{
    endpoint: string;
    method: string;
    avgLatency: number;
    totalRequests: number;
    errorRate: number;
  }>;
  topErroredEndpoints?: Array<{
    endpoint: string;
    method: string;
    avgLatency: number;
    totalRequests: number;
    errorRate: number;
  }>;
  requestsOverTime: Array<{
    createdAt: string;
    _count: {
      id: number;
    };
  }>;
}

export interface ProjectOverviewKPIs {
  avgResponseTime: number;
  errorRate: number;
  securityScore: number;
  uptime: number;
  totalRequests: number;
  errorCount: number;
  securityIssueCount: number;
}

export interface ProjectOverviewChartData {
  time: string;
  value: number;
}

export interface ProjectOverviewError {
  id: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  occurrences: number;
  errorType: string;
}

export interface ProjectOverviewSecurityIssue {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  description: string;
  recommendation?: string;
}

const apiClient = {
  async request(method: string, path: string, body?: any, options: RequestInit = {}) {
    const session = await getSession();
    const token = session?.accessToken; // The JWT from our Express backend

    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    // Add internal API key for auth endpoints
    if (path.startsWith('/auth/')) {
      headers.append('x-internal-api-key', process.env.NEXT_PUBLIC_INTERNAL_API_KEY || '');
    }

    // If a token exists, add the Authorization header
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    const requestOptions: RequestInit = {
      method,
      headers,
      ...options,
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }
    
    // Construct the full URL
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${path}`;

    try {
      const response = await fetch(fullUrl, requestOptions);

      if (!response.ok) {
        // If the server responds with an error, try to parse it as JSON
        const errorData = await response.json().catch(() => ({}));

        console.log(errorData);

        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      
      // If the response has no content (e.g., 204 No Content), return null
      if (response.status === 204) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Client Error: ${method} ${path}`, error);
      throw error;
    }
  },

  // Authentication endpoints
  async createSession(email: string) {
    return this.request('POST', '/api/auth/session', { email });
  },

  async createOAuthUser(userData: {
    email: string;
    name: string;
    provider: string;
    providerId: string;
  }) {
    return this.request('POST', '/api/auth/oauth-user', userData);
  },

  // Project endpoints
  async getProjects(): Promise<BackendProject[]> {
    return this.request('GET', '/api/projects');
  },

  async getProject(projectId: string): Promise<BackendProject> {
    return this.request('GET', `/api/projects/${projectId}`);
  },

  async createProject(name: string, originalBaseUrl: string): Promise<BackendProject> {
    return this.request('POST', '/api/projects', { name, originalBaseUrl });
  },

  async updateProject(projectId: string, data: { name?: string; originalBaseUrl?: string }): Promise<BackendProject> {
    return this.request('PUT', `/api/projects/${projectId}`, data);
  },

  // Project statistics endpoint
  async getProjectStats(projectId: string): Promise<{
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    lastRequest: string;
  }> {
    return this.request('GET', `/api/projects/${projectId}/stats`);
  },

  // Request logs endpoints
  async getProjectRequests(
    projectId: string, 
    options: {
      page?: number;
      limit?: number;
      method?: string;
      statusCode?: string;
      timeRange?: string;
      sortBy?: string;
      order?: string;
    } = {}
  ): Promise<{
    requests: RequestLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters: {
      method: string;
      statusCode: string;
      sortBy: string;
      order: string;
    };
  }> {
    const params = new URLSearchParams();
    
    // Handle each parameter according to backend expectations
    if (options.page !== undefined) {
      params.append('page', options.page.toString());
    }
    
    if (options.limit !== undefined) {
      params.append('limit', options.limit.toString());
    }
    
    // Only send method if it's not 'all' (backend checks for method !== 'all')
    if (options.method && options.method !== 'all') {
      params.append('method', options.method);
    }
    
    // Only send statusCode if it's not 'all' (backend checks for statusCode !== 'all')
    if (options.statusCode && options.statusCode !== 'all') {
      params.append('statusCode', options.statusCode);
    }
    
    // Only send timeRange if it's not the default
    if (options.timeRange && options.timeRange !== '24h') {
      params.append('timeRange', options.timeRange);
    }
    
    // Map timestamp to createdAt for backend compatibility
    const sortBy = options.sortBy === 'timestamp' ? 'createdAt' : (options.sortBy || 'createdAt');
    params.append('sortBy', sortBy);
    
    // Default order is 'desc' in backend
    const order = options.order || 'desc';
    params.append('order', order);
    
    const queryString = params.toString();
    const path = `/api/projects/${projectId}/requests${queryString ? `?${queryString}` : ''}`;
    
    return this.request('GET', path);
  },

  // Endpoints endpoints
  async getProjectEndpoints(
    projectId: string, 
    options: {
      page?: number;
      limit?: number;
      method?: string;
      status?: string;
      timeRange?: string;
      sortBy?: string;
      order?: string;
    } = {}
  ): Promise<{
    endpoints: EndpointItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters: {
      method: string;
      status: string;
      sortBy: string;
      order: string;
    };
  }> {
    const params = new URLSearchParams();
    
    // Handle each parameter according to backend expectations
    if (options.page !== undefined) {
      params.append('page', options.page.toString());
    }
    
    if (options.limit !== undefined) {
      params.append('limit', options.limit.toString());
    }
    
    // Only send method if it's not 'all'
    if (options.method && options.method !== 'all') {
      params.append('method', options.method);
    }
    
    // Only send status if it's not 'all'
    if (options.status && options.status !== 'all') {
      params.append('status', options.status);
    }
    
    // Send timeRange for stats calculation - backend should show ALL endpoints but calculate stats for this timeframe
    if (options.timeRange) {
      params.append('timeRange', options.timeRange);
    }
    
    // Default sortBy and order
    const sortBy = options.sortBy || 'path';
    params.append('sortBy', sortBy);
    
    const order = options.order || 'asc';
    params.append('order', order);
    
    const queryString = params.toString();
    const path = `/api/projects/${projectId}/endpoints${queryString ? `?${queryString}` : ''}`;
    
    return this.request('GET', path);
  },

  // Analytics endpoints
  async getAnalytics(options: {
    startDate?: string;
    endDate?: string;
    projectIds?: string[];
  } = {}): Promise<BackendAnalytics> {
    const params = new URLSearchParams();
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.projectIds?.length) params.append('projectIds', options.projectIds.join(','));
    
    const queryString = params.toString();
    const path = `/api/analytics${queryString ? `?${queryString}` : ''}`;
    
    return this.request('GET', path);
  },

  // User Registration endpoint
  async registerUser(data: { 
    name: string; 
    email: string; 
    password: string; 
  }): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      const response = await this.request('POST', '/api/auth/register', data);
      
      // If backend returns user data directly (with id, email, etc.), consider it a success
      if (response && (response.success === true || response.id || response.user)) {
        return {
          success: true,
          message: 'User registered successfully',
          user: response.user || response
        };
      }
      
      // Otherwise return the response as-is
      return response;
    } catch (error) {
      // If there's an error, return it in the expected format
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message
        };
      }
      return {
        success: false,
        message: 'Failed to register user'
      };
    }
  },

  // User Profile endpoints
  async updateUserProfile(data: { name: string }): Promise<{ success: boolean; message: string }> {
    return this.request('PUT', '/api/user/profile', data);
  },

  async changePassword(data: { 
    currentPassword: string; 
    newPassword: string; 
  }): Promise<{ success: boolean; message: string }> {
    return this.request('PUT', '/api/user/password', data);
  },

  async exportUserData(): Promise<any> {
    return this.request('GET', '/api/user/export');
  },

  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    return this.request('DELETE', '/api/user/account');
  },

  // Project overview endpoints
  async getProjectOverview(projectId: string, timeRange: string = '24h'): Promise<{
    kpis: ProjectOverviewKPIs;
    requestVolumeData: ProjectOverviewChartData[];
    responseTimeData: ProjectOverviewChartData[];
    errors: ProjectOverviewError[];
    securityIssues: ProjectOverviewSecurityIssue[];
  }> {
    const params = new URLSearchParams();
    params.append('timeRange', timeRange);
    
    const queryString = params.toString();
    const path = `/api/projects/${projectId}/overview${queryString ? `?${queryString}` : ''}`;
    
    return this.request('GET', path);
  },

  async getProjectKPIs(projectId: string, timeRange: string = '24h'): Promise<ProjectOverviewKPIs> {
    const params = new URLSearchParams();
    params.append('timeRange', timeRange);
    
    const queryString = params.toString();
    const path = `/api/projects/${projectId}/kpis${queryString ? `?${queryString}` : ''}`;
    
    return this.request('GET', path);
  },

  async getProjectChartData(projectId: string, timeRange: string = '24h'): Promise<{
    requestVolumeData: ProjectOverviewChartData[];
    responseTimeData: ProjectOverviewChartData[];
  }> {
    const params = new URLSearchParams();
    params.append('timeRange', timeRange);
    
    const queryString = params.toString();
    const path = `/api/projects/${projectId}/charts${queryString ? `?${queryString}` : ''}`;
    
    return this.request('GET', path);
  },

  async getProjectErrors(projectId: string, timeRange: string = '24h'): Promise<ProjectOverviewError[]> {
    const params = new URLSearchParams();
    params.append('timeRange', timeRange);
    
    const queryString = params.toString();
    const path = `/api/projects/${projectId}/errors${queryString ? `?${queryString}` : ''}`;
    
    return this.request('GET', path);
  },

  async getProjectSecurityIssues(projectId: string, timeRange: string = '24h'): Promise<ProjectOverviewSecurityIssue[]> {
    const params = new URLSearchParams();
    params.append('timeRange', timeRange);
    
    const queryString = params.toString();
    const path = `/api/projects/${projectId}/security-issues${queryString ? `?${queryString}` : ''}`;
    
    return this.request('GET', path);
  },

  // Generic methods for other endpoints
  get(path: string) {
    return this.request('GET', path);
  },

  post(path: string, body: any) {
    return this.request('POST', path, body);
  },

  put(path: string, body: any) {
    return this.request('PUT', path, body);
  },
  
  delete(path: string) {
    return this.request('DELETE', path);
  },
};

export default apiClient;
