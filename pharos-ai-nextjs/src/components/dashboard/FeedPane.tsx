'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchDashboardOutlooks } from '@/store/slices/dashboardSlice';
import { Clock, FileText } from 'lucide-react';

interface Props { topicId: string; selectedItem: string | null; onSelect: (id: string) => void; }

const SEP    = 'rgba(0,0,0,0.09)';
const LABEL  = 'rgba(0,0,0,0.88)';
const LABEL2 = 'rgba(0,0,0,0.50)';
const LABEL3 = 'rgba(0,0,0,0.28)';

const TOPIC_PILL: Record<string, { bg: string; text: string; border: string }> = {
  'middle-east':  { bg: 'rgba(255,149,0,0.10)',  text: '#B36800', border: 'rgba(255,149,0,0.20)' },
  'ukraine':      { bg: 'rgba(0,122,255,0.10)',  text: '#0055B3', border: 'rgba(0,122,255,0.20)' },
  'china-taiwan': { bg: 'rgba(255,59,48,0.10)',  text: '#CC1400', border: 'rgba(255,59,48,0.20)' },
  'nato':         { bg: 'rgba(175,82,222,0.10)', text: '#7A27B3', border: 'rgba(175,82,222,0.20)' },
  'cyber':        { bg: 'rgba(40,205,65,0.10)',  text: '#1A8C2E', border: 'rgba(40,205,65,0.20)' },
  'default':      { bg: 'rgba(142,142,147,0.10)', text: '#555558', border: 'rgba(142,142,147,0.20)' },
};

function pillColor(slug: string) { return TOPIC_PILL[slug] || TOPIC_PILL['default']; }
function slugify(name: string) { return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export function FeedPane({ topicId, selectedItem, onSelect }: Props) {
  const dispatch = useAppDispatch();
  const { latestOutlooks, loading } = useAppSelector(s => s.dashboard);

  useEffect(() => { dispatch(fetchDashboardOutlooks()); }, [dispatch]);

  const items = topicId === 'all'
    ? latestOutlooks
    : latestOutlooks.filter(o => o.topic_id === topicId || slugify(o.topic_name) === topicId);

  const title = topicId === 'all'
    ? 'All Topics'
    : (latestOutlooks.find(o => o.topic_id === topicId)?.topic_name ?? 'Topic');

  return (
    <div style={{
      width: 310, minWidth: 310, flexShrink: 0,
      borderRight: `0.5px solid ${SEP}`,
      background: '#F8F8F8',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        padding: '12px 16px 10px',
        borderBottom: `0.5px solid ${SEP}`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: LABEL, letterSpacing: '-0.02em', fontFamily: '-apple-system, "SF Pro Display", Inter, sans-serif' }}>
            {title}
          </span>
          <span style={{ marginLeft: 8, fontSize: 12, color: LABEL3, fontWeight: 400 }}>
            {items.length} topic{items.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading.outlooks && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
            <span style={{ fontSize: 12, color: LABEL3 }}>Loading…</span>
          </div>
        )}
        {!loading.outlooks && items.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 16px', gap: 8 }}>
            <FileText size={32} style={{ color: LABEL3, opacity: 0.4 }} strokeWidth={1} />
            <span style={{ fontSize: 13, color: LABEL3 }}>No outlooks available</span>
          </div>
        )}
        {items.map(item => {
          const isSelected = selectedItem === item.topic_id;
          const slug = slugify(item.topic_name);
          const pc = pillColor(slug);
          const outlook = item.latest_outlook;

          return (
            <button
              key={item.topic_id}
              onClick={() => onSelect(item.topic_id)}
              style={{
                width: '100%', textAlign: 'left',
                padding: '10px 14px 10px 16px',
                borderBottom: `0.5px solid ${SEP}`,
                background: isSelected ? '#2F6EBA' : 'transparent',
                border: 'none', cursor: 'default', fontFamily: 'inherit',
                display: 'block', transition: 'background 0.08s',
              }}
              onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.03)'; }}
              onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {/* Pill + date */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                  border: `0.5px solid ${isSelected ? 'rgba(255,255,255,0.30)' : pc.border}`,
                  background: isSelected ? 'rgba(255,255,255,0.20)' : pc.bg,
                  color: isSelected ? 'white' : pc.text,
                }}>
                  {item.topic_name}
                </span>
                <span style={{ fontSize: 11, color: isSelected ? 'rgba(255,255,255,0.60)' : LABEL3 }}>
                  {outlook?.date ?? '—'}
                </span>
              </div>

              {/* Title */}
              <p style={{
                fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, marginBottom: 4,
                color: isSelected ? 'white' : LABEL,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {outlook?.title ?? 'No outlook yet'}
              </p>

              {/* Summary */}
              <p style={{
                fontSize: 11.5, lineHeight: 1.4,
                color: isSelected ? 'rgba(255,255,255,0.75)' : LABEL2,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {outlook?.summary ?? 'No recent intelligence briefing.'}
              </p>

              {/* Meta */}
              {outlook && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: isSelected ? 'rgba(255,255,255,0.55)' : LABEL3 }}>
                    <Clock size={10} strokeWidth={1.5} />
                    {outlook.readTime}
                  </span>
                  {outlook.sourceCount != null && (
                    <span style={{ fontSize: 11, color: isSelected ? 'rgba(255,255,255,0.55)' : LABEL3 }}>
                      {outlook.sourceCount} sources
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
