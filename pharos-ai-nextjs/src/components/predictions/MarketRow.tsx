'use client';
import { useState } from 'react';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PredictionMarket } from '@/app/api/polymarket/route';
import { PriceChart } from './PriceChart';
import { SubMarketTable } from './SubMarketTable';
import { fmtVol, fmtDate, probColor, probBg, spreadColor, statusLabel, getLeadProb, COL } from './utils';

interface Props {
  market: PredictionMarket;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export function MarketRow({ market, rank, isExpanded, onToggle }: Props) {
  const [selectedSubId, setSelectedSubId] = useState(
    market.yesTokenId
      ? market.subMarkets.find(s => s.yesTokenId === market.yesTokenId)?.id ?? market.subMarkets[0]?.id ?? ''
      : '',
  );

  const isGroup      = market.subMarkets.length > 1;
  const prob         = getLeadProb(market);
  const color        = probColor(prob);
  const bg           = probBg(prob);
  const status       = statusLabel(market);
  const isBinary     = market.outcomes.length === 2;
  const chartTokenId = isGroup
    ? (market.subMarkets.find(s => s.id === selectedSubId)?.yesTokenId ?? market.yesTokenId)
    : market.yesTokenId;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      {/* ── Row trigger ── */}
      <CollapsibleTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          style={{
            display: 'grid', gridTemplateColumns: COL, alignItems: 'center', height: 44,
            borderBottom: '1px solid var(--bd)', cursor: 'pointer',
            background: isExpanded ? 'var(--bg-2)' : 'transparent', transition: 'background 0.1s',
          }}
          onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = 'rgba(56,62,71,0.45)'; }}
          onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
        >
          {/* Rank */}
          <div style={{ paddingLeft: 14, fontSize: 10, fontFamily: 'SFMono-Regular, Menlo, monospace', color: 'var(--t4)', fontWeight: 700 }}>
            {rank}
          </div>

          {/* Title + group badge */}
          <div style={{ paddingRight: 20, overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {market.title}
            </div>
            {isGroup && (
              <Badge variant="outline" style={{ flexShrink: 0, fontSize: 8, fontFamily: 'SFMono-Regular, Menlo, monospace', padding: '1px 5px', color: 'var(--blue-l)', borderColor: 'rgba(76,144,240,0.25)', background: 'rgba(76,144,240,0.1)' }}>
                {market.subMarkets.length}
              </Badge>
            )}
          </div>

          {/* Probability bar + value */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 12 }}>
            <Progress
              value={prob * 100}
              style={{ flex: 1, height: 4, borderRadius: 1, background: 'var(--bg-3)' }}
              indicatorStyle={{ background: color, borderRadius: 1 }}
            />
            <div style={{ fontSize: 12, fontFamily: 'SFMono-Regular, Menlo, monospace', fontWeight: 700, color, background: bg, padding: '1px 5px', borderRadius: 2, minWidth: 40, textAlign: 'right' }}>
              {Math.round(prob * 100)}%
            </div>
          </div>

          {/* Volume */}
          <div style={{ fontSize: 11, fontFamily: 'SFMono-Regular, Menlo, monospace', color: 'var(--t2)', textAlign: 'right', paddingRight: 12 }}>
            {fmtVol(market.volume)}
          </div>

          {/* 24h Vol */}
          <div style={{ fontSize: 11, fontFamily: 'SFMono-Regular, Menlo, monospace', color: market.volume24hr > 0 ? '#23A26D' : 'var(--t4)', textAlign: 'right', paddingRight: 12 }}>
            {market.volume24hr > 0 ? fmtVol(market.volume24hr) : '—'}
          </div>

          {/* End date */}
          <div style={{ fontSize: 10, fontFamily: 'SFMono-Regular, Menlo, monospace', color: 'var(--t3)', textAlign: 'right', paddingRight: 12 }}>
            {fmtDate(market.endDate)}
          </div>

          {/* Status badge */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 8 }}>
            <Badge variant="outline" style={{ fontSize: 8, fontFamily: 'SFMono-Regular, Menlo, monospace', padding: '1px 5px', color: status.color, borderColor: status.border, background: status.bg, letterSpacing: '0.06em' }}>
              {status.label}
            </Badge>
          </div>

          {/* Expand chevron */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--t4)' }}>
            <ChevronDown size={12} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </div>
        </div>
      </CollapsibleTrigger>

      {/* ── Expanded detail panel ── */}
      <CollapsibleContent>
        <div style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--bd)', padding: '14px 50px 18px 50px' }}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Chart */}
            <div style={{ flexShrink: 0 }}>
              {isGroup && (
                <div style={{ fontSize: 8, fontFamily: 'SFMono-Regular, Menlo, monospace', color: 'var(--t4)', letterSpacing: '0.08em', marginBottom: 6 }}>
                  CHART: {market.subMarkets.find(s => s.id === selectedSubId)?.groupItemTitle ?? '—'}
                </div>
              )}
              <PriceChart yesTokenId={chartTokenId} />
            </div>

            {/* Description + outcomes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 200 }}>
              {market.description && (
                <p style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.7, maxWidth: 600 }}>{market.description}</p>
              )}
              {!isBinary && market.outcomes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxWidth: 400 }}>
                  <div style={{ fontSize: 8, fontFamily: 'SFMono-Regular, Menlo, monospace', color: 'var(--t4)', letterSpacing: '0.08em' }}>OUTCOMES</div>
                  {market.outcomes.slice(0, 6).map((outcome, i) => {
                    const p = market.prices[i] ?? 0;
                    const c = probColor(p);
                    return (
                      <div key={outcome} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, fontFamily: 'SFMono-Regular, Menlo, monospace', color: 'var(--t2)', width: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {outcome}
                        </span>
                        <Progress value={p * 100} style={{ flex: 1, height: 3, maxWidth: 180, borderRadius: 1, background: 'var(--bg-3)' }} indicatorStyle={{ background: c }} />
                        <span style={{ fontSize: 10, fontFamily: 'SFMono-Regular, Menlo, monospace', fontWeight: 700, color: c, width: 32, textAlign: 'right', flexShrink: 0 }}>
                          {Math.round(p * 100)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order book + stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 160, alignItems: 'flex-end' }}>
              <div style={{ textAlign: 'right', width: '100%' }}>
                <div style={{ fontSize: 8, fontFamily: 'SFMono-Regular, Menlo, monospace', color: 'var(--t4)', letterSpacing: '0.06em', marginBottom: 4 }}>ORDER BOOK</div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', fontFamily: 'SFMono-Regular, Menlo, monospace', fontSize: 11 }}>
                  {[
                    { label: 'BID',    val: market.bestBid   > 0 ? `${Math.round(market.bestBid * 100)}¢` : '—',           color: '#23A26D' },
                    { label: 'ASK',    val: market.bestAsk   > 0 ? `${Math.round(market.bestAsk * 100)}¢` : '—',           color: '#E76A6E' },
                    { label: 'SPREAD', val: market.spread    > 0 ? `${(market.spread * 100).toFixed(1)}¢` : '—',           color: spreadColor(market.spread) },
                  ].map(({ label, val, color: c }) => (
                    <div key={label} style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 7, color: 'var(--t4)', letterSpacing: '0.06em' }}>{label}</div>
                      <div style={{ fontWeight: 700, color: c }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', width: '100%' }}>
                {[
                  { label: 'LIQUIDITY',   val: fmtVol(market.liquidity)   },
                  { label: '24H VOL',     val: fmtVol(market.volume24hr)  },
                  { label: '7D VOL',      val: fmtVol(market.volume1wk)   },
                  { label: '1MO VOL',     val: fmtVol(market.volume1mo)   },
                  ...(market.openInterest > 0 ? [{ label: 'OPEN INT', val: fmtVol(market.openInterest) }] : []),
                  { label: 'COMPETITIVE', val: `${(market.competitive * 100).toFixed(0)}%` },
                ].map(({ label, val }) => (
                  <div key={label} style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 7, fontFamily: 'SFMono-Regular, Menlo, monospace', color: 'var(--t4)', letterSpacing: '0.06em' }}>{label}</div>
                    <div style={{ fontSize: 11, fontFamily: 'SFMono-Regular, Menlo, monospace', fontWeight: 700, color: 'var(--t1)' }}>{val}</div>
                  </div>
                ))}
              </div>

              {market.startDate && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 7, fontFamily: 'SFMono-Regular, Menlo, monospace', color: 'var(--t4)', letterSpacing: '0.06em' }}>OPENED</div>
                  <div style={{ fontSize: 10, fontFamily: 'SFMono-Regular, Menlo, monospace', color: 'var(--t3)' }}>{fmtDate(market.startDate)}</div>
                </div>
              )}

              <Button asChild variant="outline" size="sm" style={{ fontSize: 9, fontFamily: 'SFMono-Regular, Menlo, monospace', letterSpacing: '0.08em', color: 'var(--blue-l)', borderColor: 'rgba(76,144,240,0.3)', background: 'rgba(45,114,210,0.08)', gap: 4 }}>
                <a href={market.polyUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                  <ExternalLink size={10} /> POLYMARKET ↗
                </a>
              </Button>
            </div>
          </div>

          {/* Sub-markets table */}
          {isGroup && (
            <div style={{ marginTop: 16, borderTop: '1px solid var(--bd)', paddingTop: 12 }}>
              <div style={{ fontSize: 8, fontFamily: 'SFMono-Regular, Menlo, monospace', color: 'var(--t4)', letterSpacing: '0.10em', marginBottom: 6 }}>
                {market.subMarkets.length} SUB-MARKETS — CLICK ROW TO VIEW CHART
              </div>
              <SubMarketTable
                subMarkets={market.subMarkets}
                selectedId={selectedSubId}
                onSelect={id => setSelectedSubId(id)}
              />
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
