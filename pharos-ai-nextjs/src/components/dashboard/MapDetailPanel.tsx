'use client';

import {
  STRIKE_ARCS,
  TARGETS,
  type StrikeArc,
  type MissileTrack,
  type Target,
  type Asset,
  type ThreatZone,
} from '@/data/mapData';
import { MAP_STORIES, type MapStory } from '@/data/mapStories';
import StoryIcon from './StoryIcon';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SelectedItem =
  | { type: 'strike'; data: StrikeArc }
  | { type: 'missile'; data: MissileTrack }
  | { type: 'target'; data: Target }
  | { type: 'asset'; data: Asset }
  | { type: 'zone'; data: ThreatZone };

// ─── Cross-link helpers ───────────────────────────────────────────────────────

function getStrikesForTarget(target: Target): StrikeArc[] {
  return STRIKE_ARCS.filter(
    s =>
      Math.abs(s.to[0] - target.position[0]) < 0.05 &&
      Math.abs(s.to[1] - target.position[1]) < 0.05,
  );
}

function getTargetForStrike(strike: StrikeArc): Target | null {
  return (
    TARGETS.find(
      t =>
        Math.abs(t.position[0] - strike.to[0]) < 0.05 &&
        Math.abs(t.position[1] - strike.to[1]) < 0.05,
    ) ?? null
  );
}

function storiesFor(ids: string[], field: keyof MapStory): MapStory[] {
  return MAP_STORIES.filter(s => (s[field] as string[]).some(id => ids.includes(id)));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
      <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#5C7080', letterSpacing: '0.08em' }}>
        {label}
      </span>
      <span style={{ fontSize: 11, fontFamily: 'monospace', color: color ?? '#C0C8D4', fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      style={{
        fontSize: 8,
        fontFamily: 'monospace',
        fontWeight: 700,
        padding: '2px 6px',
        borderRadius: 2,
        color,
        background: bg,
        border: `1px solid ${color}44`,
        letterSpacing: '0.07em',
      }}
    >
      {label}
    </span>
  );
}

function Divider() {
  return <div style={{ height: 1, background: '#2A2F38', margin: '12px 0' }} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 8,
        fontFamily: 'monospace',
        fontWeight: 700,
        color: '#5C7080',
        letterSpacing: '0.12em',
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function RelatedStories({
  stories,
  onActivate,
}: {
  stories: MapStory[];
  onActivate: (story: MapStory) => void;
}) {
  if (!stories.length) return null;
  const CATEGORY_COLOR: Record<MapStory['category'], string> = {
    STRIKE: '#E84C4C',
    RETALIATION: '#E84C4C',
    NAVAL: '#4C9BE8',
    INTEL: '#B84CE8',
    DIPLOMATIC: '#4CE8A8',
  };
  return (
    <>
      <Divider />
      <SectionLabel>RELATED STORIES</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {stories.map(story => (
          <button
            key={story.id}
            onClick={() => onActivate(story)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#252A31',
              border: '1px solid #2A2F38',
              borderRadius: 2,
              padding: '6px 8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#404854')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = '#2A2F38')}
          >
            <StoryIcon iconName={story.iconName} category={story.category} size={12} boxSize={22} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  color: '#C0C8D4',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {story.title}
              </div>
              <div style={{ fontSize: 9, color: CATEGORY_COLOR[story.category], fontFamily: 'monospace', marginTop: 1 }}>
                {story.category}
              </div>
            </div>
            <span style={{ color: '#5C7080', fontSize: 10 }}>›</span>
          </button>
        ))}
      </div>
    </>
  );
}

// ─── Content renderers ────────────────────────────────────────────────────────

