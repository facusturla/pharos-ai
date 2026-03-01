'use client';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchOutlooks } from '@/store/slices/outlookSlice';
import { useRouter } from 'next/navigation';
import { Clock, Globe, BookOpen, ArrowRight, FileText } from 'lucide-react';
import { CONFLICTS } from '@/data/mockConflicts';

const TEXT  = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const SEP   = '#e2e8f0';
const RED   = '#dd4545';

function topicToConflict(topic: string) {
  const t = topic.toLowerCase();
  return CONFLICTS.find(c =>
    c.name.toLowerCase().includes(t) ||
    t.includes(c.id.split('-')[0]) ||
    c.id.toLowerCase().includes(t)
  );
}

export default function BriefsPage() {
  const dispatch   = useAppDispatch();
  const router     = useRouter();
  const { outlooks, loading, pagination } = useAppSelector(s => s.outlook);
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [selectedId, setSelectedId]   = useState<string | null>(null);

  useEffect(() => { dispatch(fetchOutlooks({ limit: 30, offset: 0 })); }, [dispatch]);

  const filtered = topicFilter === 'all'
    ? outlooks
    : outlooks.filter(o => o.topic.toLowerCase().includes(topicFilter.toLowerCase()) || o.topic.toLowerCase() === topicFilter);

  const selected = outlooks.find(o => o.id === selectedId) ?? null;

  const topics = Array.from(new Set(outlooks.map(o => o.topic)));

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0, overflow: 'hidden' }}>

      {/* ── Topic sidebar ─────────────────────────── */}
      <div style={{
        width: 200, minWidth: 200, flexShrink: 0,
        background: '#f1f5f9', borderRight: `1px solid ${SEP}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 16px 10px', borderBottom: `2px solid ${RED}`, background: '#f8fafc' }}>
          <div className="news-meta" style={{ fontSize: 10, color: TEXT3, marginBottom: 2 }}>Filter</div>
          <div className="news-headline" style={{ fontSize: 14, color: TEXT }}>DAILY BRIEFS</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {['all', ...topics].map(t => {
            const isActive = topicFilter === t;
            const conflict = t !== 'all' ? topicToConflict(t) : null;
            return (
              <button
                key={t}
                onClick={() => { setTopicFilter(t); setSelectedId(null); }}
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
                  {t === 'all' ? 'ALL TOPICS' : t.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Briefs list ───────────────────────────── */}
      <div style={{
        width: 340, minWidth: 340, flexShrink: 0,
        borderRight: `1px solid ${SEP}`,
        background: 'white',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '12px 16px', borderBottom: `2px solid ${RED}`, background: '#f8fafc', flexShrink: 0 }}>
          <div className="news-headline" style={{ fontSize: 16, color: TEXT }}>INTELLIGENCE BRIEFS</div>
          <div style={{ fontSize: 11, color: TEXT3, fontFamily: 'Arial, sans-serif', marginTop: 2 }}>
            {filtered.length} brief{filtered.length !== 1 ? 's' : ''}
            {pagination?.total && filtered.length !== pagination.total ? ` of ${pagination.total}` : ''}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading.list && outlooks.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', fontSize: 12, color: TEXT3, fontFamily: 'Arial, sans-serif' }}>Loading briefs…</div>
          )}
          {filtered.map(o => {
            const isOn = selectedId === o.id;
            const conflict = topicToConflict(o.topic);
            const accentColor = conflict?.accentColor ?? RED;

            return (
              <button
                key={o.id}
                onClick={() => setSelectedId(isOn ? null : o.id)}
                style={{
                  width: '100%', textAlign: 'left', display: 'block',
                  padding: '12px 16px',
                  borderLeft: `4px solid ${isOn ? accentColor : 'transparent'}`,
                  borderTop: 'none', borderRight: 'none',
                  borderBottom: `1px solid ${SEP}`,
                  background: isOn ? '#f8fafc' : 'white',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.08s',
                }}
                onMouseEnter={e => { if (!isOn) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (!isOn) (e.currentTarget as HTMLElement).style.background = 'white'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span className="news-meta" style={{ fontSize: 9, padding: '2px 6px', borderRadius: 2, background: accentColor, color: 'white' }}>
                    {o.topic}
                  </span>
                  <span style={{ fontSize: 11, color: TEXT3, fontFamily: 'Arial, sans-serif' }}>{o.date}</span>
                </div>
                <p className="news-headline" style={{
                  fontSize: 13, color: TEXT, lineHeight: 1.35, marginBottom: 4,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {o.title}
                </p>
                <p className="news-body" style={{
                  fontSize: 12, color: TEXT2, lineHeight: 1.4,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {o.summary}
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 5 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: TEXT3, fontFamily: 'Arial, sans-serif' }}>
                    <Clock size={10} strokeWidth={1.5} />{o.readTime}
                  </span>
                  {o.sourceCount != null && (
                    <span style={{ fontSize: 11, color: TEXT3, fontFamily: 'Arial, sans-serif' }}>{o.sourceCount} sources</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Brief reader ──────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <BookOpen size={44} style={{ color: '#e2e8f0' }} strokeWidth={1} />
            <p className="news-meta" style={{ fontSize: 11, color: TEXT3 }}>Select a brief to read</p>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div style={{
              padding: '10px 20px', flexShrink: 0,
              borderBottom: `1px solid ${SEP}`, background: '#f8fafc',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              {(() => {
                const conflict = topicToConflict(selected.topic);
                return (
                  <span className="news-meta" style={{ fontSize: 10, padding: '3px 8px', borderRadius: 2, background: conflict?.accentColor ?? RED, color: 'white' }}>
                    {selected.topic}
                  </span>
                );
              })()}
              <span style={{ fontSize: 12, color: TEXT3, fontFamily: 'Arial, sans-serif' }}>{selected.date}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button
                  onClick={() => router.push(`/outlook/${selected.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 2,
                    background: '#0f172a', border: 'none',
                    fontSize: 11, fontFamily: 'Arial, sans-serif', fontWeight: 700,
                    color: 'white', cursor: 'pointer',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}
                >
                  Full Briefing <ArrowRight size={12} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '28px 36px' }}>
                {/* Tags */}
                {(() => {
                  const conflict = topicToConflict(selected.topic);
                  return (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                      <span className="news-meta" style={{ fontSize: 10, padding: '3px 8px', borderRadius: 2, background: conflict?.accentColor ?? RED, color: 'white' }}>
                        {selected.topic}
                      </span>
                      {selected.sourceCount && (
                        <span className="news-meta" style={{ fontSize: 10, padding: '3px 8px', borderRadius: 2, background: '#1e293b', color: 'white' }}>
                          {selected.sourceCount} SOURCES
                        </span>
                      )}
                    </div>
                  );
                })()}

                <h1 className="news-headline" style={{ fontSize: 26, color: TEXT, lineHeight: 1.2, marginBottom: 12 }}>
                  {selected.title}
                </h1>

                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', paddingBottom: 16, marginBottom: 20, borderBottom: `2px solid ${RED}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: TEXT2, fontFamily: 'Arial, sans-serif' }}>
                    <Clock size={12} strokeWidth={1.5} />{selected.date} · {selected.readTime}
                  </div>
                  {selected.regions?.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: TEXT2, fontFamily: 'Arial, sans-serif' }}>
                      <Globe size={12} strokeWidth={1.5} />{selected.regions.join(', ')}
                    </div>
                  )}
                </div>

                <div className="news-meta" style={{ fontSize: 10, color: TEXT3, marginBottom: 10 }}>Executive Summary</div>
                <div style={{ borderLeft: `4px solid ${RED}`, paddingLeft: 16, marginBottom: 28 }}>
                  <p className="news-body" style={{ fontSize: 14.5, color: '#1e293b', lineHeight: 1.7 }}>{selected.summary}</p>
                </div>

                <button
                  onClick={() => router.push(`/outlook/${selected.id}`)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '13px 16px', borderRadius: 2,
                    background: '#0f172a', border: 'none',
                    fontSize: 12, fontFamily: 'Arial, sans-serif', fontWeight: 700,
                    color: 'white', cursor: 'pointer',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}
                >
                  <FileText size={14} strokeWidth={1.5} />
                  Read Full Intelligence Briefing
                  <ArrowRight size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
