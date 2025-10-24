// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AnimatedGradientBackground from './components/AnimatedGradientBackground';
import ConditionalNavbar from './components/ConditionalNavbar';
import { DashboardProvider } from '@/context/DashboardContext';
import AuthProvider from './components/providers/AuthProvider';
import ScrollLockProvider from './components/providers/ScrollLockProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RunTime - API Monitoring Platform',
  description: 'Monitor and analyze your API performance with RunTime',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <DashboardProvider>
            <ScrollLockProvider>
              <AnimatedGradientBackground />
              <ConditionalNavbar />
              {children}
            </ScrollLockProvider>
          </DashboardProvider>
        </AuthProvider>
      </body>
    </html>
  );
}