function StrikeContent({
  d,
  onSelectItem,
  onActivateStory,
}: {
  d: StrikeArc;
  onSelectItem: (item: SelectedItem) => void;
  onActivateStory: (story: MapStory) => void;
}) {
  const typeLabel = d.type === 'NAVAL' ? 'NAVAL STRIKE' : d.type === 'ISRAEL_STRIKE' ? 'IDF STRIKE' : 'US STRIKE';
  const typeColor = d.type === 'NAVAL' ? '#32C8C8' : d.type === 'ISRAEL_STRIKE' ? '#32C878' : '#4C9BE8';
  const sevColor = d.severity === 'CRITICAL' ? '#E84C4C' : '#E8A84C';
  const relatedTarget = getTargetForStrike(d);
  const relatedStories = storiesFor([d.id], 'highlightStrikeIds');

  return (
    <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        <Badge label={typeLabel} color={typeColor} bg={typeColor + '18'} />
        <Badge label={d.severity} color={sevColor} bg={sevColor + '18'} />
      </div>

      <Row label="ORIGIN" value={`[${d.from[1].toFixed(2)}°N, ${d.from[0].toFixed(2)}°E]`} />
      <Row label="TARGET COORDS" value={`[${d.to[1].toFixed(2)}°N, ${d.to[0].toFixed(2)}°E]`} />

      {relatedTarget && (
        <>
          <Divider />
          <SectionLabel>TARGET HIT</SectionLabel>
          <button
            onClick={() => onSelectItem({ type: 'target', data: relatedTarget })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              background: '#252A31',
              border: '1px solid #2A2F38',
              borderRadius: 2,
              padding: '8px 10px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#404854')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = '#2A2F38')}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background:
                  relatedTarget.status === 'DESTROYED'
                    ? '#E84C4C'
                    : relatedTarget.status === 'DAMAGED'
                    ? '#E8A84C'
                    : '#E8E84C',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: '#C0C8D4', fontWeight: 600 }}>{relatedTarget.name}</div>
              <div style={{ fontSize: 9, color: '#5C7080', fontFamily: 'monospace', marginTop: 1 }}>
                {relatedTarget.type} · {relatedTarget.status}
              </div>
            </div>
            <span style={{ color: '#5C7080', fontSize: 10 }}>›</span>
          </button>
        </>
      )}

      <RelatedStories stories={relatedStories} onActivate={onActivateStory} />
    </>
  );
}

function MissileContent({
  d,
  onActivateStory,
}: {
  d: MissileTrack;
  onActivateStory: (story: MapStory) => void;
}) {
  const relatedStories = storiesFor([d.id], 'highlightMissileIds');

  return (
    <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        <Badge
          label={d.intercepted ? '✓ INTERCEPTED' : '⚠ IMPACT CONFIRMED'}
          color={d.intercepted ? '#FFC800' : '#E84C4C'}
          bg={d.intercepted ? '#FFC80018' : '#E84C4C18'}
        />
        <Badge
          label={d.severity}
          color={d.severity === 'CRITICAL' ? '#E84C4C' : '#E8A84C'}
          bg={d.severity === 'CRITICAL' ? '#E84C4C18' : '#E8A84C18'}
        />
      </div>

      <Row label="LAUNCH POINT" value={`[${d.from[1].toFixed(2)}°N, ${d.from[0].toFixed(2)}°E]`} />
      <Row label="IMPACT POINT" value={`[${d.to[1].toFixed(2)}°N, ${d.to[0].toFixed(2)}°E]`} />
      <Row label="TYPE" value="IRGC BALLISTIC MISSILE" color="#E84C4C" />

      {d.intercepted ? (
        <>
          <Divider />
          <div
            style={{
              background: '#FFC80012',
              border: '1px solid #FFC80033',
              borderRadius: 2,
              padding: '8px 10px',
            }}
          >
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#FFC800', fontWeight: 700, marginBottom: 4 }}>
              INTERCEPTED
            </div>
            <div style={{ fontSize: 11, color: '#C0C8D4', lineHeight: 1.5 }}>
              Missile neutralized in-flight. No ground impact recorded.
            </div>
          </div>
        </>
      ) : (
        <>
          <Divider />
          <div
            style={{
              background: '#E84C4C12',
              border: '1px solid #E84C4C33',
              borderRadius: 2,
              padding: '8px 10px',
            }}
          >
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#E84C4C', fontWeight: 700, marginBottom: 4 }}>
              IMPACT CONFIRMED
            </div>
            <div style={{ fontSize: 11, color: '#C0C8D4', lineHeight: 1.5 }}>
              Missile reached target. Damage assessment ongoing.
            </div>
          </div>
        </>
      )}

      <RelatedStories stories={relatedStories} onActivate={onActivateStory} />
    </>
  );
}

