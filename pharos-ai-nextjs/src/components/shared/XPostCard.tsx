'use client';
import { AlertTriangle, CheckCircle, ExternalLink, Eye, Heart, Repeat2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type XPost, fmt } from '@/data/iranXPosts';

/* ── Account type colours ── */
const ACCT_C: Record<string, { bg: string; text: string; label: string }> = {
  military:   { bg: 'rgba(231,106,110,.15)', text: '#E76A6E', label: 'MILITARY'   },
  government: { bg: 'rgba(35,162,109,.15)',  text: '#23A26D', label: 'GOVT'       },
  official:   { bg: 'rgba(45,114,210,.15)',  text: '#4C90F0', label: 'OFFICIAL'   },
  journalist: { bg: 'rgba(162,139,224,.15)', text: '#A28BE0', label: 'PRESS'      },
  analyst:    { bg: 'rgba(76,144,240,.15)',  text: '#4C90F0', label: 'ANALYST'    },
};

/* ── Significance left-border colours ── */
const SIG_BORDER: Record<string, string> = {
  BREAKING: '#E76A6E',
  HIGH:     '#EC9A3C',
  STANDARD: '#383E47',
};

/* ── Image labels / bg colours ── */
const IMG_BG: Record<string, string> = {
  'strike-aerial-1':           '#0e1a0e',
  'osint-thermal-1':           '#1a0e0e',
  'osint-map-1':               '#0e0e1a',
  'iran-missile-1':            '#1a0e0e',
  'ukraine-column-geo-1':      '#0e140e',
  'ukraine-column-geo-2':      '#0e1410',
  'taiwan-radar-track-1':      '#0e0e1a',
  'uss-reagan-philippine-sea': '#06101a',
};
const IMG_LBL: Record<string, string> = {
  'strike-aerial-1':           'AERIAL · N.GAZA',
  'osint-thermal-1':           'THERMAL · STRIKE SIG.',
  'osint-map-1':               'GEOLOC · MAP OVERLAY',
  'iran-missile-1':            'STATE MEDIA · IRGC LAUNCH',
  'ukraine-column-geo-1':      'SAT · ARMOR COLUMN',
  'ukraine-column-geo-2':      'SAT · VEHICLE ID',
  'taiwan-radar-track-1':      'ADIZ · PLAAF TRACK',
  'uss-reagan-philippine-sea': 'USN · PHILIPPINE SEA',
};

function ago(ts: string) {
  const ms = Date.now() - new Date(ts).getTime();
  if (ms < 3600000)  return `${Math.round(ms / 60000)}m`;
  if (ms < 86400000) return `${Math.round(ms / 3600000)}h`;
  return `${Math.round(ms / 86400000)}d`;
}

interface Props { post: XPost; compact?: boolean }

