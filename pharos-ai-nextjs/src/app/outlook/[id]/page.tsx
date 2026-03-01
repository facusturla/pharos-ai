'use client';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchOutlookDetail } from '@/store/slices/outlookSlice';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Clock, Globe, BookOpen, Calendar, Share, ArrowUpRight } from 'lucide-react';
import AnnotatedText from '@/components/shared/AnnotatedText';
import MapViewer from '@/components/shared/MapViewer';
import OutlookCalendar from '@/components/shared/OutlookCalendar';
import AIOutlookChat from '@/components/shared/AIOutlookChat';

const LABEL = 'rgba(0,0,0,0.88)';
const LABEL2 = 'rgba(0,0,0,0.50)';
const LABEL3 = 'rgba(0,0,0,0.28)';
const SEP = 'rgba(0,0,0,0.09)';
const SYS_BLUE = '#007AFF';

const TOPIC_PILL: Record<string, { bg: string; text: string; border: string }> = {
  'middle-east':  { bg: 'rgba(255,149,0,0.10)',  text: '#B36800', border: 'rgba(255,149,0,0.20)' },
  'ukraine':      { bg: 'rgba(0,122,255,0.10)',  text: '#0055B3', border: 'rgba(0,122,255,0.20)' },
  'china-taiwan': { bg: 'rgba(255,59,48,0.10)',  text: '#CC1400', border: 'rgba(255,59,48,0.20)' },
  'nato':         { bg: 'rgba(175,82,222,0.10)', text: '#7A27B3', border: 'rgba(175,82,222,0.20)' },
  'cyber':        { bg: 'rgba(40,205,65,0.10)',  text: '#1A8C2E', border: 'rgba(40,205,65,0.20)' },
  default:        { bg: 'rgba(142,142,147,0.10)',text: '#555558', border: 'rgba(142,142,147,0.20)' },
};
function pc(slug: string) { return TOPIC_PILL[slug] || TOPIC_PILL.default; }
function slugify(n: string) { return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export default function OutlookDetailPage({ params }: { params: { id: string } }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { currentOutlook, loading, error } = useAppSelector(s => s.outlook);
  const [simpleEnglish, setSimpleEnglish] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => { dispatch(fetchOutlookDetail(params.id)); }, [dispatch, params.id]);

  const pill = currentOutlook ? pc(slugify(currentOutlook.topicSlug || currentOutlook.topic)) : pc('default');

  if (loading.detail) return (
    <div className="flex-1 flex items-center justify-center" style={{ background: '#FFFFFF' }}>
      <p className="text-[13px]" style={{ color: LABEL3 }}>Loading briefing…</p>
    </div>
  );

  if (error.detail || !currentOutlook) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ background: '#FFFFFF' }}>
      <p className="text-[14px] font-medium" style={{ color: LABEL2 }}>Briefing unavailable</p>
      <button onClick={() => dispatch(fetchOutlookDetail(params.id))}
        className="px-4 py-2 rounded-[6px] text-[13px] font-medium"
        style={{ background: SYS_BLUE, color: 'white' }}>Retry</button>
    </div>
  );

  const displayText = simpleEnglish ? currentOutlook.content.easierEnglish : currentOutlook.content.standard;

  return (
    <>
      {/* Article column */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#FFFFFF' }}>
        {/* Toolbar */}
        <div className="flex items-center px-4 gap-2 flex-shrink-0"
          style={{ height: 44, borderBottom: `0.5px solid ${SEP}`, background: 'rgba(246,246,246,0.93)', backdropFilter: 'blur(20px) saturate(180%)' }}>
          <button onClick={() => router.back()}
            className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[14px] transition-colors"
            style={{ color: SYS_BLUE, background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,122,255,0.08)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
            <ChevronLeft size={16} strokeWidth={2} />
            Back
          </button>
          <div className="w-[0.5px] h-[18px] mx-1" style={{ background: SEP }} />
          <div className="flex-1 flex items-center justify-center gap-2">
            <span className="text-[12px] font-semibold px-2.5 py-[3px] rounded-full border-[0.5px]"
              style={{ background: pill.bg, color: pill.text, borderColor: pill.border }}>
              {currentOutlook.topic}
            </span>
            <span className="text-[12px]" style={{ color: LABEL3 }}>{currentOutlook.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <ActionBtn icon={<BookOpen size={14} strokeWidth={1.5} />} label={simpleEnglish ? 'Standard' : 'Simpler'} onClick={() => setSimpleEnglish(v => !v)} active={simpleEnglish} />
            <ActionBtn icon={<Calendar size={14} strokeWidth={1.5} />} label="Calendar" onClick={() => setCalendarOpen(true)} />
            <ActionBtn icon={<Share size={14} strokeWidth={1.5} />} label="Share" onClick={() => {}} />
          </div>
        </div>

        {/* Article scroll area */}
        <div className="flex-1 overflow-y-auto flex justify-center">
          <div className="w-full max-w-[680px] px-6 py-9">
            {/* Topic + confidence */}
            <div className="flex items-center gap-2 mb-3.5 flex-wrap">
              <span className="text-[12px] font-semibold px-2.5 py-[3px] rounded-full border-[0.5px]"
                style={{ background: pill.bg, color: pill.text, borderColor: pill.border }}>
                {currentOutlook.topic}
              </span>
              {currentOutlook.annotations?.length > 0 && (
                <span className="text-[12px] font-medium px-2.5 py-[3px] rounded-full border-[0.5px]"
                  style={{ background: 'rgba(40,205,65,0.10)', color: '#1A8C2E', borderColor: 'rgba(40,205,65,0.20)' }}>
                  Annotated
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-[28px] font-bold leading-[1.25] tracking-[-0.03em] mb-3.5" style={{ color: LABEL }}>
              {currentOutlook.title}
            </h1>

            {/* Byline */}
            <div className="flex items-center gap-3.5 flex-wrap pb-4 mb-5" style={{ borderBottom: `0.5px solid ${SEP}` }}>
              <span className="flex items-center gap-1.5 text-[12px]" style={{ color: LABEL2 }}>
                <Clock size={12} strokeWidth={1.5} />
                {currentOutlook.date} · {currentOutlook.readTime}
              </span>
              {currentOutlook.regions?.length > 0 && (
                <span className="flex items-center gap-1.5 text-[12px]" style={{ color: LABEL2 }}>
                  <Globe size={12} strokeWidth={1.5} />
                  {currentOutlook.regions.join(', ')}
                </span>
              )}
              {currentOutlook.sources?.length > 0 && (
                <span className="text-[12px]" style={{ color: LABEL2 }}>{currentOutlook.sources.length} sources</span>
              )}
            </div>

            {/* Executive summary */}
            <div className="mb-7 rounded-[0_10px_10px_0] p-4"
              style={{ background: 'rgba(0,122,255,0.05)', border: '0.5px solid rgba(0,122,255,0.18)', borderLeft: `3px solid ${SYS_BLUE}` }}>
              <div className="text-[10.5px] font-bold uppercase tracking-[0.07em] mb-1.5" style={{ color: SYS_BLUE }}>
                Executive Summary
              </div>
              <p className="text-[14.5px] leading-[1.65]" style={{ color: LABEL }}>{currentOutlook.summary}</p>
            </div>

            {/* Body */}
            <div className="text-[16px] leading-[1.72]" style={{ color: LABEL }}>
              {currentOutlook.annotations?.length > 0 ? (
                <AnnotatedText text={displayText} annotations={currentOutlook.annotations} sources={currentOutlook.sources} />
              ) : (
                displayText.split('\n\n').filter(Boolean).map((p, i) => (
                  <p key={i} className="mb-5">{p}</p>
                ))
              )}
            </div>

            {/* Map */}
            {currentOutlook.mapConfig?.markers?.length > 0 && (
              <div className="mt-10 rounded-[14px] overflow-hidden border-[0.5px]" style={{ borderColor: SEP }}>
                <MapViewer config={currentOutlook.mapConfig} />
              </div>
            )}

            {/* Sources */}
            {currentOutlook.sources?.length > 0 && (
              <div className="mt-9 pt-6" style={{ borderTop: `0.5px solid ${SEP}` }}>
                <div className="text-[12px] font-bold uppercase tracking-[0.07em] mb-3" style={{ color: LABEL3 }}>Sources</div>
                <div className="space-y-2">
                  {currentOutlook.sources.map((s) => (
                    <div key={s.id} className="flex gap-2.5 text-[13px]">
                      <span className="font-mono text-[12px] min-w-[1.5rem]" style={{ color: LABEL3 }}>[{s.id}]</span>
                      <a href={s.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:underline" style={{ color: SYS_BLUE }}>
                        {s.title}
                        <ArrowUpRight size={11} strokeWidth={2} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar */}
      {currentOutlook.topicSlug && (
        <OutlookCalendar
          topicSlug={currentOutlook.topicSlug}
          topicName={currentOutlook.topic}
          currentOutlookSlug={params.id}
          isOpen={calendarOpen}
          onClose={() => setCalendarOpen(false)}
        />
      )}

      {/* AI chat */}
      <AIOutlookChat outlookTitle={currentOutlook.title} outlookTopic={currentOutlook.topic} outlookId={params.id} />
    </>
  );
}

function ActionBtn({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-[6px] text-[12px] font-medium border-[0.5px] transition-colors"
      style={{
        background: active ? SYS_BLUE : 'rgba(0,0,0,0.06)',
        color: active ? 'white' : LABEL,
        borderColor: active ? 'transparent' : SEP,
      }}>
      {icon}
      {label}
    </button>
  );
}
