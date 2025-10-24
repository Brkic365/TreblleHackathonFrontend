import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';

    // Mock KPIs data
    const mockKPIs = {
      avgResponseTime: Math.random() * 200 + 50, // 50-250ms
      errorRate: Math.random() * 2, // 0-2%
      securityScore: Math.random() * 20 + 80, // 80-100
      uptime: Math.random() * 5 + 95, // 95-100%
      totalRequests: Math.floor(Math.random() * 50000) + 10000, // 10k-60k
      errorCount: Math.floor(Math.random() * 200) + 10, // 10-210
      securityIssueCount: Math.floor(Math.random() * 10) + 1, // 1-11
    };

    return NextResponse.json(mockKPIs);
  } catch (error) {
    console.error('Error in project KPIs API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project KPIs' },
      { status: 500 }
    );
  }
}