export default function XPostCard({ post, compact }: Props) {
  const isBreaking = post.significance === 'BREAKING';
  const isHigh     = post.significance === 'HIGH';
  const acct       = ACCT_C[post.accountType] ?? ACCT_C.analyst;
  const border     = SIG_BORDER[post.significance] ?? SIG_BORDER.STANDARD;

  return (
    <div style={{
      background: 'var(--bg-2)',
      border: '1px solid var(--bd)',
      borderLeft: `3px solid ${border}`,
      marginBottom: 8,
    }}>
      {/* ── BREAKING banner ── */}
      {isBreaking && (
        <div style={{ padding: '3px 12px', background: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'white' }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: 'white', letterSpacing: '0.10em', textTransform: 'uppercase' }}>Breaking</span>
        </div>
      )}
      {isHigh && !isBreaking && (
        <div style={{ padding: '2px 12px', background: 'rgba(236,154,60,0.15)', borderBottom: '1px solid rgba(236,154,60,0.2)' }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--warning)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>High Significance</span>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderBottom: '1px solid var(--bd-s)', background: 'rgba(0,0,0,0.15)' }}>
        {/* shadcn Avatar */}
        <Avatar style={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', background: post.avatarColor }}>
          <AvatarFallback style={{ background: post.avatarColor, fontSize: 10, fontWeight: 700, color: 'white', borderRadius: '50%' }}>
            {post.avatar.slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        {/* Name + handle */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', lineHeight: 1 }}>{post.displayName}</span>
            {post.verified && <CheckCircle size={11} style={{ color: 'var(--blue-l)', flexShrink: 0 }} strokeWidth={2.5} />}
          </div>
          <span style={{ fontSize: 10, color: 'var(--t4)', fontFamily: 'SFMono-Regular, monospace' }}>{post.handle}</span>
        </div>

        {/* Account type badge */}
        <Badge
          variant="outline"
          style={{ fontSize: 9, padding: '2px 6px', background: acct.bg, color: acct.text, borderColor: 'transparent', letterSpacing: '0.05em', flexShrink: 0, borderRadius: 2 }}
        >
          {acct.label}
        </Badge>

        {/* Timestamp */}
        <span style={{ fontSize: 10, color: 'var(--t4)', flexShrink: 0, fontFamily: 'SFMono-Regular, monospace' }}>{ago(post.timestamp)}</span>
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: '10px 12px' }}>
        <p style={{
          fontSize: compact ? 11.5 : 12.5,
          color: 'var(--t1)', lineHeight: 1.6, whiteSpace: 'pre-wrap',
          ...(compact ? { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : {}),
        }}>
          {post.content}
        </p>

        {/* Images */}
        {!compact && post.images && post.images.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: post.images.length === 1 ? '1fr' : '1fr 1fr', gap: 3, marginTop: 10 }}>
            {post.images.map((img: string) => (
              <div key={img} style={{ height: post.images!.length === 1 ? 130 : 80, background: IMG_BG[img] ?? '#1C2127', border: '1px solid var(--bd)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: 6 }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65))' }} />
                <span style={{ position: 'relative', fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', fontFamily: 'SFMono-Regular, monospace', textTransform: 'uppercase' }}>
                  {IMG_LBL[img] ?? img}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Video */}
        {!compact && post.videoThumb && (
          <div style={{ height: 90, background: 'var(--bg-app)', border: '1px solid var(--bd)', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ width: 36, height: 36, border: '1px solid var(--bd)', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '12px solid var(--t3)', marginLeft: 2 }} />
            </div>
            <span style={{ position: 'absolute', bottom: 8, left: 12, fontSize: 9, color: 'var(--t4)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '.06em' }}>VIDEO</span>
          </div>
        )}
      </div>

      {/* ── FOOTER: engagement metrics ── */}
      <Separator style={{ background: 'var(--bd-s)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '6px 12px', background: 'rgba(0,0,0,0.12)' }}>
        <EngStat icon={<Heart   size={10} strokeWidth={1.5} />} val={fmt(post.likes)}    />
        <EngStat icon={<Repeat2 size={10} strokeWidth={1.5} />} val={fmt(post.retweets)} />
        <EngStat icon={<Eye     size={10} strokeWidth={1.5} />} val={fmt(post.views)}    />
        <div style={{ marginLeft: 'auto' }}>
          <ExternalLink size={11} style={{ color: 'var(--t4)', cursor: 'pointer' }} strokeWidth={1.5} />
        </div>
      </div>

      {/* ── PHAROS NOTE ── */}
      {!compact && post.pharosNote && (
        <div style={{ margin: '0 12px 10px', padding: '8px 10px', background: post.pharosNote.startsWith('⚠️') ? 'var(--warning-dim)' : 'var(--success-dim)', border: `1px solid ${post.pharosNote.startsWith('⚠️') ? 'rgba(236,154,60,.25)' : 'rgba(35,162,109,.25)'}`, borderLeft: `3px solid ${post.pharosNote.startsWith('⚠️') ? 'var(--warning)' : 'var(--success)'}` }}>
          <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            {post.pharosNote.startsWith('⚠️')
              ? <AlertTriangle size={11} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} strokeWidth={2} />
              : <CheckCircle   size={11} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 1 }} strokeWidth={2} />}
            <div>
              <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--t4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>Pharos Analyst Note</div>
              <p style={{ fontSize: 11.5, color: 'var(--t2)', lineHeight: 1.5 }}>{post.pharosNote.replace('⚠️ ', '')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EngStat({ icon, val }: { icon: React.ReactNode; val: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--t4)' }}>
      {icon}
      <span style={{ fontSize: 10, fontFamily: 'SFMono-Regular, monospace' }}>{val}</span>
    </div>
  );
}
