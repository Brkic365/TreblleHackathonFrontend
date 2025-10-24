import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsQueryParams {
  from?: string;
  to?: string;
  projects?: string;
}

// Mock data generators
function generateProjectPerformance(projectIds: string[] = []) {
  const projects = [
    { id: '1', name: 'User Service API' },
    { id: '2', name: 'Payment Gateway API' },
    { id: '3', name: 'Notification Service' },
    { id: '4', name: 'Analytics API' },
    { id: '5', name: 'File Storage API' },
  ];

  const filteredProjects = projectIds.length > 0 
    ? projects.filter(p => projectIds.includes(p.id))
    : projects;

  return filteredProjects.map(project => ({
    projectId: project.id,
    projectName: project.name,
    avgLatency: Math.floor(Math.random() * 500) + 50,
    totalRequests: Math.floor(Math.random() * 100000) + 10000,
    errorRate: Math.random() * 5,
  }));
}

function generateLatencyByCountry() {
  const countries = [
    { name: 'United States', code: 'us' },
    { name: 'United Kingdom', code: 'gb' },
    { name: 'Germany', code: 'de' },
    { name: 'Japan', code: 'jp' },
    { name: 'Australia', code: 'au' },
    { name: 'Canada', code: 'ca' },
    { name: 'France', code: 'fr' },
    { name: 'Brazil', code: 'br' },
    { name: 'India', code: 'in' },
    { name: 'Singapore', code: 'sg' },
  ];

  return countries.map(country => ({
    country: country.name,
    countryCode: country.code,
    avgLatency: Math.floor(Math.random() * 300) + 50,
    totalRequests: Math.floor(Math.random() * 50000) + 5000,
    errorRate: Math.random() * 3,
  }));
}

function generateTopSlowestEndpoints() {
  const endpoints = [
    { endpoint: '/api/users/profile', method: 'GET' },
    { endpoint: '/api/payments/process', method: 'POST' },
    { endpoint: '/api/files/upload', method: 'POST' },
    { endpoint: '/api/analytics/reports', method: 'GET' },
    { endpoint: '/api/notifications/send', method: 'POST' },
    { endpoint: '/api/users/search', method: 'GET' },
    { endpoint: '/api/payments/refund', method: 'POST' },
    { endpoint: '/api/files/download', method: 'GET' },
  ];

  return endpoints.map(endpoint => ({
    endpoint: endpoint.endpoint,
    method: endpoint.method,
    avgLatency: Math.floor(Math.random() * 1000) + 200,
    totalRequests: Math.floor(Math.random() * 20000) + 1000,
    errorRate: Math.random() * 2,
    lastError: Math.random() > 0.7 ? 'Timeout after 30s' : undefined,
  })).sort((a, b) => b.avgLatency - a.avgLatency);
}

function generateTopErroredEndpoints() {
  const endpoints = [
    { endpoint: '/api/payments/process', method: 'POST' },
    { endpoint: '/api/users/authenticate', method: 'POST' },
    { endpoint: '/api/files/upload', method: 'POST' },
    { endpoint: '/api/notifications/send', method: 'POST' },
    { endpoint: '/api/payments/refund', method: 'POST' },
    { endpoint: '/api/users/register', method: 'POST' },
    { endpoint: '/api/analytics/export', method: 'GET' },
    { endpoint: '/api/files/process', method: 'POST' },
  ];

  return endpoints.map(endpoint => ({
    endpoint: endpoint.endpoint,
    method: endpoint.method,
    avgLatency: Math.floor(Math.random() * 400) + 100,
    totalRequests: Math.floor(Math.random() * 15000) + 500,
    errorRate: Math.random() * 15 + 5, // Higher error rates
    lastError: Math.random() > 0.5 ? 'Database connection failed' : 'Invalid request format',
  })).sort((a, b) => b.errorRate - a.errorRate);
}

function generateRequestsOverTime(from?: string, to?: string) {
  const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = to ? new Date(to) : new Date();
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  
  const data = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const successful = Math.floor(Math.random() * 5000) + 2000;
    const errors = Math.floor(Math.random() * 200) + 50;
    
    data.push({
      timestamp: date.toISOString(),
      successful,
      errors,
      total: successful + errors,
    });
  }
  
  return data;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const projects = searchParams.get('projects');
    
    const projectIds = projects ? projects.split(',') : [];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const analyticsData = {
      projectPerformance: generateProjectPerformance(projectIds),
      latencyByCountry: generateLatencyByCountry(),
      topSlowestEndpoints: generateTopSlowestEndpoints(),
      topErroredEndpoints: generateTopErroredEndpoints(),
      requestsOverTime: generateRequestsOverTime(from || undefined, to || undefined),
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
