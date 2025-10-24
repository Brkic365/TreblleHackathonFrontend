import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';

    // Mock data based on time range
    const mockData = {
      kpis: {
        avgResponseTime: Math.random() * 200 + 50, // 50-250ms
        errorRate: Math.random() * 2, // 0-2%
        securityScore: Math.random() * 20 + 80, // 80-100
        uptime: Math.random() * 5 + 95, // 95-100%
        totalRequests: Math.floor(Math.random() * 50000) + 10000, // 10k-60k
        errorCount: Math.floor(Math.random() * 200) + 10, // 10-210
        securityIssueCount: Math.floor(Math.random() * 10) + 1, // 1-11
      },
      requestVolumeData: generateTimeSeriesData(timeRange, 'volume'),
      responseTimeData: generateTimeSeriesData(timeRange, 'response'),
      errors: generateMockErrors(timeRange),
      securityIssues: generateMockSecurityIssues(timeRange),
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error in project overview API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project overview data' },
      { status: 500 }
    );
  }
}

function generateTimeSeriesData(timeRange: string, type: 'volume' | 'response') {
  const intervals = getTimeIntervals(timeRange);
  
  return intervals.map((time, index) => ({
    time,
    value: type === 'volume' 
      ? Math.floor(Math.random() * 10000) + 1000 // 1k-11k requests
      : Math.floor(Math.random() * 150) + 50 // 50-200ms
  }));
}

function generateMockErrors(timeRange: string) {
  const errorTypes = [
    { message: 'Database connection timeout', severity: 'high', errorType: 'database_timeout' },
    { message: 'Invalid authentication token', severity: 'medium', errorType: 'auth_invalid_token' },
    { message: 'Rate limit exceeded', severity: 'low', errorType: 'rate_limit' },
    { message: 'Internal server error', severity: 'high', errorType: 'internal_error' },
    { message: 'Validation failed', severity: 'medium', errorType: 'validation_error' },
  ];

  return errorTypes.slice(0, Math.floor(Math.random() * 3) + 1).map((error, index) => ({
    id: `error-${index + 1}`,
    message: error.message,
    timestamp: getRandomTimestamp(timeRange),
    severity: error.severity as 'low' | 'medium' | 'high',
    occurrences: Math.floor(Math.random() * 200) + 1,
    errorType: error.errorType,
  }));
}

function generateMockSecurityIssues(timeRange: string) {
  const issueTypes = [
    { title: 'Missing HTTPS enforcement', severity: 'high', description: 'Some endpoints are accessible via HTTP' },
    { title: 'Weak password policy', severity: 'medium', description: 'Password requirements are too lenient' },
    { title: 'Exposed API key in logs', severity: 'critical', description: 'API keys found in application logs' },
    { title: 'SQL injection vulnerability', severity: 'critical', description: 'Potential SQL injection in user input' },
    { title: 'CORS misconfiguration', severity: 'medium', description: 'CORS policy allows all origins' },
  ];

  return issueTypes.slice(0, Math.floor(Math.random() * 3) + 1).map((issue, index) => ({
    id: `security-${index + 1}`,
    title: issue.title,
    severity: issue.severity as 'low' | 'medium' | 'high' | 'critical',
    timestamp: getRandomTimestamp(timeRange),
    description: issue.description,
  }));
}

function getTimeIntervals(timeRange: string): string[] {
  switch (timeRange) {
    case '1h':
      return Array.from({ length: 12 }, (_, i) => {
        const minutes = i * 5;
        return `${Math.floor(minutes / 60)}:${(minutes % 60).toString().padStart(2, '0')}`;
      });
    case '24h':
      return Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    case '7d':
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    case '30d':
      return Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
    default:
      return Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  }
}

function getRandomTimestamp(timeRange: string): string {
  const now = new Date();
  let timeAgo: number;

  switch (timeRange) {
    case '1h':
      timeAgo = Math.random() * 60; // 0-60 minutes ago
      break;
    case '24h':
      timeAgo = Math.random() * 24 * 60; // 0-24 hours ago
      break;
    case '7d':
      timeAgo = Math.random() * 7 * 24 * 60; // 0-7 days ago
      break;
    case '30d':
      timeAgo = Math.random() * 30 * 24 * 60; // 0-30 days ago
      break;
    default:
      timeAgo = Math.random() * 24 * 60; // 0-24 hours ago
  }

  const timestamp = new Date(now.getTime() - timeAgo * 60 * 1000);
  
  if (timeRange === '1h') {
    const minutes = Math.floor(timeAgo);
    return minutes === 0 ? 'Just now' : `${minutes} minutes ago`;
  } else if (timeRange === '24h') {
    const hours = Math.floor(timeAgo / 60);
    return hours === 0 ? 'Less than an hour ago' : `${hours} hours ago`;
  } else if (timeRange === '7d') {
    const days = Math.floor(timeAgo / (24 * 60));
    return days === 0 ? 'Today' : `${days} days ago`;
  } else {
    const days = Math.floor(timeAgo / (24 * 60));
    return days === 0 ? 'Today' : `${days} days ago`;
  }
}
