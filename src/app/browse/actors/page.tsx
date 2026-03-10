import type { Metadata } from 'next';

import { ActorGrid } from '@/features/browse/components/ActorGrid';
import { BrowseBreadcrumb } from '@/features/browse/components/BrowseBreadcrumb';
import { BrowsePagination } from '@/features/browse/components/BrowsePagination';
import { getActors, PAGE_SIZE } from '@/features/browse/queries';

export const metadata: Metadata = {
  title: 'Actors — Iran Conflict Intelligence',
  description:
    'Key state and non-state actors in the Iran conflict. Activity levels, stances, assessments, and intelligence profiles for every tracked entity.',
  alternates: { canonical: 'https://www.conflicts.app/browse/actors' },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BrowseActorsPage({ searchParams }: Props) {
  const params = await searchParams;
  const type = params.type
    ? Array.isArray(params.type) ? params.type : [params.type]
    : undefined;
  const affiliation = params.affiliation
    ? Array.isArray(params.affiliation) ? params.affiliation : [params.affiliation]
    : undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const { actors, total } = await getActors({ type, affiliation, page });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const filterParams = new URLSearchParams();
  if (type) for (const t of type) filterParams.append('type', t);
  if (affiliation) for (const a of affiliation) filterParams.append('affiliation', a);
  const filterQs = filterParams.toString();

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <BrowseBreadcrumb crumbs={[{ label: 'Actors' }]} />

      <header className="mt-6 mb-8">
        <p className="label mb-2">Intelligence profiles</p>
        <h1 className="text-lg font-bold text-[var(--t1)] mb-1">Actors</h1>
        <p className="text-xs text-[var(--t3)]">
          {total > PAGE_SIZE
            ? `Showing ${from}–${to} of ${total} actors`
            : `${total} actors`}
          {' '}tracked in the Iran conflict
        </p>
      </header>

      <ActorGrid actors={actors} />

      {totalPages > 1 && (
        <div className="mt-10">
          <BrowsePagination
            page={page}
            totalPages={totalPages}
            basePath="/browse/actors"
            searchParams={filterQs}
          />
        </div>
      )}
    </div>
  );
}
