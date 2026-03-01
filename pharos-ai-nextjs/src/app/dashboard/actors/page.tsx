'use client';
import { useState } from 'react';
import { CheckCircle, Users } from 'lucide-react';
import { CONFLICTS } from '@/data/mockConflicts';
import { ACTORS, ACTIVITY_STYLE, STANCE_STYLE, type Actor } from '@/data/mockActors';

const TEXT  = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const SEP   = '#e2e8f0';
const RED   = '#dd4545';

const ACTION_COLOR: Record<string, string> = {
  MILITARY:     '#dc2626',
  DIPLOMATIC:   '#2563eb',
  POLITICAL:    '#7c3aed',
  ECONOMIC:     '#d97706',
  CYBER:        '#16a34a',
  INTELLIGENCE: '#64748b',
};

export default function ActorsPage() {
  const [conflictFilter, setConflictFilter] = useState<string>('all');
  const [selectedId, setSelectedId]         = useState<string | null>(null);

  const filtered = ACTORS.filter(a =>
    conflictFilter === 'all' || a.conflictIds.includes(conflictFilter)
  );

  const selected = ACTORS.find(a => a.id === selectedId) ?? null;

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0, overflow: 'hidden' }}>

      {/* ── Conflict filter ─────────────────────────── */}
      <div style={{
        width: 180, minWidth: 180, flexShrink: 0,
        background: '#f1f5f9', borderRight: `1px solid ${SEP}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 16px 10px', borderBottom: `2px solid ${RED}`, background: '#f8fafc' }}>
          <div className="news-meta" style={{ fontSize: 10, color: TEXT3, marginBottom: 2 }}>Filter by</div>
          <div className="news-headline" style={{ fontSize: 14, color: TEXT }}>CONFLICT</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {['all', ...CONFLICTS.map(c => c.id)].map(id => {
            const conflict = CONFLICTS.find(c => c.id === id);
            const isActive = conflictFilter === id;
            return (
              <button
                key={id}
                onClick={() => { setConflictFilter(id); setSelectedId(null); }}
                style={{
                  width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 16px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: isActive ? '#0f172a' : 'transparent', transition: 'background 0.08s',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)'; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {conflict && <div style={{ width: 7, height: 7, borderRadius: 1, background: isActive ? 'white' : conflict.accentColor, flexShrink: 0 }} />}
                <span className="news-meta" style={{ fontSize: 10, color: isActive ? 'white' : TEXT, letterSpacing: '0.03em' }}>
                  {conflict ? conflict.shortName : 'ALL ACTORS'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Actor list ──────────────────────────────── */}
      <div style={{
        width: 280, minWidth: 280, flexShrink: 0,
        borderRight: `1px solid ${SEP}`,
        background: 'white',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '12px 16px', borderBottom: `2px solid ${RED}`, background: '#f8fafc', flexShrink: 0 }}>
          <div className="news-headline" style={{ fontSize: 16, color: TEXT }}>ACTORS</div>
          <div style={{ fontSize: 11, color: TEXT3, fontFamily: 'Arial, sans-serif', marginTop: 2 }}>
            {filtered.length} tracked
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map(actor => {
            const isOn = selectedId === actor.id;
            const as = ACTIVITY_STYLE[actor.activityLevel];
            return (
              <button
                key={actor.id}
                onClick={() => setSelectedId(isOn ? null : actor.id)}
                style={{
                  width: '100%', textAlign: 'left', display: 'block',
                  padding: '12px 16px',
                  borderLeft: `4px solid ${isOn ? as.color : 'transparent'}`,
                  borderTop: 'none', borderRight: 'none',
                  borderBottom: `1px solid ${SEP}`,
                  background: isOn ? as.bg : 'white',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.08s',
                }}
                onMouseEnter={e => { if (!isOn) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (!isOn) (e.currentTarget as HTMLElement).style.background = 'white'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {actor.flag && <span style={{ fontSize: 16 }}>{actor.flag}</span>}
                    <span className="news-headline" style={{ fontSize: 13, color: TEXT }}>{actor.name}</span>
                  </div>
                  <span className="news-meta" style={{
                    fontSize: 9, padding: '2px 6px', borderRadius: 2,
                    background: as.bg, color: as.color, border: `1px solid ${as.color}33`,
                  }}>
                    {actor.activityLevel}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: TEXT3, fontFamily: 'Arial, sans-serif', marginBottom: 5 }}>
                  {actor.fullName}
                </div>
                {/* Activity bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${actor.activityScore}%`, height: '100%', background: as.color }} />
                  </div>
                  <span style={{ fontSize: 10, color: TEXT3, fontFamily: 'Arial, sans-serif', minWidth: 24 }}>
                    {actor.activityScore}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Actor detail ────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Users size={44} style={{ color: '#e2e8f0' }} strokeWidth={1} />
            <p className="news-meta" style={{ fontSize: 11, color: TEXT3 }}>Select an actor to view intelligence</p>
          </div>
        ) : (
          <ActorDetail actor={selected} />
        )}
      </div>
    </div>
  );
}

