import type { Metadata } from 'next';

import { BrowsePageHeader } from '@/features/browse/components/BrowsePageHeader';
import { EventFilterBar } from '@/features/browse/components/EventFilterBar';
import { EventList } from '@/features/browse/components/EventList';
import { EventPagination } from '@/features/browse/components/EventPagination';
import { getEventDates, getEvents, PAGE_SIZE } from '@/features/browse/queries';

export const metadata: Metadata = {
  title: 'Events — Iran Conflict Timeline',
  description:
    'Complete timeline of events in the Iran conflict. Airstrikes, diplomatic moves, intelligence operations, and humanitarian incidents tracked with severity and sources.',
  alternates: { canonical: 'https://www.conflicts.app/browse/events' },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BrowseEventsPage({ searchParams }: Props) {
  const params = await searchParams;
  const severity = params.severity
    ? Array.isArray(params.severity) ? params.severity : [params.severity]
    : undefined;
  const date = typeof params.date === 'string' ? params.date : undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const [{ events, total }, eventDatesSet] = await Promise.all([
    getEvents({ severity, date, page }),
    getEventDates(),
  ]);
  const eventDates = [...eventDatesSet];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  // Page number is added by EventPagination itself
  const filterParams = new URLSearchParams();
  if (severity) for (const s of severity) filterParams.append('severity', s);
  if (date) filterParams.set('date', date);
  const filterQs = filterParams.toString();

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <BrowsePageHeader crumbs={[{ label: 'Events' }]} hasAutoRefresh />

      <header className="mt-6 mb-8">
        <p className="label mb-2">Intelligence feed</p>
        <h1 className="text-lg font-bold text-[var(--t1)] mb-1">Events</h1>
        <p className="text-xs text-[var(--t3)]">
          {total > PAGE_SIZE
            ? `Showing ${from}–${to} of ${total} events`
            : `${total} events`}
          {severity || date ? ' matching filters' : ' tracked across the Iran conflict'}
        </p>
      </header>

      <EventList
        events={events}
        page={page}
        filterBar={<EventFilterBar eventDates={eventDates} />}
      />

      {totalPages > 1 && (
        <div className="mt-10">
          <EventPagination page={page} totalPages={totalPages} searchParams={filterQs} />
        </div>
      )}
    </div>
  );
}
