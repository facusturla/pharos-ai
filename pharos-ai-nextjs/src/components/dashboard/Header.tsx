'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { label: 'SITUATION ROOM',    href: '/dashboard' },
  { label: 'INTEL FEED',        href: '/dashboard/feed' },
  { label: 'ACTORS',            href: '/dashboard/actors' },
  { label: 'DAILY BRIEFS',      href: '/dashboard/briefs' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header style={{ background: '#0f172a', color: 'white', borderBottom: '4px solid #dd4545', flexShrink: 0 }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <LiveDot />
            <span className="news-meta" style={{ color: '#f87171', fontSize: 11 }}>Live Intelligence</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.40)', fontSize: 12, fontFamily: 'Arial, sans-serif' }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <HeaderIconBtn icon="settings" />
          <HeaderIconBtn icon="user" />
        </div>
      </div>

      {/* Main bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px',
      }}>
        {/* Logo + Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, flexShrink: 0 }}>
              <PharosLogo />
            </div>
            <div>
              <div className="news-headline" style={{ fontSize: 22, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>
                PHAROS
              </div>
              <div className="news-meta" style={{ color: 'rgba(255,255,255,0.38)', fontSize: 10 }}>
                Intelligence
              </div>
            </div>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {NAV.map(({ label, href }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <span className="news-meta" style={{
                    display: 'inline-block',
                    padding: '8px 18px',
                    fontSize: 11,
                    borderRadius: 2,
                    letterSpacing: '0.06em',
                    background: active ? 'white' : 'transparent',
                    color: active ? '#0f172a' : 'rgba(255,255,255,0.65)',
                    fontWeight: active ? 700 : 600,
                    transition: 'background 0.1s, color 0.1s',
                  }}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search global intelligence..."
            style={{
              paddingLeft: 34, paddingRight: 14, paddingTop: 7, paddingBottom: 7,
              width: 280,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 3,
              color: 'white',
              fontSize: 12,
              fontFamily: 'Arial, sans-serif',
              outline: 'none',
            }}
          />
        </div>
      </div>
    </header>
  );
}

function LiveDot() {
  return (
    <div style={{
      width: 8, height: 8, borderRadius: '50%',
      background: '#ef4444',
      boxShadow: '0 0 5px #ef4444',
    }} />
  );
}

function HeaderIconBtn({ icon }: { icon: 'settings' | 'user' }) {
  return (
    <button
      style={{
        width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: 'none', borderRadius: 3,
        color: 'rgba(255,255,255,0.55)', cursor: 'pointer',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        {icon === 'settings'
          ? <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></>
          : <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>
        }
      </svg>
    </button>
  );
}

function PharosLogo() {
  return (
    <svg viewBox="0 0 1024 1024" width="40" height="40">
      <rect fill="#dd4545" height="1024" width="1024" x="0" y="0" />
      <path d="M 199,270 L 201,427 L 455,370 L 465,384 L 426,396 L 450,454 L 419,689 L 379,694 L 371,732 L 201,747 L 812,745 L 640,732 L 632,694 L 593,689 L 562,458 L 586,398 L 547,389 L 561,371 L 811,427 L 811,268 L 560,323 L 509,265 L 452,323 Z" fill="white" stroke="none" />
      <path d="M 394,713 L 611,709 L 617,728 L 400,732 Z" fill="#dd4545" stroke="none" />
      <path d="M 568,633 L 572,692 L 486,689 Z" fill="#dd4545" stroke="none" />
      <path d="M 551,517 L 562,599 L 441,684 L 449,581 Z" fill="#dd4545" stroke="none" />
      <path d="M 542,451 L 531,506 L 457,555 L 466,454 Z" fill="#dd4545" stroke="none" />
      <path d="M 444,413 L 567,419 L 463,433 Z" fill="#dd4545" stroke="none" />
      <path d="M 473,346 L 536,343 L 527,387 L 489,391 Z" fill="#dd4545" stroke="none" />
      <path d="M 478,317 L 508,301 L 534,321 Z" fill="#dd4545" stroke="none" />
      <path d="M 796,292 L 789,407 L 556,351 Z" fill="#dd4545" stroke="none" />
      <path d="M 216,292 L 456,351 L 222,407 Z" fill="#dd4545" stroke="none" />
    </svg>
  );
}
