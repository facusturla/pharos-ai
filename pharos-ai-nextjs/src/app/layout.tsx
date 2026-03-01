import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Pharos Intelligence',
  description: 'Geopolitical Intelligence Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <Header />
          <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {children}
          </div>
        </div>
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
