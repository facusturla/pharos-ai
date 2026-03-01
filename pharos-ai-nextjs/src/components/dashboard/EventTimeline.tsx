'use client';
import { useState } from 'react';
import { CheckCircle, MapPin, Clock, Inbox, Flag, Archive, FilePlus } from 'lucide-react';
import mockEventsRaw from '@/data/mockEvents.json';

interface Event {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  importance: number;
  topic: string;
  region: string;
  verified: boolean;
  type?: string;
}

const flattenEvents = (raw: any): Event[] => {
  const eventsMap: Record<string, any[]> = raw.events || raw;
  const flat: Event[] = [];
  Object.entries(eventsMap).forEach(([topic, evs]) => {
    if (Array.isArray(evs)) evs.forEach((e: any) => flat.push({ ...e, topic: e.topic || topic }));
  });
  return flat.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const SEV_COLOR: Record<number, string> = { 3: '#FF3B30', 2: '#FF9500', 1: '#8E8E93' };
const SEV_LABEL: Record<number, string> = { 3: 'Critical', 2: 'High', 1: 'Standard' };
const SEV_TAG: Record<number, { bg: string; text: string }> = {
  3: { bg: 'rgba(255,59,48,0.10)',   text: '#C0221A' },
  2: { bg: 'rgba(255,149,0,0.10)',   text: '#B36800' },
  1: { bg: 'rgba(142,142,147,0.12)', text: '#555558' },
};

const SEP   = 'rgba(0,0,0,0.09)';
const LABEL  = 'rgba(0,0,0,0.88)';
const LABEL2 = 'rgba(0,0,0,0.50)';
const LABEL3 = 'rgba(0,0,0,0.28)';
const SYS_BLUE = '#007AFF';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: '3',   label: 'Critical' },
  { key: '2',   label: 'High' },
  { key: '1',   label: 'Standard' },
];

interface Props { selectedTopic: string; }

