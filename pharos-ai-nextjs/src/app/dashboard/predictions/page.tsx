'use client';

import { useState, useEffect, useMemo } from 'react';
import { ExternalLink, RefreshCw, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import type { PredictionMarket } from '@/app/api/polymarket/route';

/* ─── helpers ─── */
function fmtVol(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function fmtDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }).toUpperCase();
}

function probColor(p: number): string {
  if (p >= 0.65) return '#23A26D';
  if (p >= 0.50) return '#2D72D2';
  if (p >= 0.35) return '#EC9A3C';
  return '#E76A6E';
}

function probBg(p: number): string {
  if (p >= 0.65) return 'rgba(35,162,109,0.12)';
  if (p >= 0.50) return 'rgba(45,114,210,0.12)';
  if (p >= 0.35) return 'rgba(236,154,60,0.12)';
  return 'rgba(231,106,110,0.12)';
}

function getLeadProb(market: PredictionMarket): number {
  const yesIdx = market.outcomes.findIndex(o => o.toUpperCase() === 'YES');
  return yesIdx >= 0 ? (market.prices[yesIdx] ?? 0) : (market.prices[0] ?? 0);
}

function statusLabel(m: PredictionMarket) {
  if (m.closed)  return { label: 'CLOSED',   color: 'var(--t4)',    bg: 'rgba(92,112,128,0.12)', border: 'rgba(92,112,128,0.25)' };
  if (m.active)  return { label: 'LIVE',     color: '#23A26D',      bg: 'rgba(35,162,109,0.12)', border: 'rgba(35,162,109,0.3)' };
  return           { label: 'RESOLVED', color: 'var(--blue-l)',  bg: 'var(--blue-dim)',       border: 'rgba(76,144,240,0.3)' };
}

