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
  1: 12,
  2: 80,
  3: 160,
  4: 240,
};

const TIER_LABELS: Record<number, string> = {
  1: 'WIRE',
  2: 'MAJOR',
  3: 'REGIONAL',
  4: 'STATE',
};

// Layout
const CARD_W = 260;
const CARD_GAP = 16;
const TIME_SLOT_W = CARD_W + CARD_GAP;
const IMG_H = 100;
const PADDING_X = 140;
const SPINE_Y = 500;
const CANVAS_H = SPINE_Y * 2 + 100;

// Zoom
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 1.2;
const ZOOM_STEP = 0.06;
const DEFAULT_ZOOM = 0.65;

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

/** Proxy image through our cache to avoid rate limiting */
function proxyImg(url: string): string {
  return `/api/img?url=${encodeURIComponent(url)}`;
}

// ─── Component ────────────────────────────────────────────────

export function NewsTimeline({ feedData }: NewsTimelineProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedArticle, setFocusedArticle] = useState<TimelineArticle | null>(null);
  const [selectedTiers, setSelectedTiers] = useState<Set<number>>(new Set([1, 2, 3, 4]));
  const viewportRef = useRef<HTMLDivElement>(null);

  // ── Use refs as the single source of truth for transform state.
  // Event handlers read/write refs directly — no stale closures.
  // setState only triggers re-render; actual values come from refs.
  const zoomRef = useRef(DEFAULT_ZOOM);
  const panRef  = useRef({ x: 0, y: 0 });
  const [transform, setTransform] = useState({ zoom: DEFAULT_ZOOM, pan: { x: 0, y: 0 } });

  const commitTransform = useCallback(() => {
    setTransform({ zoom: zoomRef.current, pan: { ...panRef.current } });
  }, []);

  const zoom = transform.zoom;
  const pan  = transform.pan;

  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ active: false, startX: 0, startY: 0, panX: 0, panY: 0, moved: false });
  const initialCenterDone = useRef(false);

  // ─── Drag to pan (registered once — reads refs, no deps) ────
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a')) return;
      dragState.current = {
        active: true,
        startX: e.clientX, startY: e.clientY,
        panX: panRef.current.x, panY: panRef.current.y,
        moved: false,
      };
      setIsDragging(true);
      e.preventDefault();
    };

    const onMove = (e: MouseEvent) => {
      if (!dragState.current.active) return;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragState.current.moved = true;
      panRef.current = { x: dragState.current.panX + dx, y: dragState.current.panY + dy };
      commitTransform();
    };

    const onClick = (e: MouseEvent) => {
      if (dragState.current.moved) {
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
  }, [commitTransform]); // commitTransform is stable

  // ─── Scroll to zoom (registered once — reads refs, no deps) ─
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const currentZoom = zoomRef.current;
      const direction = e.deltaY > 0 ? -1 : 1;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentZoom + direction * ZOOM_STEP));
      if (newZoom === currentZoom) return;

      const scale = newZoom / currentZoom;
      const px = panRef.current.x;
      const py = panRef.current.y;

      panRef.current  = { x: mouseX - scale * (mouseX - px), y: mouseY - scale * (mouseY - py) };
      zoomRef.current = newZoom;
      commitTransform();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [commitTransform]); // commitTransform is stable

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
      const yOffset = TIER_Y_OFFSET[tier] ?? 160;
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
    return { positioned, hourMarkers, totalWidth };
  }, [filtered]);

  // ─── Center on newest ───────────────────────────────────────
  const centerOnNewest = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp || layout.positioned.length === 0) return;
    const rect = vp.getBoundingClientRect();
    const last = layout.positioned[layout.positioned.length - 1];
    const targetX = last.x + CARD_W / 2;
    const z = zoomRef.current;
    panRef.current = {
      x: rect.width - targetX * z - 200,
      y: (rect.height / 2) - SPINE_Y * z,
    };
    commitTransform();
  }, [layout, commitTransform]);

  // Initial center
  useEffect(() => {
    if (initialCenterDone.current || layout.positioned.length === 0) return;
    initialCenterDone.current = true;
    requestAnimationFrame(centerOnNewest);
  }, [layout.positioned.length, centerOnNewest]);

  const resetView = useCallback(() => {
    zoomRef.current = DEFAULT_ZOOM;
    requestAnimationFrame(() => {
      const vp = viewportRef.current;
      if (!vp || layout.positioned.length === 0) return;
      const rect = vp.getBoundingClientRect();
      const last = layout.positioned[layout.positioned.length - 1];
      const targetX = last.x + CARD_W / 2;
      panRef.current = {
        x: rect.width - targetX * DEFAULT_ZOOM - 200,
        y: (rect.height / 2) - SPINE_Y * DEFAULT_ZOOM,
      };
      commitTransform();
    });
  }, [layout, commitTransform]);

  const toggleTier = useCallback((tier: number) => {
    setSelectedTiers(prev => {
      const next = new Set(prev);
      if (next.has(tier)) { if (next.size > 1) next.delete(tier); }
      else { next.add(tier); }
      return next;
    });
  }, []);

  const zoomPct = Math.round(zoom * 100);

  // ─── Viewport culling for performance ───────────────────────
  const visibleCards = useMemo(() => {
    const vp = viewportRef.current;
    if (!vp) return layout.positioned;
    const rect = vp.getBoundingClientRect();
    // Calculate visible canvas region
    const viewLeft = -pan.x / zoom - 200;
    const viewRight = (-pan.x + rect.width) / zoom + 200;
    return layout.positioned.filter(({ x }) => {
      return x + CARD_W > viewLeft && x < viewRight;
    });
  }, [layout.positioned, pan.x, zoom]);

  return (
    <div className="flex flex-col w-full h-full min-h-0">
      {/* Header */}
      <div className="px-5 py-2 bg-[var(--bg-2)] border-b border-[var(--bd)] flex items-center gap-3 shrink-0 z-10">
        <span className="mono text-[11px] font-bold text-white tracking-wider">TIMELINE</span>
        <div className="w-px h-4 bg-white/20" />

        <div className="flex gap-1">
          {[1, 2, 3, 4].map(tier => (
            <button
              key={tier}
              onClick={() => toggleTier(tier)}
              className={`px-2 py-1 rounded text-[9px] mono font-bold tracking-wider transition-colors
                ${selectedTiers.has(tier)
                  ? 'bg-white/15 text-white border border-white/30'
                  : 'text-white/40 border border-transparent hover:text-white/70'
                }`}
            >
              T{tier} {TIER_LABELS[tier]}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 border border-white/20 rounded px-2 py-0.5">
            <button
              onClick={() => { zoomRef.current = Math.max(MIN_ZOOM, zoomRef.current - ZOOM_STEP * 2); commitTransform(); }}
              className="mono text-[12px] text-white/70 hover:text-white w-4 text-center"
            >−</button>
            <span className="mono text-[9px] text-white/70 w-10 text-center font-bold">{zoomPct}%</span>
            <button
              onClick={() => { zoomRef.current = Math.min(MAX_ZOOM, zoomRef.current + ZOOM_STEP * 2); commitTransform(); }}
              className="mono text-[12px] text-white/70 hover:text-white w-4 text-center"
            >+</button>
          </div>
          <button
            onClick={centerOnNewest}
            className="mono text-[9px] font-bold text-white/70 hover:text-white transition-colors px-2 py-1 border border-white/20 rounded"
          >
            → LATEST
          </button>
          <button
            onClick={resetView}
            className="mono text-[9px] text-white/50 hover:text-white transition-colors"
          >
            RESET
          </button>
          <span className="mono text-[9px] font-bold text-white/60">{filtered.length} articles</span>
        </div>
      </div>

      {/* ─── Canvas viewport ─── */}
      <div
        ref={viewportRef}
        className="flex-1 min-h-0 overflow-hidden relative"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          background: '#0a0a0f',
        }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)`,
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x % (24 * zoom)}px ${pan.y % (24 * zoom)}px`,
          }}
        />

        {/* Canvas layer */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            position: 'absolute',
            width: `${layout.totalWidth}px`,
            height: `${CANVAS_H}px`,
            willChange: 'transform',
          }}
        >
          {/* ─── Spine ─── */}
          <div
            className="absolute left-0 right-0 h-[3px] bg-white/20"
            style={{ top: `${SPINE_Y}px` }}
          />

          {/* Axis labels */}
          <div
            className="absolute mono text-[12px] text-white/60 tracking-widest font-bold"
            style={{ top: `${SPINE_Y - 30}px`, left: '24px' }}
          >
            ▲ IMPORTANT
          </div>
          <div
            className="absolute mono text-[12px] text-white/60 tracking-widest font-bold"
            style={{ top: `${SPINE_Y + 16}px`, left: '24px' }}
          >
            ▼ NICHE
          </div>
          <div
            className="absolute mono text-[12px] text-white/60 font-bold"
            style={{ top: `${SPINE_Y - 8}px`, right: '30px' }}
          >
            NOW →
          </div>

          {/* ─── Hour markers ─── */}
          {layout.hourMarkers.map(({ hour, x }) => (
            <div key={hour.toISOString()}>
              <div
                className="absolute w-px bg-white/[0.08]"
                style={{ left: `${x}px`, top: '0', bottom: '0' }}
              />
              {/* Above spine */}
              <div
                className="absolute mono text-[16px] font-bold text-white whitespace-nowrap"
                style={{ left: `${x - 22}px`, top: `${SPINE_Y - 50}px` }}
              >
                {formatHour(hour)}
              </div>
              {/* Below spine */}
              <div
                className="absolute mono text-[16px] font-bold text-white whitespace-nowrap"
                style={{ left: `${x - 22}px`, top: `${SPINE_Y + 26}px` }}
              >
                {formatHour(hour)}
              </div>
              {/* Dot */}
              <div
                className="absolute w-5 h-5 rounded-full bg-[#0a0a0f] border-[3px] border-white/50"
                style={{ left: `${x - 10}px`, top: `${SPINE_Y - 9}px` }}
              />
            </div>
          ))}

          {/* ─── Cards (only visible ones for perf) ─── */}
          {visibleCards.map(({ article, x, above, yOffset }) => {
            const color = PERSPECTIVE_COLORS[article.feed.perspective] ?? '#6b7280';
            const isHovered = hoveredId === article.id;
            const hasImg = !!article.imageUrl;
            const cardH = hasImg ? IMG_H + 90 : 100;

            const cardTop = above
              ? SPINE_Y - yOffset - cardH
              : SPINE_Y + yOffset + 20;

            const connectorTop = above ? cardTop + cardH : SPINE_Y + 2;
            const connectorH = above ? SPINE_Y - (cardTop + cardH) : cardTop - SPINE_Y - 2;
            const cardCenter = x + CARD_W / 2;

            return (
              <div key={article.id}>
                {/* Connector */}
                <div
                  className="absolute"
                  style={{
                    left: `${cardCenter}px`,
                    top: `${connectorTop}px`,
                    width: '2px',
                    height: `${Math.max(connectorH, 0)}px`,
                    backgroundColor: color,
                    opacity: isHovered ? 0.8 : 0.3,
                  }}
                />
                {/* Spine dot */}
                <div
                  className="absolute rounded-full"
                  style={{
                    left: `${cardCenter - 5}px`,
                    top: `${SPINE_Y - 5}px`,
                    width: '10px',
                    height: '10px',
                    backgroundColor: color,
                    opacity: isHovered ? 1 : 0.7,
                    boxShadow: isHovered ? `0 0 14px ${color}` : 'none',
                  }}
                />

                {/* Card */}
                <div
                  className="absolute"
                  style={{ left: `${x}px`, top: `${cardTop}px`, width: `${CARD_W}px`, cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredId(article.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setFocusedArticle(article)}
                >
                  <div
                    className={`rounded-lg border overflow-hidden transition-all duration-150
                      ${isHovered
                        ? 'bg-[#1a1a24] border-white/30 shadow-2xl shadow-black/50'
                        : 'bg-[#111118] border-white/15'
                      }`}
                  >
                    {hasImg && (
                      <div className="w-full overflow-hidden bg-[#0a0a0f]" style={{ height: `${IMG_H}px` }}>
                        <img
                          src={proxyImg(article.imageUrl!)}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <div className="px-3 py-2.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className="px-1.5 py-0.5 rounded text-[8px] mono font-bold leading-none"
                          style={{ backgroundColor: `${color}30`, color, border: `1px solid ${color}50` }}
                        >
                          {article.feed.name.length > 14 ? article.feed.id.toUpperCase() : article.feed.name.toUpperCase()}
                        </div>
                        {article.feed.stateFunded && (
                          <span className="text-[8px] mono font-bold text-amber-400 tracking-wider">STATE</span>
                        )}
                        <span className="mono text-[11px] font-bold text-white ml-auto shrink-0">
                          {formatHour(article.time)}
                        </span>
                        <span className="mono text-[9px] text-white/70 shrink-0">
                          {formatTimeAgo(article.time)}
                        </span>
                      </div>
                      <h4 className="text-[12px] text-white font-semibold leading-snug line-clamp-2">
                        {article.title}
                      </h4>
                      {article.snippet && (
                        <p className="text-[10px] text-white/70 mt-1 leading-relaxed line-clamp-2">
                          {article.snippet}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] mono font-bold text-white/60">{article.feed.country}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 - article.feed.tier }).map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                          ))}
                          {Array.from({ length: article.feed.tier - 1 }).map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20" />
                          ))}
                        </div>
                        {isHovered && (
                          <span className="ml-auto text-[8px] mono text-white/40">click to expand</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="absolute" style={{ top: `${SPINE_Y - 20}px`, left: '100px' }}>
              <span className="mono text-[13px] text-white/60">No articles for selected tiers</span>
            </div>
          )}
        </div>

        {/* Bottom-left hint */}
        <div className="absolute bottom-4 left-4 mono text-[10px] text-white/40 pointer-events-none">
          {zoomPct}% · scroll to zoom · drag to pan
        </div>

        {/* ─── Focus panel ─── */}
        {focusedArticle && (() => {
          const a = focusedArticle;
          const color = PERSPECTIVE_COLORS[a.feed.perspective] ?? '#6b7280';
          return (
            <>
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setFocusedArticle(null)}
              />
              {/* Panel — slides in from right */}
              <div
                className="absolute top-0 right-0 bottom-0 w-[420px] bg-[#0e0e16] border-l border-white/10 flex flex-col overflow-hidden"
                style={{ boxShadow: '-20px 0 60px rgba(0,0,0,0.6)' }}
              >
                {/* Panel header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <div
                      className="px-2 py-1 rounded text-[8px] mono font-bold"
                      style={{ backgroundColor: `${color}25`, color, border: `1px solid ${color}40` }}
                    >
                      {a.feed.name.toUpperCase()}
                    </div>
                    {a.feed.stateFunded && (
                      <span className="text-[8px] mono font-bold text-amber-400">STATE FUNDED</span>
                    )}
                  </div>
                  <button
                    onClick={() => setFocusedArticle(null)}
                    className="text-white/40 hover:text-white transition-colors text-[18px] leading-none"
                  >
                    ×
                  </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto">
                  {/* Image */}
                  {a.imageUrl && (
                    <div className="w-full h-[220px] overflow-hidden bg-[#0a0a0f] shrink-0">
                      <img
                        src={proxyImg(a.imageUrl)}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                      />
                    </div>
                  )}

                  <div className="px-5 py-4">
                    {/* Timestamp */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="mono text-[13px] font-bold text-white">
                        {a.time.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="mono text-[13px] font-bold text-white">
                        {formatHour(a.time)}
                      </span>
                      <span className="mono text-[11px] text-white/50">
                        {formatTimeAgo(a.time)}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-[17px] font-bold text-white leading-snug mb-3">
                      {a.title}
                    </h2>

                    {/* Snippet */}
                    {a.snippet && (
                      <p className="text-[13px] text-white/75 leading-relaxed mb-4">
                        {a.snippet}
                      </p>
                    )}

                    {/* Metadata grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { label: 'SOURCE', value: a.feed.name },
                        { label: 'COUNTRY', value: a.feed.country },
                        { label: 'PERSPECTIVE', value: a.feed.perspective.replace('_', ' ') },
                        { label: 'TIER', value: `T${a.feed.tier} — ${TIER_LABELS[a.feed.tier]}` },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-white/[0.04] rounded px-3 py-2 border border-white/[0.06]">
                          <div className="mono text-[8px] text-white/40 tracking-wider mb-0.5">{label}</div>
                          <div className="text-[11px] text-white font-medium">{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Open article button */}
                    <a
                      href={a.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border no-underline transition-colors"
                      style={{
                        backgroundColor: `${color}15`,
                        borderColor: `${color}40`,
                        color,
                      }}
                    >
                      <span className="mono text-[10px] font-bold tracking-wider">OPEN ARTICLE →</span>
                    </a>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
