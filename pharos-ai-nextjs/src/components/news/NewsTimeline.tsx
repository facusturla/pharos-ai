'use client';

import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { getFeedById, type RssFeed } from '@/data/rssFeeds';

// ─── Types ────────────────────────────────────────────────────

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet?: string;
  creator?: string;
  isoDate?: string;
  imageUrl?: string;
}

interface TimelineArticle {
  id: string;
  title: string;
  link: string;
  snippet: string;
  time: Date;
  feed: RssFeed;
  imageUrl?: string;
}

interface NewsTimelineProps {
  feedData: Map<string, FeedItem[]>;
}

// ─── Colors ───────────────────────────────────────────────────

const PERSPECTIVE_COLORS: Record<string, string> = {
  WESTERN: '#3b82f6',
  US_GOV: '#60a5fa',
  ISRAELI: '#a78bfa',
  IRANIAN: '#ef4444',
  ARAB: '#f59e0b',
  RUSSIAN: '#f97316',
  CHINESE: '#dc2626',
  INDEPENDENT: '#10b981',
};

// ─── Tier → vertical distance from spine ──────────────────────

const TIER_Y_OFFSET: Record<number, number> = {
  1: 10,
  2: 70,
  3: 150,
  4: 230,
};

const TIER_LABELS: Record<number, string> = {
  1: 'WIRE / PRIMARY',
  2: 'MAJOR GLOBAL',
  3: 'REGIONAL',
  4: 'STATE / NICHE',
};

// Layout
const CARD_W = 240;
const CARD_GAP = 14;
const TIME_SLOT_W = CARD_W + CARD_GAP;
const IMG_H = 110;
const PADDING_X = 120;
const SPINE_Y_BASE = 450; // base spine Y in canvas coords (enough room above)

// Zoom
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.08;

// ─── Helpers ──────────────────────────────────────────────────

