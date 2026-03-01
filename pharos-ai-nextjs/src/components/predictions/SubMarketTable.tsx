'use client';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { SubMarket, PredictionMarket } from '@/app/api/polymarket/route';
import { probColor, spreadColor, statusLabel } from './utils';

interface Props {
  subMarkets: SubMarket[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function SubMarketTable({ subMarkets, selectedId, onSelect }: Props) {
  const sorted = [...subMarkets].sort((a, b) => {
    if (a.closed !== b.closed) return a.closed ? 1 : -1;
    return (a.groupItemTitle || a.question).localeCompare(b.groupItemTitle || b.question);
  });

  const mono = 'SFMono-Regular, Menlo, monospace' as const;

  return (
    <Table style={{ width: '100%', marginTop: 4 }}>
      <TableHeader>
        <TableRow style={{ borderBottom: '1px solid var(--bd)', background: 'transparent' }}>
          {['DATE / QUESTION', 'LAST', 'BID', 'ASK', 'SPREAD', '24H VOL', 'STATUS'].map(h => (
            <TableHead
              key={h}
              style={{
                height: 24, fontSize: 7, fontFamily: mono, color: 'var(--t4)',
                letterSpacing: '0.08em', padding: '0 8px 0 4px',
                textAlign: h === 'DATE / QUESTION' ? 'left' : 'right',
              }}
            >
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {sorted.map(sm => {
          const isSelected = sm.id === selectedId;
          const ltpC = probColor(sm.lastTradePrice);
          const sc   = spreadColor(sm.spread);
          const st   = statusLabel(sm as unknown as PredictionMarket);
          const label = sm.groupItemTitle || sm.question.replace(/^Will /i, '').slice(0, 30);

          return (
            <TableRow
              key={sm.id}
              onClick={() => onSelect(sm.id)}
              style={{
                height: 30, borderBottom: '1px solid var(--bd)', cursor: 'pointer',
                background: isSelected ? 'rgba(45,114,210,0.1)' : 'transparent',
                borderLeft: isSelected ? '2px solid var(--blue)' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(56,62,71,0.4)'; }}
              onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
            >
              {/* Question */}
              <TableCell style={{ fontSize: 10, fontFamily: mono, color: isSelected ? 'var(--blue-l)' : 'var(--t1)', fontWeight: isSelected ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140, padding: '0 8px 0 4px' }}>
                {label}
              </TableCell>
              {/* Last price */}
              <TableCell style={{ fontSize: 11, fontFamily: mono, fontWeight: 700, color: ltpC, textAlign: 'right', padding: '0 8px' }}>
                {Math.round(sm.lastTradePrice * 100)}%
              </TableCell>
              {/* Bid */}
              <TableCell style={{ fontSize: 10, fontFamily: mono, color: 'var(--t3)', textAlign: 'right', padding: '0 8px' }}>
                {sm.bestBid > 0 ? Math.round(sm.bestBid * 100) : '—'}
              </TableCell>
              {/* Ask */}
              <TableCell style={{ fontSize: 10, fontFamily: mono, color: 'var(--t3)', textAlign: 'right', padding: '0 8px' }}>
                {sm.bestAsk > 0 ? Math.round(sm.bestAsk * 100) : '—'}
              </TableCell>
              {/* Spread */}
              <TableCell style={{ fontSize: 10, fontFamily: mono, color: sc, textAlign: 'right', padding: '0 8px' }}>
                {sm.spread > 0 ? (sm.spread * 100).toFixed(1) : '—'}
              </TableCell>
              {/* 24h Vol */}
              <TableCell style={{ fontSize: 10, fontFamily: mono, color: sm.volume24hr > 0 ? '#23A26D' : 'var(--t4)', textAlign: 'right', padding: '0 8px' }}>
                {sm.volume24hr > 0 ? `$${(sm.volume24hr / 1000).toFixed(0)}K` : '—'}
              </TableCell>
              {/* Status */}
              <TableCell style={{ textAlign: 'right', padding: '0 4px' }}>
                <Badge
                  variant="outline"
                  style={{
                    fontSize: 7, fontFamily: mono, padding: '1px 4px', letterSpacing: '0.06em',
                    color: st.color, borderColor: st.border, background: st.bg,
                  }}
                >
                  {st.label}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
