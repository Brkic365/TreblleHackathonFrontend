// Dashboard Types
export interface DashboardContextType {
  isGlobalSidebarCollapsed: boolean;
  toggleGlobalSidebar: () => void;
  activeProjectId: string | null;
  setActiveProjectId: (projectId: string | null) => void;
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  setIsMobileSidebarOpen: (isOpen: boolean) => void;
}

// Sidebar Types
export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

export interface ProjectTab {
  id: string;
  label: string;
  href: string;
  icon: string;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  status: 'healthy' | 'error';
  avgResponseTime: string;
  errors24h: number;
  proxyUrl: string;
  apiRoute?: string;
  createdAt: string;
  totalRequests: number;
  lastRequest?: string;
  errorTypes?: { [key: string]: number };
  statusChange?: {
    previousStatus: 'healthy' | 'error';
    changedAt: string;
    reason?: string;
  };
}

// API Endpoint Types
export interface ApiEndpoint {
  id: string;
  name: string;
  status: 'healthy' | 'error';
  avgResponseTime: string;
  errors24h: number;
  proxyUrl: string;
  createdAt: string;
  totalRequests: number;
  lastRequest?: string;
  errorTypes?: { [key: string]: number };
}

// Component Props Types
export interface LayoutProps {
  children: React.ReactNode;
}

export interface ProjectLayoutProps extends LayoutProps {
  projectId: string;
}

export interface ProjectSidebarProps {
  projectId: string;
}

// Endpoint Item interface for endpoints page
export interface EndpointItem {
  id: string;
  method: string;
  path: string;
  avgResponseTime: number;
  errorRate: number;
  requestCount: number;
  lastRequest: string;
  status: 'healthy' | 'warning' | 'error';
}

// Request Log interface for detailed request information
export interface RequestLog {
  id: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  ipAddress: string;
  location: string;
  duration: number;
  userAgent: string;
  requestHeaders: { [key: string]: string };
  requestBody?: string;
  queryParams?: { [key: string]: string };
  responseHeaders: { [key: string]: string };
  responseBody?: string;
  securityScore: number;
  securityIssues: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
  }>;
  requestSize: number;
  responseSize: number;
}
