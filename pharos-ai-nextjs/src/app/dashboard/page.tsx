'use client';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, ArrowRight, CheckCircle } from 'lucide-react';
import { CONFLICTS, STATUS_STYLE, type ConflictStatus } from '@/data/mockConflicts';
import { EVENTS } from '@/data/mockEvents';

const TEXT  = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const SEP   = '#e2e8f0';
const RED   = '#dd4545';

function EscalationBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
      <span className="news-headline" style={{ fontSize: 14, color, minWidth: 36, textAlign: 'right' }}>
        {score}%
      </span>
    </div>
  );
}

function TrendIcon({ trend }: { trend: 'UP' | 'DOWN' | 'STABLE' }) {
  if (trend === 'UP')     return <TrendingUp size={13} style={{ color: '#dc2626' }} strokeWidth={2} />;
  if (trend === 'DOWN')   return <TrendingDown size={13} style={{ color: '#16a34a' }} strokeWidth={2} />;
  return <Minus size={13} style={{ color: '#94a3b8' }} strokeWidth={2} />;
}

export default function SituationRoom() {
  const latestCritical = EVENTS
    .filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  const totalCritical = CONFLICTS.reduce((s, c) => s + c.criticalToday, 0);
  const activeConflicts = CONFLICTS.filter(c => c.status !== 'MONITORING').length;

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
      <div style={{ padding: '28px 36px', maxWidth: 1400 }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div className="news-meta" style={{ fontSize: 10, color: TEXT3, marginBottom: 4 }}>
              Global Intelligence Overview
            </div>
            <h1 className="news-headline" style={{ fontSize: 24, color: TEXT }}>
              SITUATION ROOM
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <Stat label="ACTIVE CONFLICTS" value={String(activeConflicts)} color="#dc2626" />
            <Stat label="CRITICAL TODAY" value={String(totalCritical)} color="#dc2626" />
            <Stat label="MONITORED TOPICS" value={String(CONFLICTS.length)} color="#64748b" />
          </div>
        </div>

        {/* Conflict cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16, marginBottom: 36 }}>
          {CONFLICTS.map(conflict => {
            const ss = STATUS_STYLE[conflict.status];
            return (
              <div key={conflict.id} style={{
                background: 'white',
                border: `1px solid ${SEP}`,
                borderTop: `4px solid ${conflict.accentColor}`,
                padding: '20px 22px',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span className="news-headline" style={{ fontSize: 14, color: TEXT }}>
                        {conflict.shortName}
                      </span>
                      <TrendIcon trend={conflict.trend} />
                    </div>
                    <div style={{ fontSize: 11, color: TEXT3, fontFamily: 'Arial, sans-serif' }}>
                      {conflict.region}
                    </div>
                  </div>
                  <span className="news-meta" style={{
                    fontSize: 10, padding: '3px 8px', borderRadius: 2,
                    background: ss.bg, color: ss.color,
                    border: `1px solid ${ss.color}22`,
                  }}>
                    {ss.label}
                  </span>
                </div>

                {/* Escalation bar */}
                <div style={{ marginBottom: 14 }}>
                  <div className="news-meta" style={{ fontSize: 9, color: TEXT3, marginBottom: 5 }}>
                    Escalation Index
                  </div>
                  <EscalationBar score={conflict.escalationScore} color={conflict.accentColor} />
                </div>

                {/* Counts */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${SEP}` }}>
                  <Count label="CRITICAL" val={conflict.criticalToday} color="#dc2626" />
                  <Count label="HIGH" val={conflict.highToday} color="#ea580c" />
                  <Count label="STANDARD" val={conflict.standardToday} color="#64748b" />
                </div>

                {/* Key developments */}
                <div style={{ marginBottom: 16 }}>
                  <div className="news-meta" style={{ fontSize: 9, color: TEXT3, marginBottom: 8 }}>
                    Latest Developments
                  </div>
                  {conflict.keyDevelopments.map((d, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, alignItems: 'flex-start' }}>
                      <div style={{ width: 6, height: 6, borderRadius: 1, background: conflict.accentColor, flexShrink: 0, marginTop: 4 }} />
                      <span className="news-body" style={{ fontSize: 12, color: TEXT2, lineHeight: 1.4 }}>{d}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link href={`/dashboard/feed?conflict=${conflict.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', background: '#f8fafc', border: `1px solid ${SEP}`,
                    cursor: 'pointer', transition: 'background 0.1s',
                  }}>
                    <span className="news-meta" style={{ fontSize: 10, color: conflict.accentColor }}>
                      View Intel Feed
                    </span>
                    <ArrowRight size={12} strokeWidth={2} style={{ color: conflict.accentColor }} />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Latest critical events */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div className="news-meta" style={{ fontSize: 10, color: TEXT3, marginBottom: 3 }}>
                All Conflicts
              </div>
              <div className="news-headline" style={{ fontSize: 16, color: TEXT }}>
                LATEST CRITICAL EVENTS
              </div>
            </div>
            <Link href="/dashboard/feed" style={{ textDecoration: 'none' }}>
              <span className="news-meta" style={{ fontSize: 10, color: RED, display: 'flex', alignItems: 'center', gap: 4 }}>
                VIEW ALL EVENTS <ArrowRight size={11} strokeWidth={2} />
              </span>
            </Link>
          </div>

          <div style={{ background: 'white', border: `1px solid ${SEP}`, borderTop: `3px solid ${RED}` }}>
            {latestCritical.map((evt, i) => {
              const isLast = i === latestCritical.length - 1;
              const sevColor = evt.severity === 'CRITICAL' ? '#dc2626' : '#ea580c';
              const ageMs = Date.now() - new Date(evt.timestamp).getTime();
              const age = ageMs < 3600000 ? `${Math.round(ageMs / 60000)}m ago` : `${Math.round(ageMs / 3600000)}h ago`;

              return (
                <Link key={evt.id} href={`/dashboard/feed?event=${evt.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '12px 20px',
                    borderBottom: isLast ? 'none' : `1px solid ${SEP}`,
                    cursor: 'pointer', transition: 'background 0.08s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, minWidth: 180 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 1, background: sevColor, flexShrink: 0 }} />
                      <span className="news-meta" style={{ fontSize: 10, color: sevColor }}>{evt.severity}</span>
                      {evt.verified && <CheckCircle size={11} style={{ color: '#16a34a' }} strokeWidth={2} />}
                    </div>
                    <span className="news-body" style={{ fontSize: 13, color: TEXT, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {evt.title}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      <span className="news-meta" style={{ fontSize: 9, color: TEXT3 }}>
                        {evt.sources.length} SRC
                      </span>
                      <span style={{ fontSize: 11, color: TEXT3, fontFamily: 'Arial, sans-serif', minWidth: 50, textAlign: 'right' }}>
                        {age}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div className="news-headline" style={{ fontSize: 28, color, lineHeight: 1 }}>{value}</div>
      <div className="news-meta" style={{ fontSize: 9, color: TEXT3, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Count({ label, val, color }: { label: string; val: number; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="news-headline" style={{ fontSize: 20, color, lineHeight: 1 }}>{val}</div>
      <div className="news-meta" style={{ fontSize: 9, color: TEXT3, marginTop: 2 }}>{label}</div>
    </div>
  );
}
