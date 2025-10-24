import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';

    // Mock chart data
    const intervals = getTimeIntervals(timeRange);
    
    const mockChartData = {
      requestVolumeData: intervals.map((time, index) => ({
        time,
        value: Math.floor(Math.random() * 10000) + 1000 // 1k-11k requests
      })),
      responseTimeData: intervals.map((time, index) => ({
        time,
        value: Math.floor(Math.random() * 150) + 50 // 50-200ms
      }))
    };

    return NextResponse.json(mockChartData);
  } catch (error) {
    console.error('Error in project charts API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project chart data' },
      { status: 500 }
    );
  }
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
