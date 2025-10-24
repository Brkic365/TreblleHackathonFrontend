"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AuthDebugPage() {
  const { data: session, status } = useSession();
  const [testResult, setTestResult] = useState<string>('');

  const testBackendAuth = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-api-key': process.env.NEXT_PUBLIC_INTERNAL_API_KEY || '',
        },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Authentication Debug Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Session Status: {status}</h2>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Environment Variables:</h2>
        <p>NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL}</p>
        <p>NEXT_PUBLIC_INTERNAL_API_KEY: {process.env.NEXT_PUBLIC_INTERNAL_API_KEY ? 'Set' : 'Not set'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Backend Auth Test:</h2>
        <button onClick={testBackendAuth} style={{ padding: '10px', marginBottom: '10px' }}>
          Test Backend Authentication
        </button>
        <pre>{testResult}</pre>
      </div>
    </div>
  );
}
