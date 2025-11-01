import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, provider, providerId } = body;

    // Validate required fields
    if (!email || !name || !provider || !providerId) {
      return NextResponse.json(
        { error: 'Email, name, provider, and providerId are required' },
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
    const response = await fetch(`${backendUrl}/api/auth/oauth-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-key': internalApiKey,
      },
      body: JSON.stringify({ email, name, provider, providerId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'OAuth user creation failed' },
        { status: response.status }
      );
    }

    // Return the user data
    return NextResponse.json(data);
  } catch (error) {
    console.error('OAuth user creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

