import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';

    // Mock security issues data
    const issueTypes = [
      { title: 'Missing HTTPS enforcement', severity: 'high', description: 'Some endpoints are accessible via HTTP' },
      { title: 'Weak password policy', severity: 'medium', description: 'Password requirements are too lenient' },
      { title: 'Exposed API key in logs', severity: 'critical', description: 'API keys found in application logs' },
      { title: 'SQL injection vulnerability', severity: 'critical', description: 'Potential SQL injection in user input' },
      { title: 'CORS misconfiguration', severity: 'medium', description: 'CORS policy allows all origins' },
    ];

    const mockSecurityIssues = issueTypes.slice(0, Math.floor(Math.random() * 3) + 1).map((issue, index) => ({
      id: `security-${index + 1}`,
      title: issue.title,
      severity: issue.severity as 'low' | 'medium' | 'high' | 'critical',
      timestamp: getRandomTimestamp(timeRange),
      description: issue.description,
    }));

    return NextResponse.json(mockSecurityIssues);
  } catch (error) {
    console.error('Error in project security issues API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project security issues' },
      { status: 500 }
    );
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
