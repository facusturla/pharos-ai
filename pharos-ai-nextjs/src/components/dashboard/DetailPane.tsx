'use client';
import { useAppSelector } from '@/hooks/redux';
import { useRouter } from 'next/navigation';
import { Clock, Globe, FileText, ArrowRight, BookOpen, Flag, Archive } from 'lucide-react';

interface Props { itemId: string | null; }

const LABEL  = 'rgba(0,0,0,0.88)';
const LABEL2 = 'rgba(0,0,0,0.50)';
const LABEL3 = 'rgba(0,0,0,0.28)';
const SEP    = 'rgba(0,0,0,0.09)';
const SYS_BLUE = '#007AFF';

const TOPIC_PILL: Record<string, { bg: string; text: string; border: string }> = {
  'middle-east':  { bg: 'rgba(255,149,0,0.10)',  text: '#B36800', border: 'rgba(255,149,0,0.20)' },
  'ukraine':      { bg: 'rgba(0,122,255,0.10)',  text: '#0055B3', border: 'rgba(0,122,255,0.20)' },
  'china-taiwan': { bg: 'rgba(255,59,48,0.10)',  text: '#CC1400', border: 'rgba(255,59,48,0.20)' },
  'nato':         { bg: 'rgba(175,82,222,0.10)', text: '#7A27B3', border: 'rgba(175,82,222,0.20)' },
  'cyber':        { bg: 'rgba(40,205,65,0.10)',  text: '#1A8C2E', border: 'rgba(40,205,65,0.20)' },
  'default':      { bg: 'rgba(142,142,147,0.10)', text: '#555558', border: 'rgba(142,142,147,0.20)' },
};

function slugify(name: string) { return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function pillColor(slug: string) { return TOPIC_PILL[slug] || TOPIC_PILL['default']; }

export function DetailPane({ itemId }: Props) {
  const router = useRouter();
  const { latestOutlooks } = useAppSelector(s => s.dashboard);
  const item = itemId ? latestOutlooks.find(o => o.topic_id === itemId) : null;
  const outlook = item?.latest_outlook ?? null;

  /* Empty state */
  if (!itemId || !item) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 10,
        background: '#FFFFFF',
      }}>
        <FileText size={44} style={{ color: LABEL3, opacity: 0.4 }} strokeWidth={1} />
        <p style={{ fontSize: 13, color: LABEL2, fontWeight: 500 }}>Select a topic to read</p>
        <p style={{ fontSize: 12, color: LABEL3 }}>Choose from the list on the left</p>
      </div>
    );
  }

  const slug = slugify(item.topic_name);
  const pc = pillColor(slug);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FFFFFF' }}>

      {/* Reading toolbar */}
      <div style={{
        height: 44, flexShrink: 0,
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 8,
        borderBottom: `0.5px solid ${SEP}`,
        background: 'rgba(246,246,246,0.93)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
            border: `0.5px solid ${pc.border}`, background: pc.bg, color: pc.text,
          }}>
            {item.topic_name}
          </span>
          {outlook?.date && (
            <span style={{ fontSize: 12, color: LABEL3 }}>{outlook.date}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <ActionBtn icon={<Flag size={12} strokeWidth={1.5} />} label="Flag" />
          <ActionBtn icon={<Archive size={12} strokeWidth={1.5} />} label="Archive" destructive />
          {outlook && (
            <ActionBtn
              icon={<ArrowRight size={12} strokeWidth={2} />}
              label="Full Briefing"
              primary
              onClick={() => router.push(`/outlook/${outlook.id}`)}
            />
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '28px 36px' }}>

          {!outlook ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: 12 }}>
              <BookOpen size={40} style={{ color: LABEL3, opacity: 0.4 }} strokeWidth={1} />
              <p style={{ fontSize: 14, fontWeight: 500, color: LABEL2 }}>No recent outlook</p>
              <p style={{ fontSize: 12, color: LABEL3, textAlign: 'center', maxWidth: 280 }}>
                No intelligence briefing has been generated for {item.topic_name} yet.
              </p>
            </div>
          ) : (
            <>
              {/* Tags */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11.5, fontWeight: 500, padding: '3px 10px', borderRadius: 20, border: `0.5px solid ${pc.border}`, background: pc.bg, color: pc.text }}>
                  {item.topic_name}
                </span>
                {outlook.confidenceScore != null && (
                  <span style={{ fontSize: 11.5, fontWeight: 500, padding: '3px 10px', borderRadius: 20, border: '0.5px solid rgba(40,205,65,0.20)', background: 'rgba(40,205,65,0.10)', color: '#1A8C2E' }}>
                    {Math.round(outlook.confidenceScore * 100)}% confidence
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 style={{
                fontFamily: '-apple-system, "SF Pro Display", Inter, sans-serif',
                fontSize: 22, fontWeight: 700, color: LABEL,
                lineHeight: 1.3, letterSpacing: '-0.025em', marginBottom: 10,
              }}>
                {outlook.title}
              </h1>

              {/* Meta */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                marginBottom: 20, paddingBottom: 16,
                borderBottom: `0.5px solid ${SEP}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: LABEL2 }}>
                  <Clock size={12} strokeWidth={1.5} />
                  {outlook.date} · {outlook.readTime}
                </div>
                {outlook.regions?.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: LABEL2 }}>
                    <Globe size={12} strokeWidth={1.5} />
                    {outlook.regions.join(', ')}
                  </div>
                )}
                {outlook.sourceCount != null && (
                  <span style={{ fontSize: 12, color: LABEL2 }}>{outlook.sourceCount} sources</span>
                )}
              </div>

              {/* Executive summary */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: LABEL3, marginBottom: 10 }}>
                  Situation Summary
                </div>
                <div style={{
                  background: 'rgba(0,122,255,0.05)',
                  border: '0.5px solid rgba(0,122,255,0.18)',
                  borderRadius: 14,
                  padding: '14px 16px',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: SYS_BLUE, marginBottom: 6 }}>
                    Intelligence Brief
                  </div>
                  <p style={{ fontSize: 13.5, color: LABEL, lineHeight: 1.65 }}>
                    {outlook.summary}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => router.push(`/outlook/${outlook.id}`)}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 16px', borderRadius: 10,
                  fontSize: 14, fontWeight: 600,
                  background: SYS_BLUE, color: 'white', border: 'none',
                  cursor: 'default', fontFamily: 'inherit',
                }}
              >
                Read Full Intelligence Briefing
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, primary, destructive, onClick }: {
  icon: React.ReactNode; label: string;
  primary?: boolean; destructive?: boolean; onClick?: () => void;
}) {
  const bg = primary ? '#007AFF' : destructive ? 'rgba(255,59,48,0.09)' : 'rgba(0,0,0,0.06)';
  const color = primary ? 'white' : destructive ? '#FF3B30' : 'rgba(0,0,0,0.88)';
  const border = primary ? 'rgba(0,0,100,0.2)' : destructive ? 'rgba(255,59,48,0.2)' : 'rgba(0,0,0,0.10)';

  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 6,
      background: bg, border: `0.5px solid ${border}`,
      fontSize: 12, fontWeight: 500, color,
      cursor: 'default', fontFamily: 'inherit', transition: 'background 0.08s',
    }}>
      {icon}{label}
    </button>
  );
}