function ActorDetail({ actor }: { actor: Actor }) {
  const as = ACTIVITY_STYLE[actor.activityLevel];
  const ss = STANCE_STYLE[actor.stance];

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {/* Header band */}
      <div style={{ borderLeft: `6px solid ${as.color}`, borderBottom: `2px solid ${SEP}`, padding: '20px 28px', background: as.bg }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {actor.flag && <span style={{ fontSize: 32 }}>{actor.flag}</span>}
            <div>
              <h1 className="news-headline" style={{ fontSize: 24, color: TEXT, lineHeight: 1.1, marginBottom: 4 }}>
                {actor.name}
              </h1>
              <div style={{ fontSize: 12, color: TEXT2, fontFamily: 'Arial, sans-serif' }}>{actor.fullName}</div>
              <span className="news-meta" style={{ fontSize: 9, color: TEXT3 }}>{actor.type}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Badge label={actor.activityLevel} color={as.color} bg={as.bg} />
            <Badge label={actor.stance} color={ss.color} bg={ss.bg} />
          </div>
        </div>
        {/* Activity bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="news-meta" style={{ fontSize: 9, color: TEXT3, minWidth: 80 }}>ACTIVITY LEVEL</div>
          <div style={{ flex: 1, height: 8, background: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${actor.activityScore}%`, height: '100%', background: as.color }} />
          </div>
          <span className="news-headline" style={{ fontSize: 14, color: as.color, minWidth: 36 }}>{actor.activityScore}%</span>
        </div>
      </div>

      <div style={{ padding: '24px 28px' }}>
        {/* SAYING */}
        <Section label="SAYING — Public Position">
          <div style={{ borderLeft: `4px solid ${ss.color}`, paddingLeft: 16 }}>
            <p className="news-body" style={{ fontSize: 14, color: TEXT, lineHeight: 1.7, fontStyle: 'italic' }}>
              {actor.saying}
            </p>
          </div>
        </Section>

        {/* DOING */}
        <Section label="DOING — Observed Actions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {actor.doing.map((action, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', background: '#f8fafc', border: `1px solid ${SEP}` }}>
                <div style={{ width: 8, height: 8, borderRadius: 1, background: as.color, flexShrink: 0, marginTop: 4 }} />
                <span className="news-body" style={{ fontSize: 13, color: TEXT, lineHeight: 1.5 }}>{action}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Assessment */}
        <Section label="PHAROS ASSESSMENT">
          <div style={{ borderLeft: `4px solid ${RED}`, paddingLeft: 16 }}>
            <p className="news-body" style={{ fontSize: 14, color: '#1e293b', lineHeight: 1.7 }}>
              {actor.assessment}
            </p>
          </div>
        </Section>

        {/* Recent Actions */}
        <Section label={`RECENT ACTIONS (${actor.recentActions.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {actor.recentActions.map((action, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '10px 14px', background: '#f8fafc', border: `1px solid ${SEP}`,
                borderLeft: `3px solid ${ACTION_COLOR[action.type] || '#64748b'}`,
              }}>
                <div style={{ flexShrink: 0, minWidth: 70 }}>
                  <div style={{ fontSize: 11, color: TEXT3, fontFamily: 'Arial, sans-serif' }}>{action.date}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span className="news-meta" style={{ fontSize: 9, padding: '2px 5px', borderRadius: 2, background: ACTION_COLOR[action.type] || '#64748b', color: 'white' }}>
                      {action.type}
                    </span>
                    <span className="news-meta" style={{ fontSize: 9, color: action.significance === 'HIGH' ? '#dc2626' : action.significance === 'MEDIUM' ? '#d97706' : TEXT3 }}>
                      {action.significance} SIGNIFICANCE
                    </span>
                    {action.verified && <CheckCircle size={10} style={{ color: '#16a34a' }} strokeWidth={2} />}
                  </div>
                  <p style={{ fontSize: 13, color: TEXT, fontFamily: 'Georgia, serif', lineHeight: 1.45 }}>{action.description}</p>
                  <div style={{ fontSize: 11, color: TEXT3, fontFamily: 'Arial, sans-serif', marginTop: 2 }}>
                    {action.sourceCount} source{action.sourceCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Conflicts involved */}
        <Section label="MONITORED CONFLICTS">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {actor.conflictIds.map(cid => {
              const c = CONFLICTS.find(x => x.id === cid);
              if (!c) return null;
              return (
                <span key={cid} className="news-meta" style={{
                  fontSize: 10, padding: '4px 10px', borderRadius: 2,
                  background: c.accentColor, color: 'white',
                }}>
                  {c.shortName}
                </span>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="news-meta" style={{ fontSize: 10, color: TEXT3, marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="news-meta" style={{
      fontSize: 10, padding: '3px 8px', borderRadius: 2,
      border: `1px solid ${color}44`, color, background: bg,
    }}>
      {label}
    </span>
  );
}
