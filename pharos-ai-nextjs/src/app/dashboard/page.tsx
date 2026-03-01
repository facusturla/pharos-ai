'use client';
import { useState } from 'react';
import { TopicSidebar } from '@/components/dashboard/TopicSidebar';
import { FeedPane } from '@/components/dashboard/FeedPane';
import { DetailPane } from '@/components/dashboard/DetailPane';

export default function DashboardPage() {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  return (
    <>
      {/* Sidebar */}
      <TopicSidebar selected={selectedTopic} onSelect={(t) => { setSelectedTopic(t); setSelectedItem(null); }} />
      {/* Feed list */}
      <FeedPane topicId={selectedTopic} selectedItem={selectedItem} onSelect={setSelectedItem} />
      {/* Detail */}
      <DetailPane itemId={selectedItem} />
    </>
  );
}
