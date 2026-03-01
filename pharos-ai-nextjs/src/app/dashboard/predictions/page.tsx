'use client';
import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import type { PredictionMarket } from '@/app/api/polymarket/route';
import { assignGroup, MARKET_GROUPS, UNCATEGORIZED_GROUP } from '@/data/predictionGroups';
import { GroupSection } from '@/components/predictions/GroupSection';
import { fmtVol, getLeadProb, COL } from '@/components/predictions/utils';

const SORT_OPTS = [
  { key: 'volume',      label: 'TOTAL VOL' },
  { key: 'volume24hr',  label: '24H VOL'   },
  { key: 'probability', label: 'PROB'       },
] as const;

type SortBy = typeof SORT_OPTS[number]['key'];

export default function PredictionsPage() {
  const [markets,        setMarkets]        = useState<PredictionMarket[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [sortBy,         setSortBy]         = useState<SortBy>('volume');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [fetchedAt,      setFetchedAt]      = useState('');
  const [isRefreshing,   setIsRefreshing]   = useState(false);
  const [expandedId,     setExpandedId]     = useState<string | null>(null);

  const fetchMarkets = async (isManual = false) => {
    setLoading(true); setIsRefreshing(true); setError(null);
    try {
      const res  = await fetch('/api/polymarket');
      const data = await res.json() as { markets: PredictionMarket[]; fetchedAt: string; error?: string };
      if (data.error) throw new Error(data.error);
      setMarkets(data.markets);
      setFetchedAt(data.fetchedAt);
      if (isManual) toast.success(`${data.markets.length} markets loaded`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      if (isManual) toast.error(`Fetch failed: ${msg}`);
    } finally {
      setLoading(false); setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchMarkets(); }, []);

  const filtered = useMemo(() => {
    let m = markets;
    if (showActiveOnly) m = m.filter(x => x.active && !x.closed);
    return m;
  }, [markets, showActiveOnly]);

  const grouped = useMemo(() => {
    const map = new Map<string, PredictionMarket[]>();
    const allGroups = [...MARKET_GROUPS, UNCATEGORIZED_GROUP];
    for (const g of allGroups) map.set(g.id, []);
    for (const m of filtered) {
      const g = assignGroup(m.title);
      map.get(g.id)!.push(m);
    }
    return map;
  }, [filtered]);

  const rankOffsets = useMemo(() => {
    const offsets: Record<string, number> = {};
    let total = 0;
    for (const g of [...MARKET_GROUPS, UNCATEGORIZED_GROUP]) {
      offsets[g.id] = total;
      total += (grouped.get(g.id)?.length ?? 0);
    }
    return offsets;
  }, [grouped]);

  const totalVolume = markets.reduce((s, m) => s + m.volume, 0);
  const totalVol24h = markets.reduce((s, m) => s + m.volume24hr, 0);
  const activeCount = markets.filter(m => m.active && !m.closed).length;
  const lastUpdated = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '—';

  const mono = 'SFMono-Regular, Menlo, monospace';

  return (
    <div style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-1)', overflow: 'hidden' }}>

      {/* ── Top bar ── */}
      <div style={{ height: 44, background: 'var(--bg-app)', borderBottom: '1px solid var(--bd)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={14} strokeWidth={2.5} style={{ color: 'var(--blue-l)', flexShrink: 0 }} />
          <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: 'var(--t1)', letterSpacing: '0.10em' }}>PREDICTION MARKETS</span>
          <span style={{ fontFamily: mono, fontSize: 9, color: 'var(--t4)', letterSpacing: '0.06em' }}>VIA POLYMARKET</span>
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--bd)', flexShrink: 0 }} />

        {/* Stats */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 9, fontFamily: mono, color: 'var(--t4)' }}>MARKETS </span>
            <span style={{ fontSize: 11, fontFamily: mono, fontWeight: 700, color: 'var(--t1)' }}>{markets.length}</span>
            <span style={{ fontSize: 9, fontFamily: mono, color: '#23A26D', marginLeft: 6 }}>({activeCount} LIVE)</span>
          </div>
          <div>
            <span style={{ fontSize: 9, fontFamily: mono, color: 'var(--t4)' }}>TOTAL VOL </span>
            <span style={{ fontSize: 11, fontFamily: mono, fontWeight: 700, color: 'var(--t1)' }}>{fmtVol(totalVolume)}</span>
          </div>
          <div>
            <span style={{ fontSize: 9, fontFamily: mono, color: 'var(--t4)' }}>24H VOL </span>
            <span style={{ fontSize: 11, fontFamily: mono, fontWeight: 700, color: totalVol24h > 0 ? '#23A26D' : 'var(--t4)' }}>{fmtVol(totalVol24h)}</span>
          </div>
        </div>

        {/* Refresh + timestamp */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 9, fontFamily: mono, color: 'var(--t4)' }}>{lastUpdated}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchMarkets(true)}
            disabled={loading}
            style={{ width: 28, height: 28, borderColor: 'var(--bd)', background: 'transparent', color: 'var(--t3)' }}
          >
            <RefreshCw size={12} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          </Button>
        </div>
      </div>

      {/* ── Column header ── */}
      <div style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--bd)', flexShrink: 0, display: 'grid', gridTemplateColumns: COL, alignItems: 'center', height: 30 }}>
        <div />
        <div style={{ fontSize: 8, fontFamily: mono, color: 'var(--t4)', letterSpacing: '0.08em', paddingLeft: 2 }}>MARKET</div>

        {/* Sort toggle group */}
        <ToggleGroup
          type="single"
          value={sortBy}
          onValueChange={v => v && setSortBy(v as SortBy)}
          style={{ display: 'contents' }}
        >
          {SORT_OPTS.map(col => (
            <ToggleGroupItem
              key={col.key}
              value={col.key}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', height: '100%',
                paddingRight: col.key === 'probability' ? 0 : 12,
                display: 'flex', justifyContent: col.key === 'probability' ? 'flex-start' : 'flex-end',
                alignItems: 'center', borderRadius: 0,
                fontSize: 8, fontFamily: mono, letterSpacing: '0.08em',
                fontWeight: sortBy === col.key ? 700 : 400,
                color: sortBy === col.key ? 'var(--blue-l)' : 'var(--t4)',
              }}
            >
              {col.label}{sortBy === col.key ? ' ▼' : ''}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div style={{ fontSize: 8, fontFamily: mono, color: 'var(--t4)', letterSpacing: '0.08em', textAlign: 'right', paddingRight: 12 }}>ENDS</div>

        {/* Live only toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, paddingRight: 8 }}>
          <span style={{ fontSize: 7, fontFamily: mono, color: showActiveOnly ? '#23A26D' : 'var(--t4)', fontWeight: 700, letterSpacing: '0.06em' }}>LIVE</span>
          <Switch
            checked={showActiveOnly}
            onCheckedChange={setShowActiveOnly}
            style={{ transform: 'scale(0.75)', transformOrigin: 'right' }}
          />
        </div>
        <div />
      </div>

      {/* ── Content area ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          /* Skeleton loading rows */
          <div style={{ padding: '8px 0' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: COL, alignItems: 'center', height: 44, borderBottom: '1px solid var(--bd)', padding: '0 4px', gap: 8 }}>
                <Skeleton style={{ height: 10, width: 20, background: 'var(--bg-3)' }} />
                <Skeleton style={{ height: 12, width: `${60 + (i % 3) * 20}%`, background: 'var(--bg-3)' }} />
                <Skeleton style={{ height: 4, width: '80%', background: 'var(--bg-3)' }} />
                <Skeleton style={{ height: 10, width: 50, background: 'var(--bg-3)', marginLeft: 'auto' }} />
                <Skeleton style={{ height: 10, width: 40, background: 'var(--bg-3)', marginLeft: 'auto' }} />
                <Skeleton style={{ height: 10, width: 50, background: 'var(--bg-3)', marginLeft: 'auto' }} />
                <Skeleton style={{ height: 18, width: 44, background: 'var(--bg-3)', marginLeft: 'auto' }} />
                <div />
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ padding: 24 }}>
            <Alert variant="destructive" style={{ background: 'var(--danger-dim)', borderColor: 'rgba(231,106,110,0.3)', color: 'var(--danger)' }}>
              <AlertCircle size={14} />
              <AlertDescription style={{ fontFamily: mono, fontSize: 11, color: 'var(--danger)' }}>
                {error}
              </AlertDescription>
            </Alert>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--t4)', fontFamily: mono, fontSize: 11, letterSpacing: '0.1em' }}>
            NO MARKETS FOUND
          </div>
        ) : (
          [...MARKET_GROUPS, UNCATEGORIZED_GROUP].map(group => (
            <GroupSection
              key={group.id}
              group={group}
              markets={grouped.get(group.id) ?? []}
              expandedId={expandedId}
              onToggle={id => setExpandedId(expandedId === id ? null : id)}
              globalRankOffset={rankOffsets[group.id] ?? 0}
              sortBy={sortBy}
            />
          ))
        )}
      </div>
    </div>
  );
}
