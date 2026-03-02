'use client';

import { useEffect, useState, useCallback } from 'react';
import type { PredictionMarket } from '@/app/api/polymarket/route';
import type { MarketGroup } from '@/types/domain';
import { getLeadProb, probColor, fmtVol, fmtMarketDate, statusLabel, spreadColor } from './utils';

interface FocusedMarketProps {
  market: PredictionMarket;
  group: MarketGroup;
  onClose: () => void;
}

export function FocusedMarket({ market, group, onClose }: FocusedMarketProps) {
  const [open, setOpen] = useState(false);

  const prob   = getLeadProb(market);
  const pColor = probColor(prob);
  const status = statusLabel(market);

  const daysLeft = market.endDate
    ? Math.max(0, Math.floor((new Date(market.endDate).getTime() - Date.now()) / 86_400_000))
    : null;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setTimeout(onClose, 280);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleClose]);

  // Sort sub-markets by volume desc
  const subs = [...market.subMarkets].sort((a, b) => b.volume - a.volume);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          opacity: open ? 1 : 0,
        }}
        onClick={handleClose}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-[900px] flex flex-col bg-[var(--bg-1)] border border-[var(--bd)] overflow-hidden"
        style={{
          borderRadius: '2px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
          maxHeight: 'calc(100vh - 80px)',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          transition: 'opacity 280ms cubic-bezier(0.22,1,0.36,1), transform 280ms cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Group accent bar */}
        <div className="h-[3px] w-full shrink-0" style={{ backgroundColor: group.color }} />

        {/* Header */}
        <div className="flex items-start gap-4 px-5 py-4 border-b border-[var(--bd)] shrink-0">
          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="mono text-[7px] font-bold px-[5px] py-[2px] tracking-wider"
                style={{ color: group.color, background: group.bg, border: `1px solid ${group.border}` }}
              >
                {group.label}
              </span>
              <span
                className="mono text-[7px] font-bold px-[5px] py-[2px] tracking-wider"
                style={{ color: status.color, background: status.bg, border: `1px solid ${status.border}` }}
              >
                {status.label}
              </span>
            </div>
            <h2 className="text-[15px] font-bold text-[var(--t1)] leading-snug">{market.title}</h2>
            {market.description && (
              <p className="text-[10px] text-[var(--t3)] leading-relaxed mt-2 max-h-[72px] overflow-y-auto pr-2">
                {market.description}
              </p>
            )}
          </div>

          {/* Probability + close */}
          <div className="flex items-start gap-4 shrink-0">
            <div className="text-right">
              <div
                className="mono text-[36px] font-bold leading-none"
                style={{ color: pColor }}
              >
                {(prob * 100).toFixed(1)}%
              </div>
              <div className="mono text-[10px] text-[var(--t4)] mt-0.5">YES probability</div>
              {/* Probability bar */}
              <div className="h-[3px] w-[120px] rounded-full bg-white/6 overflow-hidden mt-2 ml-auto">
                <div className="h-full rounded-full" style={{ width: `${prob * 100}%`, backgroundColor: pColor }} />
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded text-[var(--t4)] hover:text-[var(--t1)] hover:bg-white/10 transition-colors mono text-[14px] mt-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-0 px-5 py-2.5 border-b border-[var(--bd)] bg-[var(--bg-2)] shrink-0 overflow-x-auto">
          {[
            { label: 'TOTAL VOL',   value: fmtVol(market.volume)     },
            { label: '24H VOL',     value: fmtVol(market.volume24hr), color: market.volume24hr > 0 ? 'var(--success)' : undefined },
            { label: '1WK VOL',     value: fmtVol(market.volume1wk)  },
            { label: 'LIQUIDITY',   value: fmtVol(market.liquidity)  },
            { label: 'OPEN INT',    value: fmtVol(market.openInterest) },
            { label: 'SPREAD',      value: `${(market.spread * 100).toFixed(1)}¢`, color: spreadColor(market.spread) },
            { label: 'ENDS',        value: daysLeft !== null ? (daysLeft === 0 ? 'TODAY' : `${daysLeft}d`) : fmtMarketDate(market.endDate) },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-3 pr-4 mr-4 border-r border-[var(--bd)] last:border-r-0">
              <span className="mono text-[7px] text-[var(--t4)] tracking-widest shrink-0">{s.label}</span>
              <span className="mono text-[11px] font-bold shrink-0" style={{ color: s.color ?? 'var(--t1)' }}>{s.value}</span>
            </div>
          ))}
          <a
            href={market.polyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto mono text-[8px] font-bold px-2 py-1 border border-[var(--bd)] text-[var(--t4)] hover:text-[var(--t1)] hover:border-white/20 transition-colors shrink-0 no-underline"
          >
            ↗ POLYMARKET
          </a>
        </div>

        {/* Sub-markets table */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {subs.length > 1 ? (
            <>
              <div className="flex items-center px-5 py-2 bg-[var(--bg-2)] border-b border-[var(--bd)] shrink-0">
                <span className="mono text-[8px] text-[var(--t4)] tracking-widest">
                  SUB-MARKETS ({subs.length})
                </span>
              </div>
              <div>
                {subs.map((sub, i) => {
                  const subProb  = sub.lastTradePrice > 0 ? sub.lastTradePrice : (sub.prices[0] ?? 0);
                  const subColor = probColor(subProb);
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center gap-4 px-5 py-3 border-b border-[var(--bd)] hover:bg-[var(--bg-2)] transition-colors"
                    >
                      <span className="mono text-[9px] text-[var(--t4)] w-5 shrink-0">{i + 1}</span>

                      {/* Title */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-[var(--t1)] leading-snug line-clamp-1">
                          {sub.groupItemTitle || sub.question}
                        </p>
                        <p className="text-[9px] text-[var(--t4)] mt-0.5 line-clamp-1">{sub.question}</p>
                      </div>

                      {/* Probability mini bar */}
                      <div className="flex items-center gap-2 shrink-0 w-[140px]">
                        <div className="flex-1 h-[3px] rounded-full bg-white/6 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${subProb * 100}%`, backgroundColor: subColor }} />
                        </div>
                        <span className="mono text-[11px] font-bold w-[40px] text-right" style={{ color: subColor }}>
                          {(subProb * 100).toFixed(0)}%
                        </span>
                      </div>

                      {/* Vol */}
                      <span className="mono text-[10px] text-[var(--t3)] w-[60px] text-right shrink-0">
                        {fmtVol(sub.volume)}
                      </span>

                      {/* Spread */}
                      <span
                        className="mono text-[10px] font-bold w-[36px] text-right shrink-0"
                        style={{ color: spreadColor(sub.spread) }}
                      >
                        {(sub.spread * 100).toFixed(0)}¢
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-8">
              <span className="mono text-[10px] text-[var(--t4)]">SINGLE MARKET — NO SUB-MARKETS</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-2 border-t border-[var(--bd)] bg-[var(--bg-2)] shrink-0">
          <span className="mono text-[8px] text-[var(--t4)]">
            {subs.length} sub-market{subs.length !== 1 ? 's' : ''} · via Polymarket · ESC to close
          </span>
          <span className="mono text-[8px] text-[var(--t4)]">
            Started {fmtMarketDate(market.startDate)}
          </span>
        </div>
      </div>
    </div>
  );
}
