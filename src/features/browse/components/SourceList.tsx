import { SourceBadge } from '@/features/browse/components/SourceBadge';

import type { Source } from '@/types/domain';

type Props = {
  sources: Source[];
};

export function SourceList({ sources }: Props) {
  if (sources.length === 0) return null;

  return (
    <section>
      <p className="label mb-3">Sources</p>
      <div className="flex flex-col gap-1.5">
        {sources.map((s, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-2)] border border-[var(--bd-s)]">
            <SourceBadge tier={s.tier} />
            {s.url ? (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline text-xs text-[var(--blue-l)] hover:text-[var(--t1)] transition-colors"
              >
                {s.name}
              </a>
            ) : (
              <span className="text-xs text-[var(--t2)]">{s.name}</span>
            )}
            <span className="mono text-[10px] text-[var(--t4)] ml-auto">
              {Math.round(s.reliability * 100)}% reliability
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
