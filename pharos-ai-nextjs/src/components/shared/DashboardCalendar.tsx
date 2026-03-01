'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, FileText, TrendingUp, Users, Clock, ArrowRight } from 'lucide-react';
import { apiClient, DashboardOutlookItem, OutlooksByDateResponse } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DashboardCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  onDateExplore?: (date: string, outlooks: DashboardOutlookItem[]) => void;
}

export const DashboardCalendar: React.FC<DashboardCalendarProps> = ({ isOpen, onClose, onDateExplore }) => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Map<string, OutlooksByDateResponse['data']>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateOutlooks, setSelectedDateOutlooks] = useState<DashboardOutlookItem[]>([]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  useEffect(() => { if (isOpen) loadCalendarData(); }, [isOpen, currentYear, currentMonth]);

  const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m - 1, 1).getDay();

  const loadCalendarData = async () => {
    setLoading(true); setError(null);
    try {
      const daysInMonth = getDaysInMonth(currentYear, currentMonth);
      const newData = new Map();
      const promises = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        promises.push(apiClient.getOutlooksByDate(dateStr).then((r) => ({ dateStr, data: r.data })).catch(() => ({ dateStr, data: null })));
      }
      const results = await Promise.all(promises);
      results.forEach((r) => { if (r.data) newData.set(r.dateStr, r.data); });
      setCalendarData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calendar data');
    } finally {
      setLoading(false); setIsNavigating(false);
    }
  };

  const previousMonth = () => { setIsNavigating(true); setCurrentDate(new Date(currentYear, currentMonth - 2, 1)); setSelectedDate(null); };
  const nextMonth = () => { setIsNavigating(true); setCurrentDate(new Date(currentYear, currentMonth, 1)); setSelectedDate(null); };

  const generateCalendarDays = () => {
    const days: (number | null)[] = [];
    for (let i = 0; i < getFirstDayOfMonth(currentYear, currentMonth); i++) days.push(null);
    for (let d = 1; d <= getDaysInMonth(currentYear, currentMonth); d++) days.push(d);
    return days;
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const data = calendarData.get(dateStr);
    if (data && data.outlooks_available > 0) { setSelectedDate(dateStr); setSelectedDateOutlooks(data.outlooks); }
  };

  const handleOutlookSelect = (id: string) => { router.push(`/outlook/${id}`); onClose(); };
  const handleExploreDate = () => { if (selectedDate && onDateExplore) onDateExplore(selectedDate, selectedDateOutlooks); };
  const formatMonthYear = () => new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const formatSelectedDate = () => selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';

  const getDateColor = (dateStr: string) => {
    const d = calendarData.get(dateStr);
    if (!d || d.outlooks_available === 0) return 'bg-slate-100 text-slate-900 border-slate-200';
    const pct = d.coverage_percentage;
    if (pct >= 80) return 'bg-blue-100 text-slate-900 hover:bg-blue-200 border-blue-300';
    if (pct >= 60) return 'bg-blue-50 text-slate-900 hover:bg-blue-100 border-blue-200';
    if (pct >= 40) return 'bg-slate-100 text-slate-900 hover:bg-blue-50 border-slate-300';
    return 'bg-slate-50 text-slate-900 hover:bg-slate-100 border-slate-300';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-slate-900 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-bold uppercase tracking-wider font-sans font-bold tracking-tight">DASHBOARD CALENDAR</h2>
                <p className="text-sm text-slate-300 font-sans text-sm uppercase tracking-[0.05em]">Navigate outlooks by date across all topics</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Calendar Side */}
          <div className="flex-1 border-r border-slate-200 overflow-y-auto">
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <button onClick={previousMonth} disabled={loading || isNavigating} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
                <h3 className="text-xl font-bold text-slate-900 font-sans font-bold tracking-tight">{formatMonthYear()}</h3>
                <button onClick={nextMonth} disabled={loading || isNavigating} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
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
                  <button onClick={loadCalendarData} className="px-4 py-2 bg-slate-900 text-white rounded text-sm hover:bg-slate-800">Try Again</button>
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
                      const data = calendarData.get(dateStr);
                      const hasOutlooks = data && data.outlooks_available > 0;
                      const isSelected = selectedDate === dateStr;
                      return (
                        <button
                          key={day}
                          onClick={() => handleDateClick(day)}
                          disabled={!hasOutlooks || isNavigating}
                          className={`p-2 text-sm rounded transition-all min-h-[50px] flex flex-col items-center justify-center relative border
                            ${isSelected ? 'bg-slate-900 text-white ring-2 ring-slate-600 border-slate-900' : hasOutlooks ? `${getDateColor(dateStr)} cursor-pointer hover:scale-105` : 'bg-slate-100 text-slate-900 cursor-not-allowed border-slate-200'}
                            ${isNavigating ? 'opacity-50' : ''}`}
                        >
                          <span className={`font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>{day}</span>
                          {hasOutlooks && <div className={`text-xs mt-1 font-medium ${isSelected ? 'text-white' : 'text-slate-700'}`}>{data.outlooks_available}</div>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider font-sans text-sm uppercase tracking-[0.05em] mb-3">Coverage Legend</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div><span className="text-slate-600 font-serif leading-relaxed">80%+ Coverage</span></div>
                      <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div><span className="text-slate-600 font-serif leading-relaxed">60-79% Coverage</span></div>
                      <div className="flex items-center gap-2"><div className="w-4 h-4 bg-slate-100 border border-slate-300 rounded"></div><span className="text-slate-600 font-serif leading-relaxed">40-59% Coverage</span></div>
                      <div className="flex items-center gap-2"><div className="w-4 h-4 bg-slate-50 border border-slate-300 rounded"></div><span className="text-slate-600 font-serif leading-relaxed">20-39% Coverage</span></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Outlook Selection Side */}
          <div className="w-1/2 bg-slate-50 flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 font-sans font-bold tracking-tight">{selectedDate ? formatSelectedDate() : 'Select a Date'}</h3>
              {selectedDate && calendarData.get(selectedDate) && (
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                  <div className="flex items-center gap-1"><FileText className="w-4 h-4" /><span>{calendarData.get(selectedDate)!.outlooks_available} Outlooks</span></div>
                  <div className="flex items-center gap-1"><TrendingUp className="w-4 h-4" /><span>{calendarData.get(selectedDate)!.coverage_percentage}% Coverage</span></div>
                </div>
              )}
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              {!selectedDate && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 text-sm font-serif leading-relaxed">Click on a date to view available outlooks</p>
                </div>
              )}
              {selectedDate && selectedDateOutlooks.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 text-sm font-serif leading-relaxed">No outlooks available for this date</p>
                </div>
              )}
              {selectedDate && selectedDateOutlooks.length > 0 && (
                <>
                  <div className="space-y-3 mb-4">
                    {selectedDateOutlooks.map((outlook) => (
                      <div key={outlook.id} className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleOutlookSelect(outlook.id)}>
                        <div className="flex items-start justify-between mb-2">
                          <Badge className="text-xs font-sans uppercase tracking-[0.05em] bg-blue-100 text-blue-800">{outlook.topic}</Badge>
                          <div className="text-xs text-slate-500 font-sans text-sm uppercase tracking-[0.05em]">{outlook.readTime}</div>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm font-sans font-bold tracking-tight mb-2 line-clamp-2">{outlook.title}</h4>
                        <p className="text-sm text-slate-600 font-serif leading-relaxed line-clamp-2 mb-3">{outlook.summary}</p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1"><Users className="w-3 h-3" /><span>{outlook.source_count} sources</span></div>
                            <div className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /><span>{Math.round(outlook.confidence_score * 100)}%</span></div>
                          </div>
                          <span className="text-blue-600 hover:text-blue-800 font-medium">Read →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {onDateExplore && (
                    <div className="border-t border-slate-200 pt-4">
                      <Button onClick={handleExploreDate} className="w-full bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2 justify-center font-sans text-sm uppercase tracking-[0.05em]">
                        <span className="uppercase tracking-wider text-xs font-bold">Explore outlooks for {formatSelectedDate()}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCalendar;
