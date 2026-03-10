'use client';

import { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';

import { BROWSE_POLL, BROWSE_SECTIONS } from '@/features/browse/constants';
import { useEvents } from '@/features/events/queries';

import type { Severity } from '@/types/domain';

const SEV_DOT: Record<string, string> = {
  CRITICAL: 'dot dot-danger',
  HIGH: 'dot dot-warning',
  STANDARD: 'dot dot-info',
};

type Props = {
  onNavigate?: () => void;
};

const SEV_FILTERS: { severity: Severity; color: string }[] = [
  { severity: 'CRITICAL', color: 'var(--danger)' },
  { severity: 'HIGH',     color: 'var(--warning)' },
  { severity: 'STANDARD', color: 'var(--info)' },
];

function EventSidebarList({ currentPath, onNavigate, sevFilter }: { currentPath: string; onNavigate?: () => void; sevFilter: Set<Severity> }) {
  const { data: events, isLoading } = useEvents(undefined, undefined, { refetchInterval: BROWSE_POLL });

  if (isLoading) {
    return (
      <div className="px-4 py-3">
        <span className="mono text-[10px] text-[var(--t4)]">Loading...</span>
      </div>
    );
  }

  if (!events || events.length === 0) return null;

  const filtered = sevFilter.size > 0 ? events.filter((e) => sevFilter.has(e.severity)) : events;

  return (
    <div className="flex flex-col">
      {filtered.map((e) => {
        const isActive = currentPath === `/browse/events/${e.id}`;
        return (
          <Link
            key={e.id}
            href={`/browse/events/${e.id}`}
            onClick={onNavigate}
            className={`no-underline flex items-start gap-2 px-4 py-2 border-b border-[var(--bd-s)] transition-colors ${
              isActive
                ? 'bg-[var(--bg-sel)]'
                : 'hover:bg-[var(--bg-3)]'
            }`}
          >
            <span className={`${SEV_DOT[e.severity] ?? 'dot dot-info'} mt-1.5 shrink-0`} />
            <span className="text-[11px] text-[var(--t2)] line-clamp-2 leading-tight">
              {e.title}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function BrowseSidebar({ onNavigate }: Props) {
  const path = usePathname();
  const activeSection = BROWSE_SECTIONS.find((s) => path.startsWith(s.href));
  const [sevFilter, setSevFilter] = useState<Set<Severity>>(new Set());

  return (
    <aside className="w-56 shrink-0 border-r border-[var(--bd)] bg-[var(--bg-1)] flex flex-col overflow-hidden">
      <nav className="flex flex-col py-2 border-b border-[var(--bd)]">
        {BROWSE_SECTIONS.map((s) => {
          const isActive = path.startsWith(s.href);
          return (
            <Link
              key={s.href}
              href={s.href}
              onClick={onNavigate}
              className={`no-underline px-4 py-1.5 text-[11px] font-semibold tracking-[0.06em] transition-colors ${
                isActive
                  ? 'text-[var(--t1)] bg-[var(--bg-sel)]'
                  : 'text-[var(--t3)] hover:text-[var(--t1)] hover:bg-[var(--bg-3)]'
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>

      {activeSection?.href === '/browse/events' && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--bd)]">
          {SEV_FILTERS.map(({ severity, color }) => {
            const active = sevFilter.has(severity);
            const hasAny = sevFilter.size > 0;
            return (
              <Button
                key={severity}
                variant="ghost"
                size="icon-xs"
                onClick={() => setSevFilter((prev) => {
                  const next = new Set(prev);
                  if (next.has(severity)) next.delete(severity);
                  else next.add(severity);
                  return next;
                })}
                className="size-3 rounded-full shrink-0 p-0"
                style={{
                  background: color,
                  boxShadow: active ? `0 0 6px ${color}` : 'none',
                  opacity: hasAny && !active ? 0.3 : 1,
                }}
                aria-label={`Filter ${severity.toLowerCase()}`}
              />
            );
          })}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <EventSidebarList currentPath={path} onNavigate={onNavigate} sevFilter={sevFilter} />
      </div>
    </aside>
  );
}
