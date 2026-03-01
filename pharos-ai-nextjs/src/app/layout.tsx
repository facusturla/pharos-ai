import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Pharos Intelligence',
  description: 'Geopolitical Intelligence Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>
          <div className="flex flex-col h-screen overflow-hidden">
            <Titlebar />
            <div className="flex flex-1 overflow-hidden">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

function Titlebar() {
  return (
    <div
      style={{
        height: 38,
        background: 'rgba(246,246,246,0.93)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '0.5px solid rgba(0,0,0,0.09)',
        flexShrink: 0,
      }}
      className="flex items-center px-4 gap-2 relative z-50"
    >
      {/* Centered window title */}
      <span
        className="absolute left-1/2 -translate-x-1/2 text-[13px] font-semibold tracking-[-0.01em] pointer-events-none"
        style={{ color: 'rgba(0,0,0,0.88)' }}
      >
        Pharos Intelligence
      </span>
    </div>
  );
}