function formatHour(d: Date): string {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatTimeAgo(d: Date): string {
  const ms = Date.now() - d.getTime();
  if (ms < 60000) return 'now';
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

// ─── Component ────────────────────────────────────────────────

export function NewsTimeline({ feedData }: NewsTimelineProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedTiers, setSelectedTiers] = useState<Set<number>>(new Set([1, 2, 3, 4]));
  const viewportRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas transform state
  const [zoom, setZoom] = useState(0.75);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ active: false, startX: 0, startY: 0, panX: 0, panY: 0 });

  const spineY = SPINE_Y_BASE;

  // ─── Mouse drag to pan ──────────────────────────────────────
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a')) return;
      dragState.current = { active: true, startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
      setIsDragging(true);
      e.preventDefault();
    };

    const onMove = (e: MouseEvent) => {
      if (!dragState.current.active) return;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      setPan({ x: dragState.current.panX + dx, y: dragState.current.panY + dy });
    };

    const onClick = (e: MouseEvent) => {
      const dx = Math.abs(e.clientX - dragState.current.startX);
      const dy = Math.abs(e.clientY - dragState.current.startY);
      if (dx > 5 || dy > 5) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const onUp = () => {
      dragState.current.active = false;
      setIsDragging(false);
    };

    el.addEventListener('mousedown', onDown);
    el.addEventListener('click', onClick, true);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      el.removeEventListener('mousedown', onDown);
      el.removeEventListener('click', onClick, true);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [pan.x, pan.y]);

  // ─── Scroll to zoom (centered on mouse) ────────────────────
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta));
      const scale = newZoom / zoom;

      // Adjust pan so zoom centers on mouse position
      setPan(prev => ({
        x: mouseX - scale * (mouseX - prev.x),
        y: mouseY - scale * (mouseY - prev.y),
      }));
      setZoom(newZoom);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoom]);

  // ─── Articles ───────────────────────────────────────────────
  const articles = useMemo(() => {
    const items: TimelineArticle[] = [];
    feedData.forEach((feedItems, feedId) => {
      const feed = getFeedById(feedId);
      if (!feed) return;
      for (const item of feedItems) {
        const dateStr = item.isoDate ?? item.pubDate;
        if (!dateStr) continue;
        const time = new Date(dateStr);
        if (isNaN(time.getTime())) continue;
        items.push({
          id: `${feedId}-${time.getTime()}-${item.link}`,
          title: item.title,
          link: item.link,
          snippet: item.contentSnippet ?? '',
          time,
          feed,
          imageUrl: item.imageUrl,
        });
      }
    });
    items.sort((a, b) => a.time.getTime() - b.time.getTime());
    return items;
  }, [feedData]);

  const filtered = useMemo(
    () => articles.filter(a => selectedTiers.has(a.feed.tier)),
    [articles, selectedTiers],
  );

  // ─── Layout ─────────────────────────────────────────────────
  const layout = useMemo(() => {
    const laneNextX: Record<string, number> = {};
    const positioned: { article: TimelineArticle; x: number; above: boolean; yOffset: number }[] = [];
    const hourMarkers: { hour: Date; x: number }[] = [];
    let lastHourStr = '';
    let globalIdx = 0;

    for (const article of filtered) {
      const tier = article.feed.tier;
      const yOffset = TIER_Y_OFFSET[tier] ?? 150;
      const above = globalIdx % 2 === 0;
      const laneKey = `${above ? 'a' : 'b'}-${tier}`;

      const globalX = PADDING_X + globalIdx * TIME_SLOT_W;
      const laneX = laneNextX[laneKey] ?? 0;
      const x = Math.max(globalX, laneX);
      laneNextX[laneKey] = x + CARD_W + CARD_GAP;

      const hourStr = formatHour(article.time).slice(0, 2);
      if (hourStr !== lastHourStr) {
        hourMarkers.push({ hour: new Date(article.time), x: x + CARD_W / 2 });
        lastHourStr = hourStr;
      }

      positioned.push({ article, x, above, yOffset });
      globalIdx++;
    }

    const totalWidth = Math.max(PADDING_X * 2 + (globalIdx + 1) * TIME_SLOT_W, 1200);
    const totalHeight = spineY * 2 + 100;

    return { positioned, hourMarkers, totalWidth, totalHeight };
  }, [filtered, spineY]);

  // ─── Center on newest article on mount ──────────────────────
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || layout.positioned.length === 0) return;
    const rect = vp.getBoundingClientRect();
    const lastCard = layout.positioned[layout.positioned.length - 1];
    const targetX = lastCard.x + CARD_W / 2;

    requestAnimationFrame(() => {
      setPan({
        x: rect.width - targetX * zoom - 100,
        y: (rect.height / 2) - spineY * zoom,
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout.positioned.length > 0]);

  const toggleTier = useCallback((tier: number) => {
    setSelectedTiers(prev => {
      const next = new Set(prev);
      if (next.has(tier)) { if (next.size > 1) next.delete(tier); }
      else { next.add(tier); }
      return next;
    });
  }, []);

  // Reset view
  const resetView = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const rect = vp.getBoundingClientRect();
    const lastCard = layout.positioned[layout.positioned.length - 1];
    const targetX = lastCard ? lastCard.x + CARD_W / 2 : layout.totalWidth / 2;
    setZoom(0.75);
    setPan({
      x: rect.width - targetX * 0.75 - 100,
      y: (rect.height / 2) - spineY * 0.75,
    });
  }, [layout, spineY]);

  const zoomPct = Math.round(zoom * 100);

  return (
    <div ref={containerRef} className="flex flex-col w-full h-full min-h-0">
      {/* Header */}
      <div className="px-5 py-2 bg-[var(--bg-2)] border-b border-[var(--bd)] flex items-center gap-4 shrink-0 z-10">
        <span className="mono text-[10px] font-bold text-[var(--t2)] tracking-wider">TIMELINE</span>
        <div className="w-px h-4 bg-[var(--bd)]" />

        <div className="flex gap-1">
          {[1, 2, 3, 4].map(tier => (
            <button
              key={tier}
              onClick={() => toggleTier(tier)}
              className={`px-2 py-1 rounded text-[8px] mono font-bold tracking-wider transition-colors
                ${selectedTiers.has(tier)
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-[var(--t4)] border border-transparent hover:text-[var(--t2)]'
                }`}
            >
              T{tier} {TIER_LABELS[tier]}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Zoom controls */}
          <div className="flex items-center gap-1.5 border border-[var(--bd)] rounded px-2 py-0.5">
            <button
              onClick={() => setZoom(z => Math.max(MIN_ZOOM, z - ZOOM_STEP * 2))}
              className="mono text-[11px] text-[var(--t3)] hover:text-white w-4 text-center"
            >−</button>
            <span className="mono text-[8px] text-[var(--t4)] w-8 text-center">{zoomPct}%</span>
            <button
              onClick={() => setZoom(z => Math.min(MAX_ZOOM, z + ZOOM_STEP * 2))}
              className="mono text-[11px] text-[var(--t3)] hover:text-white w-4 text-center"
            >+</button>
          </div>
          <button
            onClick={resetView}
            className="mono text-[8px] text-[var(--t4)] hover:text-[var(--t2)] transition-colors"
          >
            RESET
          </button>
          <span className="mono text-[8px] text-[var(--t4)]">{filtered.length} articles</span>
        </div>
      </div>

      {/* ─── Canvas viewport ─── */}
      <div
        ref={viewportRef}
        className="flex-1 min-h-0 overflow-hidden relative"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: isDragging ? 'none' : 'auto',
        }}
      >
        {/* Dot grid background — fixed to viewport, moves with pan */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)`,
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x % (24 * zoom)}px ${pan.y % (24 * zoom)}px`,
          }}
        />

        {/* Transformed canvas layer */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            position: 'absolute',
            width: `${layout.totalWidth}px`,
            height: `${layout.totalHeight}px`,
          }}
        >
          {/* ─── Horizontal spine ─── */}
          <div className="absolute left-0 right-0" style={{ top: `${spineY}px` }}>
            <div className="absolute inset-x-0 h-[2px] bg-white/10" />
            <div
              className="absolute inset-x-0 h-px"
              style={{ boxShadow: '0 0 12px rgba(255,255,255,0.04), 0 0 3px rgba(255,255,255,0.08)' }}
            />
          </div>

          {/* Axis labels */}
          <div
            className="absolute mono text-[9px] text-[var(--t4)] tracking-widest"
            style={{ top: `${spineY - 26}px`, left: '20px', opacity: 0.35 }}
          >
            ▲ IMPORTANT
          </div>
          <div
            className="absolute mono text-[9px] text-[var(--t4)] tracking-widest"
            style={{ top: `${spineY + 14}px`, left: '20px', opacity: 0.35 }}
          >
            ▼ NICHE
          </div>

          <div
            className="absolute mono text-[9px] text-[var(--t4)]"
            style={{ top: `${spineY - 6}px`, right: '30px', opacity: 0.35 }}
          >
            NOW →
          </div>

          {/* ─── Hour markers ─── */}
          {layout.hourMarkers.map(({ hour, x }) => (
            <div key={hour.toISOString()}>
              <div
                className="absolute w-px bg-white/8"
                style={{ left: `${x}px`, top: '0', bottom: '0' }}
              />
              <div
                className="absolute mono text-[11px] font-bold text-[var(--t3)] whitespace-nowrap"
                style={{ left: `${x - 16}px`, top: `${spineY + 24}px` }}
              >
                {formatHour(hour)}
              </div>
              <div
                className="absolute w-3 h-3 rounded-full bg-[var(--bg-app)] border-2 border-[var(--t4)]"
                style={{ left: `${x - 6}px`, top: `${spineY - 6}px` }}
              />
            </div>
          ))}

          {/* ─── Article cards ─── */}
          {layout.positioned.map(({ article, x, above, yOffset }) => {
            const color = PERSPECTIVE_COLORS[article.feed.perspective] ?? '#6b7280';
            const isHovered = hoveredId === article.id;
            const hasImg = !!article.imageUrl;
            const cardH = hasImg ? IMG_H + 80 : 90;

            const cardTop = above
              ? spineY - yOffset - cardH
              : spineY + yOffset + 18;

            const connectorTop = above ? cardTop + cardH : spineY + 2;
            const connectorH = above ? spineY - (cardTop + cardH) : cardTop - spineY - 2;
            const cardCenter = x + CARD_W / 2;

            return (
              <div key={article.id}>
                {/* Connector */}
                <div
                  className="absolute transition-opacity duration-200"
                  style={{
                    left: `${cardCenter}px`,
                    top: `${connectorTop}px`,
                    width: '1px',
                    height: `${Math.max(connectorH, 0)}px`,
                    backgroundColor: color,
                    opacity: isHovered ? 0.6 : 0.12,
                  }}
                />
                {/* Spine dot */}
                <div
                  className="absolute rounded-full transition-all duration-200"
                  style={{
                    left: `${cardCenter - 4}px`,
                    top: `${spineY - 4}px`,
                    width: isHovered ? '10px' : '6px',
                    height: isHovered ? '10px' : '6px',
                    marginLeft: isHovered ? '-2px' : '0',
                    marginTop: isHovered ? '-2px' : '0',
                    backgroundColor: color,
                    opacity: isHovered ? 0.9 : 0.35,
                    boxShadow: isHovered ? `0 0 10px ${color}60` : 'none',
                  }}
                />

                {/* Card */}
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute block no-underline group"
                  style={{ left: `${x}px`, top: `${cardTop}px`, width: `${CARD_W}px` }}
                  onMouseEnter={() => setHoveredId(article.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div
                    className={`rounded-lg border transition-all duration-200 overflow-hidden
                      ${isHovered
                        ? 'bg-[var(--bg-2)] border-white/20 shadow-2xl shadow-black/40 scale-[1.03]'
                        : 'bg-[var(--bg-1)] border-[var(--bd)] hover:border-white/10'
                      }`}
                  >
                    {hasImg && (
                      <div className="w-full overflow-hidden bg-[var(--bg-2)]" style={{ height: `${IMG_H}px` }}>
                        <img
                          src={article.imageUrl}
                          alt=""
                          className={`w-full h-full object-cover transition-all duration-200 ${isHovered ? 'opacity-100 scale-[1.02]' : 'opacity-50'}`}
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <div className="px-3 py-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div
                          className="px-1.5 py-0.5 rounded text-[7px] mono font-bold leading-none"
                          style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}30` }}
                        >
                          {article.feed.name.length > 14 ? article.feed.id.toUpperCase() : article.feed.name.toUpperCase()}
                        </div>
                        {article.feed.stateFunded && (
                          <span className="text-[6px] mono font-bold text-amber-400/70 tracking-wider">STATE</span>
                        )}
                        <span className="text-[7px] mono text-[var(--t4)] ml-auto shrink-0">
                          {formatHour(article.time)} · {formatTimeAgo(article.time)}
                        </span>
                      </div>
                      <h4 className="text-[11px] text-[var(--t1)] font-medium leading-tight group-hover:text-white line-clamp-2">
                        {article.title}
                      </h4>
                      {isHovered && article.snippet && (
                        <p className="text-[9px] text-[var(--t4)] mt-1 leading-relaxed line-clamp-2">
                          {article.snippet}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 - article.feed.tier }).map((_, i) => (
                            <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: color, opacity: 0.6 }} />
                          ))}
                          {Array.from({ length: article.feed.tier - 1 }).map((_, i) => (
                            <div key={i} className="w-1 h-1 rounded-full bg-white/10" />
                          ))}
                        </div>
                        <span className="text-[7px] mono text-[var(--t4)]">{article.feed.country}</span>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="absolute" style={{ top: `${spineY - 20}px`, left: '100px' }}>
              <span className="mono text-[11px] text-[var(--t4)]">No articles for selected tiers</span>
            </div>
          )}
        </div>

        {/* ─── Zoom level indicator (bottom-left) ─── */}
        <div className="absolute bottom-4 left-4 mono text-[9px] text-[var(--t4)] opacity-50 pointer-events-none">
          {zoomPct}% · scroll to zoom · drag to pan
        </div>
      </div>
    </div>
  );
}