export const EventTimeline = ({ selectedTopic }: Props) => {
  const [importanceFilter, setImportanceFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const allEvents = flattenEvents(mockEventsRaw);
  const filtered = allEvents.filter(e => {
    const topicOk = selectedTopic === 'all' || e.topic.toLowerCase().replace(/\s+/g, '-') === selectedTopic;
    const impOk   = importanceFilter === 'all' || String(e.importance) === importanceFilter;
    return topicOk && impOk;
  });

  const selected = filtered.find(e => e.id === selectedId) ?? null;

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

      {/* ── List pane ────────────────────────────────────────── */}
      <div style={{
        width: 310, minWidth: 310,
        borderRight: `0.5px solid ${SEP}`,
        background: '#F8F8F8',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* Filter pills */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '10px 16px',
          borderBottom: `0.5px solid ${SEP}`,
          flexShrink: 0,
        }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setImportanceFilter(f.key)}
              style={{
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 11.5,
                fontWeight: 500,
                border: 'none',
                cursor: 'default',
                fontFamily: 'inherit',
                transition: 'all 0.08s',
                background: importanceFilter === f.key ? SYS_BLUE : 'rgba(0,0,0,0.07)',
                color: importanceFilter === f.key ? 'white' : LABEL2,
              }}
            >
              {f.label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 11, color: LABEL3 }}>
            {filtered.length} events
          </span>
        </div>

        {/* Event rows */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
              <span style={{ fontSize: 12, color: LABEL3 }}>No events match filter</span>
            </div>
          )}
          {filtered.map(event => {
            const isOn = selectedId === event.id;
            const sevColor = SEV_COLOR[event.importance] || '#8E8E93';
            const t = new Date(event.timestamp);
            const timeStr = t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

            return (
              <button
                key={event.id}
                onClick={() => setSelectedId(isOn ? null : event.id)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '10px 14px 10px 16px',
                  borderBottom: `0.5px solid ${SEP}`,
                  background: isOn ? '#2F6EBA' : 'transparent',
                  border: 'none', cursor: 'default', fontFamily: 'inherit',
                  transition: 'background 0.08s',
                  display: 'block',
                }}
                onMouseEnter={e => { if (!isOn) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.03)'; }}
                onMouseLeave={e => { if (!isOn) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {/* Row top: dot + source + time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: isOn ? 'rgba(255,255,255,0.8)' : sevColor,
                  }} />
                  <span style={{
                    fontSize: 12, fontWeight: 600, flex: 1,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    color: isOn ? 'white' : LABEL,
                  }}>
                    {event.topic}
                  </span>
                  <span style={{ fontSize: 11, whiteSpace: 'nowrap', color: isOn ? 'rgba(255,255,255,0.60)' : LABEL3 }}>
                    {timeStr}
                  </span>
                </div>

                {/* Title */}
                <p style={{
                  fontSize: 12.5, fontWeight: isOn ? 500 : 400,
                  lineHeight: 1.4, marginBottom: 3,
                  color: isOn ? 'white' : LABEL,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {event.title}
                </p>

                {/* Preview */}
                <p style={{
                  fontSize: 11.5,
                  color: isOn ? 'rgba(255,255,255,0.70)' : LABEL2,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  <span style={{
                    display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                    marginRight: 4, verticalAlign: 'middle',
                    background: isOn ? 'rgba(255,255,255,0.60)' : sevColor,
                  }} />
                  {SEV_LABEL[event.importance]} · {event.description?.slice(0, 80)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Reading pane ─────────────────────────────────────── */}
      <div style={{ flex: 1, background: '#FFFFFF', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {!selected ? (
          /* Empty state */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Inbox size={44} style={{ color: LABEL3, opacity: 0.4 }} strokeWidth={1} />
            <p style={{ fontSize: 13, color: LABEL3 }}>Select an event to read the full brief</p>
          </div>
        ) : (
          <>
            {/* Reading toolbar */}
            <div style={{
              height: 44, flexShrink: 0,
              display: 'flex', alignItems: 'center',
              padding: '0 16px', gap: 8,
              borderBottom: `0.5px solid ${SEP}`,
              background: 'rgba(246,246,246,0.93)',
              backdropFilter: 'blur(12px)',
            }}>
              <span style={{
                flex: 1, fontSize: 13, fontWeight: 500,
                color: LABEL2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {selected.title}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <ActionBtn icon={<Flag size={12} strokeWidth={1.5} />} label="Flag" />
                <ActionBtn icon={<Archive size={12} strokeWidth={1.5} />} label="Archive" destructive />
                <ActionBtn icon={<FilePlus size={12} strokeWidth={1.5} />} label="Add to Report" primary />
              </div>
            </div>

            {/* Article body */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '28px 36px' }}>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                  <Chip style={{ background: SEV_TAG[selected.importance].bg, color: SEV_TAG[selected.importance].text }}>
                    {SEV_LABEL[selected.importance]}
                  </Chip>
                  {selected.verified && (
                    <Chip style={{ background: 'rgba(40,205,65,0.10)', color: '#1A8C2E' }}>
                      <CheckCircle size={10} strokeWidth={2} style={{ marginRight: 3 }} />
                      Verified
                    </Chip>
                  )}
                  <Chip style={{ background: 'rgba(142,142,147,0.10)', color: '#555558' }}>
                    {selected.topic}
                  </Chip>
                </div>

                {/* Title */}
                <h1 style={{
                  fontFamily: '-apple-system, "SF Pro Display", Inter, sans-serif',
                  fontSize: 22, fontWeight: 700,
                  color: LABEL, lineHeight: 1.3,
                  letterSpacing: '-0.025em',
                  marginBottom: 10,
                }}>
                  {selected.title}
                </h1>

                {/* Meta row */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                  marginBottom: 20, paddingBottom: 16,
                  borderBottom: `0.5px solid ${SEP}`,
                }}>
                  <MetaChip icon={<Clock size={12} strokeWidth={1.5} />}>
                    {new Date(selected.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </MetaChip>
                  <MetaChip icon={<MapPin size={12} strokeWidth={1.5} />}>
                    {selected.region}
                  </MetaChip>
                </div>

                {/* Confidence gauge */}
                <SectionTitle>Assessment Confidence</SectionTitle>
                <ConfidenceCard event={selected} />

                {/* Summary */}
                <SectionTitle style={{ marginTop: 24 }}>Situation Summary</SectionTitle>
                <div style={{
                  background: 'rgba(0,122,255,0.05)',
                  border: '0.5px solid rgba(0,122,255,0.18)',
                  borderRadius: 14,
                  padding: '14px 16px',
                  marginBottom: 24,
                }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: SYS_BLUE, marginBottom: 6,
                  }}>
                    Intelligence Brief
                  </div>
                  <p style={{ fontSize: 13.5, color: LABEL, lineHeight: 1.65 }}>
                    {selected.description}
                  </p>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ── Sub-components ─────────────────────────────────────────────── */

function SectionTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.06em',
      color: 'rgba(0,0,0,0.30)', marginBottom: 10,
      ...style,
    }}>
      {children}
    </div>
  );
}

function Chip({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11.5, fontWeight: 500,
      ...style,
    }}>
      {children}
    </span>
  );
}

function MetaChip({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(0,0,0,0.50)' }}>
      {icon}
      {children}
    </div>
  );
}

function ActionBtn({ icon, label, primary, destructive }: {
  icon: React.ReactNode; label: string; primary?: boolean; destructive?: boolean;
}) {
  const bg = primary ? '#007AFF' : destructive ? 'rgba(255,59,48,0.09)' : 'rgba(0,0,0,0.06)';
  const color = primary ? 'white' : destructive ? '#FF3B30' : 'rgba(0,0,0,0.88)';
  const border = primary ? 'rgba(0,0,100,0.2)' : destructive ? 'rgba(255,59,48,0.2)' : 'rgba(0,0,0,0.10)';

  return (
    <button style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 6,
      background: bg, border: `0.5px solid ${border}`,
      fontSize: 12, fontWeight: 500, color,
      cursor: 'default', fontFamily: 'inherit',
      transition: 'background 0.08s',
    }}>
      {icon}
      {label}
    </button>
  );
}

function ConfidenceCard({ event }: { event: Event }) {
  const sevColor = SEV_COLOR[event.importance] || '#8E8E93';
  const pct = Math.round((event.importance / 3) * 100);
  const r = 24;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const label = event.importance === 3 ? 'High Priority' : event.importance === 2 ? 'Medium Priority' : 'Standard';

  return (
    <div style={{
      background: '#F8F8F8',
      border: '0.5px solid rgba(0,0,0,0.09)',
      borderRadius: 14,
      padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 20,
      marginBottom: 0,
    }}>
      {/* Ring */}
      <div style={{ position: 'relative', width: 60, height: 60, flexShrink: 0 }}>
        <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)' }}>
          <circle fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="5" cx="30" cy="30" r={r} />
          <circle
            fill="none" stroke={sevColor} strokeWidth="5" strokeLinecap="round"
            cx="30" cy="30" r={r}
            strokeDasharray={circ.toFixed(2)}
            strokeDashoffset={offset.toFixed(2)}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: sevColor,
        }}>
          {pct}%
        </div>
      </div>
      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: sevColor, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: 'rgba(0,0,0,0.50)', lineHeight: 1.5 }}>
          {event.verified ? 'Source verified.' : 'Unverified.'} Importance level {event.importance}/3.
        </div>
      </div>
    </div>
  );
}
