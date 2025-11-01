import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get the backend API URL and internal API key from environment
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const internalApiKey = process.env.INTERNAL_API_KEY;

    if (!backendUrl || !internalApiKey) {
      console.error('Server configuration missing:', { 
        hasBackendUrl: !!backendUrl, 
        hasApiKey: !!internalApiKey 
      });
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Call the backend API with the internal API key
    const response = await fetch(`${backendUrl}/api/auth/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-key': internalApiKey,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Session creation failed' },
        { status: response.status }
      );
    }

    // Return the session data (including JWT token)
    return NextResponse.json(data);
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

