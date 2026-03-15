import { ChatWidget } from '@/features/chat/components/ChatWidget';
import { Header } from '@/shared/components/layout/Header';
import { ViewportHeightSync } from '@/shared/components/layout/ViewportHeightSync';

export default function DashboardShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ViewportHeightSync />
      <div className="dashboard-shell bg-[var(--bg-app)]">
        <Header />
        <div className="flex flex-1 min-h-0 pb-[var(--safe-bottom)] md:overflow-hidden">
          {children}
        </div>
      </div>
      <ChatWidget />
    </>
  );
}
