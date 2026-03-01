'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, FileText, TrendingUp, Clock } from 'lucide-react';
import { apiClient, CalendarDateItem } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface OutlookCalendarProps {
  topicSlug: string;
  topicName: string;
  currentOutlookSlug?: string;
  isOpen: boolean;
  onClose: () => void;
}

const OutlookCalendar: React.FC<OutlookCalendarProps> = ({ topicSlug, topicName, currentOutlookSlug, isOpen, onClose }) => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDates, setCalendarDates] = useState<CalendarDateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  useEffect(() => {
    if (isOpen) loadCalendarDates();
  }, [isOpen, currentYear, currentMonth, topicSlug]);

  const loadCalendarDates = async () => {
    setLoading(true); setError(null);
    try {
      const response = await apiClient.getOutlookCalendarDates(topicSlug, { year: currentYear, month: currentMonth });
      setCalendarDates(response.data.dates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calendar dates');
    } finally {
      setLoading(false); setIsNavigating(false);
    }
  };

  const dateMap = new Map<string, CalendarDateItem>();
  calendarDates.forEach((item) => dateMap.set(item.date, item));

  const previousMonth = () => { setIsNavigating(true); setCurrentDate(new Date(currentYear, currentMonth - 2, 1)); };
  const nextMonth = () => { setIsNavigating(true); setCurrentDate(new Date(currentYear, currentMonth, 1)); };
  const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m - 1, 1).getDay();

  const generateCalendarDays = () => {
    const days: (number | null)[] = [];
    for (let i = 0; i < getFirstDayOfMonth(currentYear, currentMonth); i++) days.push(null);
    for (let d = 1; d <= getDaysInMonth(currentYear, currentMonth); d++) days.push(d);
    return days;
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const item = dateMap.get(dateStr);
    if (item?.has_content) { router.push(`/outlook/${item.outlook_slug}`); onClose(); }
  };

  const formatMonthYear = () => new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-slate-900 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-bold uppercase tracking-wider font-sans font-bold tracking-tight">OUTLOOK CALENDAR</h2>
                <p className="text-sm text-slate-300 font-sans text-sm uppercase tracking-[0.05em]">{topicName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <button onClick={previousMonth} disabled={loading || isNavigating} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h3 className="text-xl font-bold text-slate-900 font-sans font-bold tracking-tight">{formatMonthYear()}</h3>
            <button onClick={nextMonth} disabled={loading || isNavigating} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-4 relative">
          {isNavigating && (
            <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex items-center justify-center">
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"></div>
            </div>
          )}

          {loading && !isNavigating && (
            <div className="text-center py-8">
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 mx-auto mb-3"></div>
              <p className="text-slate-600 text-sm font-serif leading-relaxed">Loading calendar...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-8">
              <div className="text-red-600 text-sm font-serif leading-relaxed mb-4">Failed to load calendar: {error}</div>
              <button onClick={loadCalendarDates} className="px-4 py-2 bg-slate-900 text-white rounded text-sm hover:bg-slate-800">Try Again</button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                  <div key={d} className="p-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider font-sans text-sm uppercase tracking-[0.05em]">{d}</div>
                ))}
                {generateCalendarDays().map((day, idx) => {
                  if (day === null) return <div key={idx} className="p-2"></div>;
                  const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                  const item = dateMap.get(dateStr);
                  const hasOutlook = item?.has_content;
                  const isCurrent = item?.outlook_slug === currentOutlookSlug;
                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      disabled={!hasOutlook || isNavigating}
                      className={`p-2 text-sm rounded transition-colors relative min-h-[40px] flex items-center justify-center
                        ${isCurrent ? 'bg-slate-900 text-white' : hasOutlook ? 'bg-blue-50 hover:bg-blue-100 text-blue-900 cursor-pointer border border-blue-200' : 'text-slate-400 cursor-not-allowed hover:bg-slate-50'}
                        ${isNavigating ? 'opacity-50' : ''}`}
                    >
                      <span className={`font-serif leading-relaxed font-medium ${isCurrent ? 'text-white' : ''}`}>{day}</span>
                      {hasOutlook && <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${isCurrent ? 'bg-white' : 'bg-blue-600'}`}></div>}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider font-sans text-sm uppercase tracking-[0.05em]">Calendar Legend</h4>
                  <div className="flex items-center gap-4 text-xs font-sans uppercase tracking-[0.05em]">
                    <div className="flex items-center gap-1"><FileText className="w-3 h-3 text-slate-500" /><span>{calendarDates.length} Outlooks</span></div>
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-500" /><span>{formatMonthYear()}</span></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded flex items-center justify-center"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div></div>
                    <span className="text-slate-600 font-serif leading-relaxed">Available Outlook</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-900 rounded flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div>
                    <span className="text-slate-600 font-serif leading-relaxed">Current Outlook</span>
                  </div>
                </div>
                {calendarDates.length > 0 && (
                  <div className="mt-4 p-3 bg-slate-50 rounded border">
                    <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-slate-600" /><span className="text-sm font-medium text-slate-700 font-sans text-sm uppercase tracking-[0.05em]">MONTH SUMMARY</span></div>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div><span className="text-slate-500 font-sans text-sm uppercase tracking-[0.05em]">Total Outlooks</span><div className="font-bold text-slate-900 font-serif leading-relaxed">{calendarDates.length}</div></div>
                      <div>
                        <span className="text-slate-500 font-sans text-sm uppercase tracking-[0.05em]">Avg Confidence</span>
                        <div className="font-bold text-slate-900 font-serif leading-relaxed">
                          {Math.round(calendarDates.reduce((s, i) => s + i.confidence_score, 0) / calendarDates.length * 100)}%
                        </div>
                      </div>
                      <div><span className="text-slate-500 font-sans text-sm uppercase tracking-[0.05em]">Total Sources</span><div className="font-bold text-slate-900 font-serif leading-relaxed">{calendarDates.reduce((s, i) => s + i.source_count, 0)}</div></div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutlookCalendar;
