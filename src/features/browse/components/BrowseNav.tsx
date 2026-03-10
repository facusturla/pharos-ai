import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { GITHUB_URL } from '@/features/browse/constants';

type Props = {
  hamburgerSlot?: React.ReactNode;
};

export function BrowseNav({ hamburgerSlot }: Props) {
  return (
    <header className="shrink-0 border-b border-[var(--bd)]">
      <div className="h-[3px] bg-[var(--danger)]" />
      <div className="h-11 flex items-center justify-between bg-[var(--bg-app)] px-5">
        <div className="flex items-center gap-3">
          {hamburgerSlot}
          <Link href="/browse" className="no-underline">
            <span className="text-[15px] font-bold text-[var(--t1)] tracking-[0.12em]">
              PHAROS
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-5">
          <Button
            variant="outline"
            size="xs"
            asChild
            className="[--border:var(--bd)] [--background:var(--bg-1)] [--accent:var(--bg-3)] [--accent-foreground:var(--t1)] text-[var(--t2)] hover:text-[var(--t1)]"
          >
            <Link href="/dashboard">Dashboard &rarr;</Link>
          </Button>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline mono text-xs text-[var(--t3)] hover:text-[var(--t1)] transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
