'use client';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchOutlooks } from '@/store/slices/outlookSlice';
import { DailyOutlookCard } from './DailyOutlookCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar } from 'lucide-react';
import { DashboardCalendar } from '@/components/shared/DashboardCalendar';
import { DashboardOutlookItem } from '@/lib/api';
import { OutlookItem } from '@/types';

export const OutlookList = () => {
  const dispatch = useAppDispatch();
  const { outlooks, loading, error, pagination } = useAppSelector((state) => state.outlook);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateOutlooks, setSelectedDateOutlooks] = useState<DashboardOutlookItem[]>([]);

  useEffect(() => {
    if (!selectedDate) dispatch(fetchOutlooks({ limit: 10, offset: 0 }));
  }, [dispatch, selectedDate]);

  const handleLoadMore = () => {
    if (pagination?.nextOffset !== null && pagination?.nextOffset !== undefined) {
      dispatch(fetchOutlooks({ limit: pagination.limit, offset: pagination.nextOffset }));
    }
  };

  const handleDateExplore = (date: string, items: DashboardOutlookItem[]) => {
    setSelectedDate(date);
    setSelectedDateOutlooks(items);
    setIsCalendarOpen(false);
  };

  const handleBackToToday = () => {
    setSelectedDate(null);
    setSelectedDateOutlooks([]);
    dispatch(fetchOutlooks({ limit: 10, offset: 0 }));
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const getCurrentDate = () =>
    new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const displayedOutlooks: OutlookItem[] = selectedDate
    ? selectedDateOutlooks.map((o) => ({ id: o.id, title: o.title, summary: o.summary, topic: o.topic, date: selectedDate, readTime: o.readTime, regions: o.regions }))
    : outlooks;

  const isLoading = selectedDate ? false : loading.list && outlooks.length === 0;
  const hasError = selectedDate ? false : error.list && outlooks.length === 0;

  const Header = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-slate-900 font-sans font-bold tracking-tight">DAILY INTELLIGENCE OUTLOOKS</h1>
          <Badge className="bg-slate-100 text-slate-700 text-sm font-sans uppercase tracking-[0.05em] px-3 py-1">
            {selectedDate ? formatDate(selectedDate) : getCurrentDate()}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {selectedDate && (
            <Button onClick={handleBackToToday} variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
              <span className="text-xs font-medium uppercase tracking-wider font-sans text-sm uppercase tracking-[0.05em]">BACK TO TODAY</span>
            </Button>
          )}
          <Button onClick={() => setIsCalendarOpen(true)} variant="outline" size="sm" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 border-slate-300">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider font-sans text-sm uppercase tracking-[0.05em]">CALENDAR</span>
          </Button>
        </div>
      </div>
      <p className="text-slate-600 font-serif leading-relaxed text-lg">Comprehensive analysis of geopolitical developments and their implications</p>
    </div>
  );

  if (isLoading) return (
    <>
      <Header />
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
        <span className="ml-2 text-slate-600">Loading daily outlooks...</span>
      </div>
      <DashboardCalendar isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} onDateExplore={handleDateExplore} />
    </>
  );

  if (hasError) return (
    <>
      <Header />
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Outlooks</h2>
        <p className="text-slate-600 mb-4">{error.list}</p>
        <Button onClick={() => dispatch(fetchOutlooks({ limit: 10, offset: 0 }))} variant="outline">Try Again</Button>
      </div>
      <DashboardCalendar isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} onDateExplore={handleDateExplore} />
    </>
  );

  return (
    <>
      <div className="space-y-6">
        <Header />
        {displayedOutlooks.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Outlooks Available</h2>
            <p className="text-slate-600 mb-4">{selectedDate ? `No outlooks found for ${formatDate(selectedDate)}` : 'No outlooks available at this time'}</p>
            {selectedDate && <Button onClick={handleBackToToday} variant="outline">Back to Today</Button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedOutlooks.map((outlook) => <DailyOutlookCard key={outlook.id} outlook={outlook} />)}
          </div>
        )}
        {!selectedDate && pagination?.hasNext && (
          <div className="text-center mt-8">
            <Button onClick={handleLoadMore} disabled={loading.list} className="bg-slate-900 text-white hover:bg-slate-800">
              {loading.list ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Loading...</> : 'Load More Outlooks'}
            </Button>
          </div>
        )}
        {pagination && !selectedDate && (
          <div className="text-center text-sm text-slate-500 mt-4">Showing {outlooks.length} of {pagination.total} outlooks</div>
        )}
        {selectedDate && (
          <div className="text-center text-sm text-slate-500 mt-4">Showing {selectedDateOutlooks.length} outlooks for {formatDate(selectedDate)}</div>
        )}
      </div>
      <DashboardCalendar isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} onDateExplore={handleDateExplore} />
    </>
  );
};
