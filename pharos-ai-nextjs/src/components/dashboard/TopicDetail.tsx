'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchDashboardOutlooks } from '@/store/slices/dashboardSlice';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, FileText, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getTopicColor } from '@/utils/topicColors';

interface TopicDetailProps { topicId: string; }

export const TopicDetail = ({ topicId }: TopicDetailProps) => {
  const dispatch = useAppDispatch();
  const { latestOutlooks, loading, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardOutlooks());
  }, [dispatch]);

  const topicData = latestOutlooks.find(
    (o) => o.topic_id === topicId || o.topic_name.toLowerCase().replace(/\s+/g, '-') === topicId
  );

  if (loading.outlooks) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (error.outlooks || !topicData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-slate-900 mb-2 font-sans font-bold tracking-tight">Topic Not Found</h2>
        <p className="text-slate-600 font-serif leading-relaxed">No data available for this topic.</p>
      </div>
    );
  }

  const { topic_name, latest_outlook } = topicData;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-300 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <Badge className={`text-sm font-sans uppercase tracking-[0.05em] mb-2 ${getTopicColor(topic_name)}`}>{topic_name}</Badge>
            <h1 className="text-3xl font-bold text-slate-900 font-sans font-bold tracking-tight">TOPIC INTELLIGENCE</h1>
          </div>
        </div>
      </div>

      {latest_outlook ? (
        <Card className="bg-white border-slate-300 hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Badge className={`text-xs font-sans uppercase tracking-[0.05em] ${getTopicColor(topic_name)}`}>{topic_name}</Badge>
                <div className="flex items-center text-slate-500 text-sm font-sans uppercase tracking-[0.05em]">
                  <Clock className="w-3 h-3 mr-1" />
                  {latest_outlook.date}
                </div>
              </div>
              <div className="flex items-center text-slate-500 text-sm font-sans uppercase tracking-[0.05em]">
                <FileText className="w-3 h-3 mr-1" />
                {latest_outlook.readTime} read
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3 font-sans font-bold tracking-tight leading-tight">{latest_outlook.title}</h2>
            <p className="text-slate-600 font-serif leading-relaxed mb-4">{latest_outlook.summary}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-slate-500 font-sans text-sm uppercase tracking-[0.05em]">
                {latest_outlook.confidenceScore != null && <span>CONFIDENCE: {Math.round(latest_outlook.confidenceScore * 100)}%</span>}
                {latest_outlook.sourceCount != null && <span>SOURCES: {latest_outlook.sourceCount}</span>}
              </div>
              <Link href={`/outlook/${latest_outlook.id}`}>
                <Button className="font-sans text-sm uppercase tracking-[0.05em] bg-slate-900 text-white hover:bg-slate-800" size="sm">
                  READ FULL OUTLOOK <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2 font-sans font-bold tracking-tight">No Recent Outlook</h2>
          <p className="text-slate-600 font-serif leading-relaxed">No intelligence outlook is available for this topic yet.</p>
        </div>
      )}
    </div>
  );
};
