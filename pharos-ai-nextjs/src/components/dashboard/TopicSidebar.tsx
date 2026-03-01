'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchAvailableTopics } from '@/store/slices/dashboardSlice';
import { Globe, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface Props { selected: string; onSelect: (id: string) => void; }

const NAV_ITEMS = [
  { id: 'all',      label: 'All Topics',   icon: Globe,          color: '#007AFF' },
  { id: 'timeline', label: 'Timeline',     icon: Clock,          color: '#FF9500' },
  { id: 'outlook',  label: 'Intelligence', icon: TrendingUp,     color: '#AF52DE' },
  { id: 'alerts',   label: 'Alerts',       icon: AlertTriangle,  color: '#FF3B30', badge: 3 },
];

const TOPIC_COLORS: Record<string, string> = {
  'middle-east':  '#FF9500',
  'ukraine':      '#007AFF',
  'china-taiwan': '#FF3B30',
  'nato':         '#AF52DE',
  'cyber':        '#28CD41',
  'default':      '#8E8E93',
};

function topicColor(slug: string) {
  return TOPIC_COLORS[slug] || TOPIC_COLORS['default'];
}

export function TopicSidebar({ selected, onSelect }: Props) {
  const dispatch = useAppDispatch();
  const { topics, loading } = useAppSelector(s => s.dashboard);

  useEffect(() => { dispatch(fetchAvailableTopics()); }, [dispatch]);

  return (
    <aside style={{
      width: 220,
      minWidth: 220,
      background: 'rgba(238,238,238,0.90)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderRight: '0.5px solid rgba(0,0,0,0.09)',
    }} className="flex flex-col overflow-y-auto py-2 flex-shrink-0">

      {/* Views section */}
      <SectionLabel>Views</SectionLabel>
      {NAV_ITEMS.map(({ id, label, icon: Icon, color, badge }) => (
        <SidebarRow
          key={id}
          active={selected === id}
          onClick={() => onSelect(id)}
          badge={badge}
        >
          <Icon size={15} strokeWidth={1.5} style={{ color: selected === id ? 'white' : color, flexShrink: 0 }} />
          {label}
        </SidebarRow>
      ))}

      <Divider />

      {/* Topics section */}
      <SectionLabel>Topics</SectionLabel>
      {loading.topics && (
        <div style={{ padding: '6px 14px', fontSize: 12, color: 'rgba(0,0,0,0.28)' }}>Loading…</div>
      )}
      {topics.map(t => {
        const color = topicColor(t.id);
        const isActive = selected === t.id;
        return (
          <SidebarRow
            key={t.id}
            active={isActive}
            onClick={() => onSelect(t.id)}
            badge={t.active_rss_feeds_count || undefined}
            badgeAlert={false}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isActive ? 'white' : color,
              flexShrink: 0, display: 'inline-block',
            }} />
            {t.name}
          </SidebarRow>
        );
      })}
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '10px 16px 3px',
      fontSize: 11,
      fontWeight: 600,
      color: 'rgba(0,0,0,0.30)',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.09)', margin: '6px 16px' }} />;
}

function SidebarRow({
  active, onClick, badge, badgeAlert = true, children,
}: {
  active: boolean;
  onClick: () => void;
  badge?: number;
  badgeAlert?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '6px 12px 6px 14px',
        borderRadius: 10,
        margin: '1px 6px',
        width: 'calc(100% - 12px)',
        textAlign: 'left',
        border: 'none',
        cursor: 'default',
        background: active ? '#2F6EBA' : 'transparent',
        transition: 'background 0.08s',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        color: active ? 'white' : 'rgba(0,0,0,0.88)',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      {children}
      {badge !== undefined && (
        <span style={{
          marginLeft: 'auto',
          fontSize: 11,
          fontWeight: badgeAlert ? 600 : 500,
          borderRadius: 10,
          padding: '1px 7px',
          minWidth: 22,
          textAlign: 'center',
          background: active
            ? 'rgba(255,255,255,0.25)'
            : badgeAlert
              ? '#FF3B30'
              : 'rgba(0,0,0,0.08)',
          color: active ? 'white' : badgeAlert ? 'white' : 'rgba(0,0,0,0.30)',
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}