/* ─── Row component ─── */
function MarketRow({ market, rank, isExpanded, onToggle }: {
  market: PredictionMarket;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const prob = getLeadProb(market);
  const color = probColor(prob);
  const bg = probBg(prob);
  const status = statusLabel(market);
  const isBinary = market.outcomes.length === 2;

  return (
    <>
      <div
        onClick={onToggle}
        style={{
          display: 'grid',
          gridTemplateColumns: '36px 1fr 110px 96px 72px 80px 72px 32px',
          alignItems: 'center',
          height: 48,
          padding: '0 12px 0 0',
          borderBottom: '1px solid var(--bd)',
          cursor: 'pointer',
          background: isExpanded ? 'var(--bg-2)' : 'transparent',
          transition: 'background 0.1s',
        }}
        onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = 'rgba(56,62,71,0.5)'; }}
        onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
      >
        {/* Rank */}
        <div style={{
          paddingLeft: 12,
          fontSize: 10,
          fontFamily: 'SFMono-Regular, Menlo, monospace',
          color: 'var(--t4)',
          fontWeight: 700,
        }}>
          {rank}
        </div>

        {/* Title */}
        <div style={{
          paddingRight: 24,
          overflow: 'hidden',
        }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--t1)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}>
            {market.title}
          </div>
        </div>

        {/* Probability */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 12 }}>
          <div style={{
            flex: 1,
            height: 4,
            background: 'var(--bg-3)',
            borderRadius: 1,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${prob * 100}%`,
              height: '100%',
              background: color,
              borderRadius: 1,
            }} />
          </div>
          <div style={{
            fontSize: 13,
            fontFamily: 'SFMono-Regular, Menlo, monospace',
            fontWeight: 700,
            color,
            background: bg,
            padding: '1px 5px',
            borderRadius: 2,
            minWidth: 42,
            textAlign: 'right',
          }}>
            {Math.round(prob * 100)}%
          </div>
        </div>

        {/* Volume */}
        <div style={{
          fontSize: 11,
          fontFamily: 'SFMono-Regular, Menlo, monospace',
          color: 'var(--t2)',
          textAlign: 'right',
          paddingRight: 12,
        }}>
          {fmtVol(market.volume)}
        </div>

        {/* 24h vol */}
        <div style={{
          fontSize: 11,
          fontFamily: 'SFMono-Regular, Menlo, monospace',
          color: market.volume24hr > 0 ? '#23A26D' : 'var(--t4)',
          textAlign: 'right',
          paddingRight: 12,
        }}>
          {market.volume24hr > 0 ? fmtVol(market.volume24hr) : '—'}
        </div>

        {/* End date */}
        <div style={{
          fontSize: 10,
          fontFamily: 'SFMono-Regular, Menlo, monospace',
          color: 'var(--t3)',
          textAlign: 'right',
          paddingRight: 12,
        }}>
          {fmtDate(market.endDate)}
        </div>

        {/* Status */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 10 }}>
          <span style={{
            padding: '2px 5px',
            background: status.bg,
            border: `1px solid ${status.border}`,
            borderRadius: 2,
            fontSize: 8,
            fontFamily: 'SFMono-Regular, Menlo, monospace',
            fontWeight: 700,
            color: status.color,
            letterSpacing: '0.06em',
          }}>
            {status.label}
          </span>
        </div>

        {/* Expand chevron */}
        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--t4)' }}>
          {isExpanded
            ? <ChevronUp size={12} />
            : <ChevronDown size={12} />}
        </div>
      </div>

      {/* Expanded detail row */}
      {isExpanded && (
        <div style={{
          background: 'var(--bg-2)',
          borderBottom: '1px solid var(--bd-s)',
          padding: '10px 48px 14px',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 24,
        }}>
          {/* Left: description + outcomes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {market.description && (
              <p style={{
                fontSize: 11,
                color: 'var(--t3)',
                lineHeight: 1.6,
                maxWidth: 720,
              }}>
                {market.description}
              </p>
            )}

            {/* Outcome breakdown */}
            {!isBinary && market.outcomes.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 440 }}>
                <div style={{
                  fontSize: 8,
                  fontFamily: 'SFMono-Regular, Menlo, monospace',
                  color: 'var(--t4)',
                  letterSpacing: '0.08em',
                  marginBottom: 2,
                }}>
                  OUTCOMES
                </div>
                {market.outcomes.slice(0, 6).map((outcome, i) => {
                  const p = market.prices[i] ?? 0;
                  const c = probColor(p);
                  return (
                    <div key={outcome} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 10,
                        fontFamily: 'SFMono-Regular, Menlo, monospace',
                        color: 'var(--t2)',
                        width: 160,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        {outcome}
                      </span>
                      <div style={{
                        flex: 1,
                        height: 3,
                        background: 'var(--bg-3)',
                        borderRadius: 1,
                        overflow: 'hidden',
                        maxWidth: 180,
                      }}>
                        <div style={{ width: `${p * 100}%`, height: '100%', background: c }} />
                      </div>
                      <span style={{
                        fontSize: 10,
                        fontFamily: 'SFMono-Regular, Menlo, monospace',
                        fontWeight: 700,
                        color: c,
                        width: 32,
                        textAlign: 'right',
                        flexShrink: 0,
                      }}>
                        {Math.round(p * 100)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: stats + link */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', minWidth: 140 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'right' }}>
              <div style={{ fontSize: 8, fontFamily: 'SFMono-Regular, Menlo, monospace', color: 'var(--t4)', letterSpacing: '0.06em' }}>LIQUIDITY</div>
              <div style={{ fontSize: 12, fontFamily: 'SFMono-Regular, Menlo, monospace', fontWeight: 700, color: 'var(--t1)' }}>{fmtVol(market.liquidity)}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'right' }}>
              <div style={{ fontSize: 8, fontFamily: 'SFMono-Regular, Menlo, monospace', color: 'var(--t4)', letterSpacing: '0.06em' }}>7D VOLUME</div>
              <div style={{ fontSize: 12, fontFamily: 'SFMono-Regular, Menlo, monospace', fontWeight: 700, color: 'var(--t2)' }}>{fmtVol(market.volume1wk)}</div>
            </div>
            <a
              href={market.polyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                marginTop: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                textDecoration: 'none',
                color: 'var(--blue-l)',
                fontSize: 9,
                fontFamily: 'SFMono-Regular, Menlo, monospace',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '4px 8px',
                border: '1px solid rgba(76,144,240,0.3)',
                borderRadius: 2,
                background: 'rgba(45,114,210,0.08)',
              }}
            >
              <ExternalLink size={10} />
              OPEN ON POLYMARKET
            </a>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Page ─── */
export default function PredictionsPage() {
  const [markets, setMarkets] = useState<PredictionMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'volume' | 'volume24hr' | 'probability'>('volume');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMarkets = async () => {
    setLoading(true);
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/polymarket');
      const data = await res.json() as { markets: PredictionMarket[]; fetchedAt: string; error?: string };
      if (data.error) throw new Error(data.error);
      setMarkets(data.markets);
      setFetchedAt(data.fetchedAt);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchMarkets(); }, []);

  const filtered = useMemo(() => {
    let m = markets;
    if (showActiveOnly) m = m.filter(x => x.active && !x.closed);
    if (sortBy === 'volume')      m = [...m].sort((a, b) => b.volume - a.volume);
    if (sortBy === 'volume24hr')  m = [...m].sort((a, b) => b.volume24hr - a.volume24hr);
    if (sortBy === 'probability') m = [...m].sort((a, b) => getLeadProb(b) - getLeadProb(a));
    return m;
  }, [markets, sortBy, showActiveOnly]);

  const totalVolume   = markets.reduce((s, m) => s + m.volume, 0);
  const totalVol24h   = markets.reduce((s, m) => s + m.volume24hr, 0);
  const activeCount   = markets.filter(m => m.active && !m.closed).length;

  const lastUpdated = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '—';

  const SORT_COLS: { key: 'volume' | 'volume24hr' | 'probability'; label: string }[] = [
    { key: 'volume',      label: 'TOTAL VOL' },
    { key: 'volume24hr',  label: '24H VOL'   },
    { key: 'probability', label: 'PROB'       },
  ];

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-1)',
      overflow: 'hidden',
    }}>

      {/* ── Top bar ── */}
      <div style={{
        height: 44,
        background: 'var(--bg-app)',
        borderBottom: '1px solid var(--bd)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 20,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={14} strokeWidth={2.5} style={{ color: 'var(--blue-l)' }} />
          <span style={{
            fontFamily: 'SFMono-Regular, Menlo, monospace',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--t1)',
            letterSpacing: '0.10em',
          }}>
            PREDICTION MARKETS
          </span>
          <span style={{
            fontFamily: 'SFMono-Regular, Menlo, monospace',
            fontSize: 9,
            color: 'var(--t4)',
            letterSpacing: '0.06em',
          }}>
            VIA POLYMARKET
          </span>
        </div>

        {/* Stats */}
        <div style={{
          height: 20,
          width: 1,
          background: 'var(--bd)',
        }} />

        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 9, fontFamily: 'SFMono-Regular, Menlo, monospace', color: 'var(--t4)' }}>MARKETS </span>
            <span style={{ fontSize: 11, fontFamily: 'SFMono-Regular, Menlo, monospace', fontWeight: 700, color: 'var(--t1)' }}>{markets.length}</span>
            <span style={{ fontSize: 9, fontFamily: 'SFMono-Regular, Menlo, monospace', color: '#23A26D', marginLeft: 6 }}>({activeCount} LIVE)</span>
          </div>
          <div>
            <span style={{ fontSize: 9, fontFamily: 'SFMono-Regular, Menlo, monospace', color: 'var(--t4)' }}>TOTAL VOL </span>
            <span style={{ fontSize: 11, fontFamily: 'SFMono-Regular, Menlo, monospace', fontWeight: 700, color: 'var(--t1)' }}>{fmtVol(totalVolume)}</span>
          </div>
          <div>
            <span style={{ fontSize: 9, fontFamily: 'SFMono-Regular, Menlo, monospace', color: 'var(--t4)' }}>24H VOL </span>
            <span style={{ fontSize: 11, fontFamily: 'SFMono-Regular, Menlo, monospace', fontWeight: 700, color: totalVol24h > 0 ? '#23A26D' : 'var(--t4)' }}>{fmtVol(totalVol24h)}</span>
          </div>
        </div>

        {/* Right controls */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 9, fontFamily: 'SFMono-Regular, Menlo, monospace', color: 'var(--t4)' }}>
            {lastUpdated}
          </span>
          <button
            onClick={fetchMarkets}
            disabled={loading}
            style={{
              background: 'none',
              border: '1px solid var(--bd)',
              borderRadius: 2,
              padding: '4px 6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: 'var(--t3)',
              display: 'flex',
              alignItems: 'center',
              opacity: loading ? 0.5 : 1,
            }}
          >
            <RefreshCw size={12} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {/* ── Column header / toolbar ── */}
      <div style={{
        background: 'var(--bg-app)',
        borderBottom: '1px solid var(--bd)',
        flexShrink: 0,
        display: 'grid',
        gridTemplateColumns: '36px 1fr 110px 96px 72px 80px 72px 32px',
        alignItems: 'center',
        height: 32,
        padding: '0 0',
      }}>
        <div /> {/* rank */}

        {/* title + sort area */}
        <div style={{
          paddingLeft: 0,
          paddingRight: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{ fontSize: 8, fontFamily: 'SFMono-Regular, Menlo, monospace', color: 'var(--t4)', letterSpacing: '0.08em' }}>MARKET</span>
        </div>

        {/* Sort buttons in column headers */}
        {SORT_COLS.map(col => (
          <button
            key={col.key}
            onClick={() => setSortBy(col.key)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 0 0 0',
              paddingRight: col.key === 'probability' ? 24 : 12,
              display: 'flex',
              justifyContent: col.key === 'probability' ? 'flex-start' : 'flex-end',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <span style={{
              fontSize: 8,
              fontFamily: 'SFMono-Regular, Menlo, monospace',
              fontWeight: sortBy === col.key ? 700 : 400,
              color: sortBy === col.key ? 'var(--blue-l)' : 'var(--t4)',
              letterSpacing: '0.08em',
            }}>
              {col.label}
              {sortBy === col.key ? ' ▼' : ''}
            </span>
          </button>
        ))}

        <div style={{
          fontSize: 8,
          fontFamily: 'SFMono-Regular, Menlo, monospace',
          color: 'var(--t4)',
          letterSpacing: '0.08em',
          textAlign: 'right',
          paddingRight: 12,
        }}>
          ENDS
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 10, alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setShowActiveOnly(v => !v)}
            style={{
              padding: '1px 5px',
              background: showActiveOnly ? 'rgba(35,162,109,0.15)' : 'transparent',
              border: `1px solid ${showActiveOnly ? 'rgba(35,162,109,0.4)' : 'var(--bd)'}`,
              borderRadius: 2,
              cursor: 'pointer',
              fontSize: 7,
              fontFamily: 'SFMono-Regular, Menlo, monospace',
              fontWeight: 700,
              color: showActiveOnly ? '#23A26D' : 'var(--t4)',
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
            }}
          >
            LIVE ONLY
          </button>
        </div>

        <div /> {/* chevron col */}
      </div>

      {/* ── Market list ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 10,
          }}>
            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--blue)' }} />
            <span style={{
              fontSize: 10,
              fontFamily: 'SFMono-Regular, Menlo, monospace',
              letterSpacing: '0.1em',
              color: 'var(--t4)',
            }}>
              FETCHING MARKET DATA...
            </span>
          </div>
        ) : error ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 200,
            color: 'var(--danger)',
            fontFamily: 'SFMono-Regular, Menlo, monospace',
            fontSize: 11,
          }}>
            ERROR: {error}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 200,
            color: 'var(--t4)',
            fontFamily: 'SFMono-Regular, Menlo, monospace',
            fontSize: 11,
            letterSpacing: '0.1em',
          }}>
            NO MARKETS FOUND
          </div>
        ) : (
          filtered.map((market, i) => (
            <MarketRow
              key={market.id}
              market={market}
              rank={i + 1}
              isExpanded={expandedId === market.id}
              onToggle={() => setExpandedId(expandedId === market.id ? null : market.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
