import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';

    // Mock errors data
    const errorTypes = [
      { message: 'Database connection timeout', severity: 'high', errorType: 'database_timeout' },
      { message: 'Invalid authentication token', severity: 'medium', errorType: 'auth_invalid_token' },
      { message: 'Rate limit exceeded', severity: 'low', errorType: 'rate_limit' },
      { message: 'Internal server error', severity: 'high', errorType: 'internal_error' },
      { message: 'Validation failed', severity: 'medium', errorType: 'validation_error' },
    ];

    const mockErrors = errorTypes.slice(0, Math.floor(Math.random() * 3) + 1).map((error, index) => ({
      id: `error-${index + 1}`,
      message: error.message,
      timestamp: getRandomTimestamp(timeRange),
      severity: error.severity as 'low' | 'medium' | 'high',
      occurrences: Math.floor(Math.random() * 200) + 1,
      errorType: error.errorType,
    }));

    return NextResponse.json(mockErrors);
  } catch (error) {
    console.error('Error in project errors API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project errors' },
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
