'use client';
import { useState, useMemo } from 'react';
import { CheckCircle, MapPin, Clock, Shield, Users, Radio } from 'lucide-react';
import { CONFLICTS } from '@/data/mockConflicts';
import { EVENTS, SEV_STYLE, type Severity, type IntelEvent } from '@/data/mockEvents';

const TEXT  = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const SEP   = '#e2e8f0';
const RED   = '#dd4545';

const TIER_LABEL: Record<number, string> = { 1: 'TIER 1', 2: 'TIER 2', 3: 'TIER 3' };
const TIER_COLOR: Record<number, string> = { 1: '#16a34a', 2: '#d97706', 3: '#94a3b8' };
const STANCE_COLOR: Record<string, string> = {
  SUPPORTING: '#16a34a',
  OPPOSING:   '#dc2626',
  NEUTRAL:    '#64748b',
  UNKNOWN:    '#94a3b8',
};

function timeAgo(ts: string) {
  const ms = Date.now() - new Date(ts).getTime();
  if (ms < 3600000) return `${Math.round(ms / 60000)}m ago`;
  if (ms < 86400000) return `${Math.round(ms / 3600000)}h ago`;
  return `${Math.round(ms / 86400000)}d ago`;
}

function groupByDate(events: IntelEvent[]) {
  const groups: Record<string, IntelEvent[]> = {};
  events.forEach(e => {
    const d = new Date(e.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (!groups[d]) groups[d] = [];
    groups[d].push(e);
  });
  return groups;
}

export default function IntelFeedPage() {
  const [conflictFilter, setConflictFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<Record<Severity, boolean>>({ CRITICAL: true, HIGH: true, STANDARD: true });
  const [tierFilter, setTierFilter] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true });
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return EVENTS.filter(e => {
      if (conflictFilter !== 'all' && e.conflictId !== conflictFilter) return false;
      if (!severityFilter[e.severity]) return false;
      if (verifiedOnly && !e.verified) return false;
      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [conflictFilter, severityFilter, tierFilter, verifiedOnly]);

  const grouped = groupByDate(filtered);
  const selected = EVENTS.find(e => e.id === selectedId) ?? null;

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0, overflow: 'hidden' }}>

      {/* ── Filter sidebar ─────────────────────────────── */}
      <div style={{
        width: 200, minWidth: 200, flexShrink: 0,
        background: '#f1f5f9', borderRight: `1px solid ${SEP}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '14px 16px 10px', borderBottom: `2px solid ${RED}`, background: '#f8fafc' }}>
          <div className="news-meta" style={{ fontSize: 10, color: TEXT3, marginBottom: 2 }}>Filters</div>
          <div className="news-headline" style={{ fontSize: 14, color: TEXT }}>INTEL FEED</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {/* Conflict */}
          <FilterSection label="CONFLICT">
            <FilterRow active={conflictFilter === 'all'} onClick={() => setConflictFilter('all')} label="All Conflicts" />
            {CONFLICTS.map(c => (
              <FilterRow key={c.id} active={conflictFilter === c.id} onClick={() => setConflictFilter(c.id)} label={c.shortName} dot={c.accentColor} />
            ))}
          </FilterSection>

          <FilterDivider />

          {/* Severity */}
          <FilterSection label="SEVERITY">
            {(['CRITICAL', 'HIGH', 'STANDARD'] as Severity[]).map(sev => (
              <CheckRow
                key={sev}
                label={sev}
                color={SEV_STYLE[sev].color}
                checked={severityFilter[sev]}
                onChange={v => setSeverityFilter(prev => ({ ...prev, [sev]: v }))}
              />
            ))}
          </FilterSection>

          <FilterDivider />

          {/* Verified */}
          <FilterSection label="VERIFICATION">
            <CheckRow
              label="VERIFIED ONLY"
              color="#16a34a"
              checked={verifiedOnly}
              onChange={setVerifiedOnly}
            />
          </FilterSection>

          <FilterDivider />

          {/* Source tier */}
          <FilterSection label="SOURCE TIER">
            {[1, 2, 3].map(t => (
              <CheckRow
                key={t}
                label={TIER_LABEL[t]}
                color={TIER_COLOR[t]}
                checked={tierFilter[t]}
                onChange={v => setTierFilter(prev => ({ ...prev, [t]: v }))}
              />
            ))}
          </FilterSection>
        </div>

        {/* Result count */}
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${SEP}`, background: '#f8fafc' }}>
          <span className="news-meta" style={{ fontSize: 10, color: TEXT3 }}>{filtered.length} EVENTS</span>
        </div>
      </div>

      {/* ── Event list ─────────────────────────────────── */}
      <div style={{
        width: 340, minWidth: 340, flexShrink: 0,
        borderRight: `1px solid ${SEP}`,
        background: 'white',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '12px 16px', borderBottom: `2px solid ${RED}`, background: '#f8fafc', flexShrink: 0 }}>
          <div className="news-headline" style={{ fontSize: 16, color: TEXT }}>
            {conflictFilter === 'all' ? 'ALL CONFLICTS' : CONFLICTS.find(c => c.id === conflictFilter)?.shortName ?? ''}
          </div>
          <div style={{ fontSize: 11, color: TEXT3, fontFamily: 'Arial, sans-serif', marginTop: 2 }}>
            {filtered.length} events
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '48px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: TEXT3, fontFamily: 'Arial, sans-serif' }}>No events match filters</p>
            </div>
          )}

          {Object.entries(grouped).map(([date, events]) => (
            <div key={date}>
              <div style={{
                padding: '6px 16px', background: '#f8fafc',
                borderBottom: `1px solid ${SEP}`,
              }}>
                <span className="news-meta" style={{ fontSize: 9, color: TEXT3 }}>{date.toUpperCase()}</span>
              </div>
              {events.map(evt => {
                const isOn  = selectedId === evt.id;
                const ss    = SEV_STYLE[evt.severity];
                const conflict = CONFLICTS.find(c => c.id === evt.conflictId);

                return (
                  <button
                    key={evt.id}
                    onClick={() => setSelectedId(isOn ? null : evt.id)}
                    style={{
                      width: '100%', textAlign: 'left', display: 'block',
                      padding: '11px 16px',
                      borderLeft: `4px solid ${isOn ? ss.color : 'transparent'}`,
                      borderTop: 'none', borderRight: 'none',
                      borderBottom: `1px solid ${SEP}`,
                      background: isOn ? ss.bg : 'white',
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.08s',
                    }}
                    onMouseEnter={e => { if (!isOn) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                    onMouseLeave={e => { if (!isOn) (e.currentTarget as HTMLElement).style.background = 'white'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <span className="news-meta" style={{ fontSize: 9, padding: '2px 5px', borderRadius: 2, background: ss.color, color: 'white' }}>
                        {evt.severity}
                      </span>
                      <span className="news-meta" style={{ fontSize: 9, padding: '2px 5px', borderRadius: 2, background: '#e2e8f0', color: TEXT3 }}>
                        {evt.type}
                      </span>
                      {evt.verified && <CheckCircle size={11} style={{ color: '#16a34a', flexShrink: 0 }} strokeWidth={2} />}
                      <span style={{ marginLeft: 'auto', fontSize: 10, color: TEXT3, fontFamily: 'Arial, sans-serif', flexShrink: 0 }}>
                        {timeAgo(evt.timestamp)}
                      </span>
                    </div>
                    <p className="news-headline" style={{
                      fontSize: 12.5, color: TEXT, lineHeight: 1.35, marginBottom: 4,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {evt.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: TEXT3, fontFamily: 'Arial, sans-serif' }}>
                        {evt.sources.length} source{evt.sources.length !== 1 ? 's' : ''}
                      </span>
                      {conflict && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: TEXT3, fontFamily: 'Arial, sans-serif' }}>
                          <div style={{ width: 6, height: 6, borderRadius: 1, background: conflict.accentColor }} />
                          {conflict.shortName}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Event detail ───────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Shield size={44} style={{ color: '#e2e8f0' }} strokeWidth={1} />
            <p className="news-meta" style={{ fontSize: 11, color: TEXT3 }}>Select an event to read</p>
          </div>
        ) : (
          <EventDetail event={selected} />
        )}
      </div>
    </div>
  );
}

function EventDetail({ event }: { event: IntelEvent }) {
  const ss = SEV_STYLE[event.severity];
  const conflict = CONFLICTS.find(c => c.id === event.conflictId);

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {/* Color band header */}
      <div style={{ borderLeft: `6px solid ${ss.color}`, borderBottom: `2px solid ${SEP}`, padding: '20px 28px', background: ss.bg }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <span className="news-meta" style={{ fontSize: 10, padding: '3px 8px', borderRadius: 2, background: ss.color, color: 'white' }}>{event.severity}</span>
          <span className="news-meta" style={{ fontSize: 10, padding: '3px 8px', borderRadius: 2, background: '#1e293b', color: 'white' }}>{event.type}</span>
          {event.verified && (
            <span className="news-meta" style={{ fontSize: 10, padding: '3px 8px', borderRadius: 2, background: '#15803d', color: 'white', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={9} strokeWidth={2} /> VERIFIED
            </span>
          )}
          {conflict && (
            <span className="news-meta" style={{ fontSize: 10, padding: '3px 8px', borderRadius: 2, background: conflict.accentColor, color: 'white' }}>
              {conflict.shortName}
            </span>
          )}
        </div>

        <h1 className="news-headline" style={{ fontSize: 22, color: TEXT, lineHeight: 1.2, marginBottom: 12 }}>
          {event.title}
        </h1>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: TEXT2, fontFamily: 'Arial, sans-serif' }}>
            <Clock size={12} strokeWidth={1.5} />
            {new Date(event.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: TEXT2, fontFamily: 'Arial, sans-serif' }}>
            <MapPin size={12} strokeWidth={1.5} />
            {event.location}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: TEXT2, fontFamily: 'Arial, sans-serif' }}>
            <Radio size={12} strokeWidth={1.5} />
            {event.sources.length} sources
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 28px' }}>
        {/* Summary */}
        <div className="news-meta" style={{ fontSize: 10, color: TEXT3, marginBottom: 8 }}>Summary</div>
        <div style={{ borderLeft: `4px solid ${ss.color}`, paddingLeft: 16, marginBottom: 24 }}>
          <p className="news-body" style={{ fontSize: 14, color: '#1e293b', lineHeight: 1.7 }}>{event.summary}</p>
        </div>

        {/* Full content */}
        <div className="news-meta" style={{ fontSize: 10, color: TEXT3, marginBottom: 8 }}>Full Intelligence Report</div>
        <div className="news-body" style={{ fontSize: 14, color: TEXT, lineHeight: 1.75, marginBottom: 28 }}>
          {event.fullContent.split('\n\n').map((p, i) => <p key={i} style={{ marginBottom: 14 }}>{p}</p>)}
        </div>

        {/* Sources */}
        <div className="news-meta" style={{ fontSize: 10, color: TEXT3, marginBottom: 10 }}>Sources ({event.sources.length})</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
          {event.sources.map((src, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#f8fafc', border: `1px solid ${SEP}` }}>
              <span className="news-meta" style={{ fontSize: 9, padding: '2px 6px', borderRadius: 2, background: TIER_COLOR[src.tier], color: 'white' }}>
                {TIER_LABEL[src.tier]}
              </span>
              <span className="news-headline" style={{ fontSize: 12, color: TEXT, flex: 1 }}>{src.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 60, height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${src.reliability}%`, height: '100%', background: src.reliability > 90 ? '#16a34a' : src.reliability > 75 ? '#d97706' : '#dc2626' }} />
                </div>
                <span style={{ fontSize: 11, color: TEXT3, fontFamily: 'Arial, sans-serif', minWidth: 28 }}>{src.reliability}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Actor responses */}
        {event.actorResponses.length > 0 && (
          <>
            <div className="news-meta" style={{ fontSize: 10, color: TEXT3, marginBottom: 10 }}>Actor Responses</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {event.actorResponses.map((r, i) => (
                <div key={i} style={{ padding: '12px 16px', background: '#f8fafc', border: `1px solid ${SEP}`, borderLeft: `3px solid ${STANCE_COLOR[r.stance]}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span className="news-headline" style={{ fontSize: 12, color: TEXT }}>{r.actorName}</span>
                    <span className="news-meta" style={{ fontSize: 9, padding: '2px 6px', borderRadius: 2, background: STANCE_COLOR[r.stance] + '20', color: STANCE_COLOR[r.stance] }}>
                      {r.stance}
                    </span>
                    <span className="news-meta" style={{ fontSize: 9, color: TEXT3, marginLeft: 'auto' }}>{r.type}</span>
                  </div>
                  <p className="news-body" style={{ fontSize: 13, color: TEXT2, lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{r.statement}"
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Small UI pieces ─── */
function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '4px 0 8px' }}>
      <div className="news-meta" style={{ fontSize: 9, color: TEXT3, padding: '0 14px', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

function FilterDivider() {
  return <div style={{ height: 1, background: SEP, margin: '4px 14px 8px' }} />;
}

function FilterRow({ active, onClick, label, dot }: { active: boolean; onClick: () => void; label: string; dot?: string }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
      padding: '5px 14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      background: active ? '#0f172a' : 'transparent', transition: 'background 0.08s',
    }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      {dot && <div style={{ width: 7, height: 7, borderRadius: 1, background: dot, flexShrink: 0 }} />}
      <span className="news-meta" style={{ fontSize: 10, color: active ? 'white' : TEXT, letterSpacing: '0.03em' }}>{label}</span>
    </button>
  );
}

function CheckRow({ label, color, checked, onChange }: { label: string; color: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
      padding: '5px 14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'transparent',
    }}>
      <div style={{
        width: 12, height: 12, borderRadius: 2, flexShrink: 0,
        background: checked ? color : 'transparent',
        border: `1.5px solid ${checked ? color : '#cbd5e1'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && <div style={{ width: 6, height: 6, background: 'white', borderRadius: 1 }} />}
      </div>
      <span className="news-meta" style={{ fontSize: 10, color: checked ? TEXT : TEXT3, letterSpacing: '0.03em' }}>{label}</span>
    </button>
  );
}
