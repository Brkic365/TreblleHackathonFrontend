"use client";

import { useSession, getProviders } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function ProviderTestPage() {
  const { data: session, status } = useSession();
  const [providers, setProviders] = useState<any>(null);

  useEffect(() => {
    const loadProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    loadProviders();
  }, []);

  return (
    <div style={{ padding: '2rem', color: 'white', backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      <h1>Provider Configuration Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Environment Variables</h2>
        <p>GOOGLE_CLIENT_ID: {process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Not set'}</p>
        <p>GOOGLE_CLIENT_SECRET: {process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Not set'}</p>
        <p>GITHUB_ID: {process.env.GITHUB_ID ? '✅ Set' : '❌ Not set'}</p>
        <p>GITHUB_SECRET: {process.env.GITHUB_SECRET ? '✅ Set' : '❌ Not set'}</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Registered Providers</h2>
        {providers ? (
          <div>
            {Object.values(providers).map((provider: any) => (
              <div key={provider.name} style={{ 
                padding: '1rem', 
                margin: '0.5rem 0', 
                backgroundColor: '#333', 
                borderRadius: '4px' 
              }}>
                <strong>{provider.name}</strong> - {provider.type}
                {provider.type === 'oauth' && (
                  <div style={{ fontSize: '0.8em', color: '#888', marginTop: '0.5rem' }}>
                    ID: {provider.id}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>Loading providers...</p>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Session Status</h2>
        <p>Status: {status}</p>
        {session && (
          <div>
            <p>User: {session.user?.email}</p>
            <p>Access Token: {session.accessToken ? '✅ Present' : '❌ Missing'}</p>
            {session.accessToken && (
              <p style={{ fontSize: '0.8em', color: '#888' }}>
                Token: {session.accessToken.substring(0, 30)}...
              </p>
            )}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Console Logs</h2>
        <p>Check the browser console for detailed NextAuth logs (debug mode is enabled)</p>
        <p>Look for:</p>
        <ul>
          <li>Provider registration logs</li>
          <li>OAuth flow logs</li>
          <li>Callback execution logs</li>
          <li>Token flow logs</li>
        </ul>
      </div>
    </div>
  );
}
