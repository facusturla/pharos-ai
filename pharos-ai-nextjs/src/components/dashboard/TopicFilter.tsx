'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchAvailableTopics } from '@/store/slices/dashboardSlice';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { getTopicColor } from '@/utils/topicColors';

interface TopicFilterProps {
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
}

export const TopicFilter = ({ selectedTopic, onTopicChange }: TopicFilterProps) => {
  const dispatch = useAppDispatch();
  const { topics, loading, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchAvailableTopics());
  }, [dispatch]);

  if (loading.topics) {
    return (
      <div className="w-64 bg-white border-r border-slate-300 p-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-slate-300 flex-shrink-0">
      <div className="p-4 border-b border-slate-300 bg-slate-50">
        <h2 className="text-sm font-bold text-slate-900 font-sans text-sm uppercase tracking-[0.05em]">INTELLIGENCE TOPICS</h2>
      </div>

      <div className="p-4 space-y-2">
        <button
          onClick={() => onTopicChange('all')}
          className={`w-full text-left px-3 py-2 rounded transition-colors ${
            selectedTopic === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span className="text-sm font-medium font-serif leading-relaxed">All Topics</span>
        </button>

        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onTopicChange(topic.id)}
            className={`w-full text-left px-3 py-2 rounded transition-colors ${
              selectedTopic === topic.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium font-serif leading-relaxed truncate">{topic.name}</span>
              <Badge className={`text-xs font-sans uppercase tracking-[0.05em] ml-2 flex-shrink-0 ${getTopicColor(topic.name)}`}>
                {topic.active_rss_feeds_count}
              </Badge>
            </div>
            {topic.description && (
              <p className="text-xs text-slate-500 mt-1 font-serif leading-relaxed line-clamp-2">{topic.description}</p>
            )}
          </button>
        ))}

        {!loading.topics && topics.length === 0 && !error.topics && (
          <p className="text-sm text-slate-500 font-serif leading-relaxed px-3">No topics available</p>
        )}

        {error.topics && (
          <p className="text-sm text-red-500 font-serif leading-relaxed px-3">Failed to load topics</p>
        )}
      </div>
    </div>
  );
};
