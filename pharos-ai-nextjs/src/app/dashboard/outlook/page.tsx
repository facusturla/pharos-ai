'use client';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchOutlooks } from '@/store/slices/outlookSlice';
import { TopicSidebar } from '@/components/dashboard/TopicSidebar';
import { useRouter } from 'next/navigation';
import { Clock, Globe, FileText } from 'lucide-react';

const SEP = 'rgba(0,0,0,0.09)';
const LABEL = 'rgba(0,0,0,0.88)';
const LABEL2 = 'rgba(0,0,0,0.50)';
const LABEL3 = 'rgba(0,0,0,0.28)';
const SYS_BLUE = '#007AFF';

const PILL: Record<string, { bg: string; text: string; border: string }> = {
  default: { bg: 'rgba(142,142,147,0.10)', text: '#555558', border: 'rgba(142,142,147,0.20)' },
};
function pc(topic: string) { return PILL.default; }

export default function OutlookListPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { outlooks, loading, pagination } = useAppSelector(s => s.outlook);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchOutlooks({ limit: 20, offset: 0 })); }, [dispatch]);

  const selected = outlooks.find(o => o.id === selectedId);

  return (
    <>
      <TopicSidebar selected={selectedTopic} onSelect={setSelectedTopic} />

      {/* List pane */}
      <div className="flex flex-col overflow-hidden flex-shrink-0" style={{ width: 320, borderRight: `0.5px solid ${SEP}`, background: '#F8F8F8' }}>
        <div
          className="flex items-center px-4 flex-shrink-0"
          style={{ height: 44, borderBottom: `0.5px solid ${SEP}`, background: 'rgba(246,246,246,0.93)', backdropFilter: 'blur(20px) saturate(180%)' }}
        >
          <span className="text-[15px] font-semibold flex-1 tracking-[-0.01em]" style={{ color: LABEL }}>Outlooks</span>
          <span className="text-[12px]" style={{ color: LABEL3 }}>{pagination?.total ?? 0} total</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading.list && outlooks.length === 0 && (
            <div className="flex justify-center py-12"><span className="text-[12px]" style={{ color: LABEL3 }}>Loading…</span></div>
          )}
          {outlooks.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelectedId(o.id)}
              className="w-full text-left flex flex-col px-4 py-3 transition-colors"
              style={{ background: selectedId === o.id ? '#2F6EBA' : 'transparent', borderBottom: `0.5px solid ${SEP}` }}
              onMouseEnter={e => { if (selectedId !== o.id) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)'; }}
              onMouseLeave={e => { if (selectedId !== o.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold px-2 py-[2px] rounded-full border-[0.5px]"
                  style={selectedId === o.id
                    ? { background: 'rgba(255,255,255,0.20)', color: 'white', borderColor: 'rgba(255,255,255,0.30)' }
                    : { background: 'rgba(142,142,147,0.10)', color: '#555558', borderColor: 'rgba(142,142,147,0.20)' }}>
                  {o.topic}
                </span>
                <span className="text-[11px]" style={{ color: selectedId === o.id ? 'rgba(255,255,255,0.60)' : LABEL3 }}>{o.date}</span>
              </div>
              <p className="text-[13px] font-semibold leading-snug mb-1 line-clamp-2 tracking-[-0.01em]"
                style={{ color: selectedId === o.id ? 'white' : LABEL }}>{o.title}</p>
              <p className="text-[12px] leading-[1.4] line-clamp-2"
                style={{ color: selectedId === o.id ? 'rgba(255,255,255,0.75)' : LABEL2 }}>{o.summary}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-[11px]" style={{ color: selectedId === o.id ? 'rgba(255,255,255,0.55)' : LABEL3 }}>
                  <Clock size={10} strokeWidth={1.5} />{o.readTime}
                </span>
                <span className="text-[11px]" style={{ color: selectedId === o.id ? 'rgba(255,255,255,0.55)' : LABEL3 }}>
                  {o.sourceCount} sources
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#FFFFFF' }}>
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <FileText size={40} style={{ color: LABEL3 }} strokeWidth={1} />
            <p className="text-[14px] font-medium tracking-[-0.01em]" style={{ color: LABEL2 }}>Select an outlook</p>
          </div>
        ) : (
          <>
            <div className="flex items-center px-4 gap-3 flex-shrink-0"
              style={{ height: 44, borderBottom: `0.5px solid ${SEP}`, background: 'rgba(246,246,246,0.93)', backdropFilter: 'blur(20px) saturate(180%)' }}>
              <span className="flex-1 text-[13px] font-medium truncate" style={{ color: LABEL2 }}>{selected.topic} · {selected.date}</span>
              <button
                onClick={() => router.push(`/outlook/${selected.id}`)}
                className="flex items-center gap-1.5 px-3 py-[5px] rounded-[6px] text-[12.5px] font-medium"
                style={{ background: SYS_BLUE, color: 'white' }}>
                Open Full Briefing
              </button>
            </div>
            <div className="flex-1 overflow-y-auto flex justify-center">
              <div className="w-full max-w-2xl px-6 py-9">
                <h1 className="text-[28px] font-bold leading-[1.25] tracking-[-0.03em] mb-3.5" style={{ color: LABEL }}>{selected.title}</h1>
                <div className="flex items-center gap-3 flex-wrap pb-4 mb-5" style={{ borderBottom: `0.5px solid ${SEP}` }}>
                  <span className="flex items-center gap-1.5 text-[12px]" style={{ color: LABEL2 }}><Clock size={12} strokeWidth={1.5} />{selected.date} · {selected.readTime}</span>
                  {selected.regions?.length > 0 && <span className="flex items-center gap-1.5 text-[12px]" style={{ color: LABEL2 }}><Globe size={12} strokeWidth={1.5} />{selected.regions.join(', ')}</span>}
                </div>
                <div className="mb-7 rounded-[0_10px_10px_0] p-4"
                  style={{ background: 'rgba(0,122,255,0.05)', border: '0.5px solid rgba(0,122,255,0.18)', borderLeft: `3px solid ${SYS_BLUE}` }}>
                  <div className="text-[10.5px] font-bold uppercase tracking-[0.07em] mb-1.5" style={{ color: SYS_BLUE }}>Executive Summary</div>
                  <p className="text-[14.5px] leading-[1.65]" style={{ color: LABEL }}>{selected.summary}</p>
                </div>
                <button onClick={() => router.push(`/outlook/${selected.id}`)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px] text-[14px] font-semibold"
                  style={{ background: SYS_BLUE, color: 'white' }}>
                  Read Full Intelligence Briefing
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