function TargetContent({
  d,
  onSelectItem,
  onActivateStory,
}: {
  d: Target;
  onSelectItem: (item: SelectedItem) => void;
  onActivateStory: (story: MapStory) => void;
}) {
  const statusColor =
    d.status === 'DESTROYED' ? '#E84C4C' : d.status === 'DAMAGED' ? '#E8A84C' : '#E8E84C';
  const typeColor =
    d.type === 'NUCLEAR'
      ? '#B84CE8'
      : d.type === 'MILITARY'
      ? '#E84C4C'
      : d.type === 'NAVAL'
      ? '#4C9BE8'
      : '#8F99A8';

  const incomingStrikes = getStrikesForTarget(d);
  const relatedStories = storiesFor([d.id], 'highlightTargetIds');

  return (
    <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        <Badge label={d.type} color={typeColor} bg={typeColor + '18'} />
        <Badge label={d.status} color={statusColor} bg={statusColor + '18'} />
      </div>

      <p style={{ fontSize: 12, color: '#C0C8D4', lineHeight: 1.6, marginBottom: 12 }}>{d.description}</p>

      <Row
        label="COORDINATES"
        value={`${d.position[1].toFixed(4)}°N, ${d.position[0].toFixed(4)}°E`}
      />

      {incomingStrikes.length > 0 && (
        <>
          <Divider />
          <SectionLabel>INCOMING STRIKES ({incomingStrikes.length})</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {incomingStrikes.map(strike => {
              const sc =
                strike.type === 'NAVAL'
                  ? '#32C8C8'
                  : strike.type === 'ISRAEL_STRIKE'
                  ? '#32C878'
                  : '#4C9BE8';
              return (
                <button
                  key={strike.id}
                  onClick={() => onSelectItem({ type: 'strike', data: strike })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#252A31',
                    border: '1px solid #2A2F38',
                    borderRadius: 2,
                    padding: '6px 8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#404854')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = '#2A2F38')}
                >
                  <div style={{ width: 10, height: 3, background: sc, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: '#C0C8D4',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {strike.label}
                    </div>
                    <div style={{ fontSize: 9, color: sc, fontFamily: 'monospace', marginTop: 1 }}>
                      {strike.type === 'NAVAL' ? 'NAVAL' : strike.type === 'ISRAEL_STRIKE' ? 'IDF' : 'US'} ·{' '}
                      {strike.severity}
                    </div>
                  </div>
                  <span style={{ color: '#5C7080', fontSize: 10 }}>›</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <RelatedStories stories={relatedStories} onActivate={onActivateStory} />
    </>
  );
}

function AssetContent({
  d,
  onActivateStory,
}: {
  d: Asset;
  onActivateStory: (story: MapStory) => void;
}) {
  const nationColor = d.nation === 'US' ? '#4C9BE8' : '#32C8C8';
  const relatedStories = storiesFor([d.id], 'highlightAssetIds');

  return (
    <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        <Badge label={d.nation} color={nationColor} bg={nationColor + '18'} />
        <Badge label={d.type.replace('_', ' ')} color="#8F99A8" bg="#2A2F38" />
        {d.type === 'CARRIER' && (
          <Badge label="CARRIER STRIKE GROUP" color="#E8E84C" bg="#E8E84C18" />
        )}
      </div>

      {d.description && (
        <p style={{ fontSize: 12, color: '#C0C8D4', lineHeight: 1.6, marginBottom: 12 }}>
          {d.description}
        </p>
      )}

      <Row
        label="COORDINATES"
        value={`${d.position[1].toFixed(2)}°N, ${d.position[0].toFixed(2)}°E`}
      />
      <Row label="NATION" value={d.nation === 'US' ? 'United States' : 'Israel'} color={nationColor} />

      <RelatedStories stories={relatedStories} onActivate={onActivateStory} />
    </>
  );
}

function ZoneContent({ d }: { d: ThreatZone }) {
  const ZONE_META: Record<
    ThreatZone['type'],
    { color: string; label: string; description: string }
  > = {
    CLOSURE: {
      color: '#E84C4C',
      label: 'MARITIME CLOSURE',
      description:
        'Area declared closed to commercial and military shipping. Transit requires explicit authorization. Vessels risk interdiction or engagement.',
    },
    PATROL: {
      color: '#E8A84C',
      label: 'ACTIVE PATROL ZONE',
      description:
        'IRGC Navy operating in this area with fast attack craft. Unidentified vessels subject to challenge and boarding.',
    },
    NFZ: {
      color: '#E8E84C',
      label: 'NO-FLY ZONE',
      description:
        'Iranian-declared no-fly zone. Uncleared aircraft risk engagement by air defense systems and interceptors.',
    },
    THREAT: {
      color: '#E84C4C',
      label: 'THREAT CORRIDOR',
      description:
        'Active hostile operations reported in this corridor. Houthi and proxy forces operating with anti-ship and anti-air capability.',
    },
  };

  const meta = ZONE_META[d.type];

  return (
    <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <Badge label={meta.label} color={meta.color} bg={meta.color + '18'} />
      </div>

      <div
        style={{
          background: meta.color + '0A',
          border: `1px solid ${meta.color}33`,
          borderRadius: 2,
          padding: '10px 12px',
          marginBottom: 12,
        }}
      >
        <p style={{ fontSize: 12, color: '#C0C8D4', lineHeight: 1.6, margin: 0 }}>{meta.description}</p>
      </div>

      <Row label="ZONE TYPE" value={d.type} color={meta.color} />
      <Row label="VERTICES" value={`${d.coordinates.length} points`} />
    </>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface MapDetailPanelProps {
  item: SelectedItem | null;
  onClose: () => void;
  onSelectItem: (item: SelectedItem) => void;
  onActivateStory: (story: MapStory) => void;
}

const PANEL_TITLES: Record<SelectedItem['type'], string> = {
  strike: 'STRIKE TRACK',
  missile: 'MISSILE TRACK',
  target: 'TARGET SITE',
  asset: 'ALLIED ASSET',
  zone: 'THREAT ZONE',
};

const PANEL_ACCENT: Record<SelectedItem['type'], string> = {
  strike: '#2D72D2',
  missile: '#E84C4C',
  target: '#E8A84C',
  asset: '#4C9BE8',
  zone: '#E8E84C',
};

function getItemTitle(item: SelectedItem): string {
  switch (item.type) {
    case 'strike':
      return item.data.label;
    case 'missile':
      return item.data.label;
    case 'target':
      return item.data.name;
    case 'asset':
      return item.data.name;
    case 'zone':
      return item.data.name;
  }
}

export default function MapDetailPanel({
  item,
  onClose,
  onSelectItem,
  onActivateStory,
}: MapDetailPanelProps) {
  const isOpen = item !== null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 320,
        background: '#1C2127',
        borderLeft: '1px solid #404854',
        display: 'flex',
        flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 20,
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
    >
      {item && (
        <>
          {/* Header */}
          <div
            style={{
              height: 44,
              borderBottom: `1px solid #404854`,
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              gap: 8,
              flexShrink: 0,
              borderTop: `2px solid ${PANEL_ACCENT[item.type]}`,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 8,
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: PANEL_ACCENT[item.type],
                  letterSpacing: '0.12em',
                  marginBottom: 2,
                }}
              >
                {PANEL_TITLES[item.type]}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#E8E8E8',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontFamily: 'monospace',
                }}
              >
                {getItemTitle(item)}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#5C7080',
                cursor: 'pointer',
                fontSize: 16,
                lineHeight: 1,
                padding: '4px',
                flexShrink: 0,
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#C0C8D4')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#5C7080')}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
            {item.type === 'strike' && (
              <StrikeContent
                d={item.data}
                onSelectItem={onSelectItem}
                onActivateStory={onActivateStory}
              />
            )}
            {item.type === 'missile' && (
              <MissileContent d={item.data} onActivateStory={onActivateStory} />
            )}
            {item.type === 'target' && (
              <TargetContent
                d={item.data}
                onSelectItem={onSelectItem}
                onActivateStory={onActivateStory}
              />
            )}
            {item.type === 'asset' && (
              <AssetContent d={item.data} onActivateStory={onActivateStory} />
            )}
            {item.type === 'zone' && <ZoneContent d={item.data} />}
          </div>

          {/* Footer */}
          <div
            style={{
              height: 36,
              borderTop: '1px solid #2A2F38',
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#5C7080' }}>
              PHAROS INTEL · UNCLASSIFIED
            </span>
          </div>
        </>
      )}
    </div>
  );
}
