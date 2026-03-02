'use client';

import type { PredictionMarket } from '@/app/api/polymarket/route';
import type { MarketGroup } from '@/types/domain';
import { getLeadProb, probColor, fmtVol, fmtMarketDate, statusLabel } from './utils';

interface MarketCardProps {
  market: PredictionMarket;
  group: MarketGroup;
  rank: number;
  onFocus: () => void;
}

export function MarketCard({ market, group, rank, onFocus }: MarketCardProps) {
  const prob   = getLeadProb(market);
  const pColor = probColor(prob);
  const status = statusLabel(market);
  const pctStr = `${(prob * 100).toFixed(1)}%`;

  const daysLeft = market.endDate
    ? Math.max(0, Math.floor((new Date(market.endDate).getTime() - Date.now()) / 86_400_000))
    : null;

  return (
    <div
      onClick={onFocus}
      className="group flex flex-col overflow-hidden bg-[var(--bg-1)] border border-[var(--bd)] hover:border-white/20 hover:bg-[var(--bg-2)] transition-all duration-150 cursor-pointer"
    >
      {/* Coloured top accent */}
      <div className="h-[2px] w-full shrink-0" style={{ backgroundColor: group.color }} />

      {/* Header row */}
      <div className="flex items-start gap-2 px-3 pt-2.5 pb-0">
        {/* Rank */}
        <span className="mono text-[9px] text-[var(--t4)] shrink-0 mt-[1px]">#{rank}</span>

        <div className="flex-1 min-w-0">
          {/* Group + status badges */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <span
              className="mono text-[7px] font-bold px-[5px] py-[1.5px] tracking-wider shrink-0"
              style={{ color: group.color, background: group.bg, border: `1px solid ${group.border}` }}
            >
              {group.label}
            </span>
            <span
              className="mono text-[7px] font-bold px-[5px] py-[1.5px] tracking-wider shrink-0"
              style={{ color: status.color, background: status.bg, border: `1px solid ${status.border}` }}
            >
              {status.label}
            </span>
            {market.competitive > 0.7 && (
              <span className="mono text-[7px] font-bold px-[5px] py-[1.5px] tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/25">
                HOT
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-[11px] font-medium text-[var(--t1)] leading-snug line-clamp-2 group-hover:text-white transition-colors">
            {market.title}
          </h3>
        </div>
      </div>

      {/* Probability display */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-end justify-between mb-1.5">
          <span
            className="mono text-[28px] font-bold leading-none"
            style={{ color: pColor }}
          >
            {pctStr}
          </span>
          <div className="text-right">
            <div className="mono text-[9px] text-[var(--t4)]">YES</div>
            <div className="mono text-[9px] text-[var(--t4)]">{(( 1 - prob) * 100).toFixed(1)}% NO</div>
          </div>
        </div>

        {/* Probability bar */}
        <div className="h-[4px] w-full rounded-full bg-white/6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${prob * 100}%`, backgroundColor: pColor }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-0 px-3 py-2 border-t border-[var(--bd)] mt-auto">
        <div className="flex-1">
          <div className="mono text-[7px] text-[var(--t4)] tracking-widest">VOL</div>
          <div className="mono text-[10px] font-bold text-[var(--t2)]">{fmtVol(market.volume)}</div>
        </div>
        <div className="w-px h-6 bg-[var(--bd)] mx-2" />
        <div className="flex-1">
          <div className="mono text-[7px] text-[var(--t4)] tracking-widest">24H</div>
          <div className="mono text-[10px] font-bold" style={{ color: market.volume24hr > 0 ? 'var(--success)' : 'var(--t4)' }}>
            {fmtVol(market.volume24hr)}
          </div>
        </div>
        <div className="w-px h-6 bg-[var(--bd)] mx-2" />
        <div className="flex-1">
          <div className="mono text-[7px] text-[var(--t4)] tracking-widest">SPREAD</div>
          <div
            className="mono text-[10px] font-bold"
            style={{ color: market.spread < 0.02 ? 'var(--success)' : market.spread < 0.07 ? 'var(--warning)' : 'var(--danger)' }}
          >
            {(market.spread * 100).toFixed(1)}¢
          </div>
        </div>
        <div className="w-px h-6 bg-[var(--bd)] mx-2" />
        <div className="flex-1 text-right">
          <div className="mono text-[7px] text-[var(--t4)] tracking-widest">ENDS</div>
          <div className="mono text-[10px] font-bold text-[var(--t2)]">
            {daysLeft !== null ? (daysLeft === 0 ? 'TODAY' : `${daysLeft}d`) : fmtMarketDate(market.endDate)}
          </div>
        </div>
      </div>

      {/* Expand hint */}
      <div className="h-[20px] flex items-center justify-center border-t border-[var(--bd)] opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="mono text-[7px] text-[var(--t4)] tracking-widest">⊞ EXPAND</span>
      </div>
    </div>
  );
}
