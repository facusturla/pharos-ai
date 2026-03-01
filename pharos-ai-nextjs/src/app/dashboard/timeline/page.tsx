'use client';
import { useState } from 'react';
import { TopicSidebar } from '@/components/dashboard/TopicSidebar';
import { EventTimeline } from '@/components/dashboard/EventTimeline';

export default function TimelinePage() {
  const [selectedTopic, setSelectedTopic] = useState('all');

  return (
    <>
      <TopicSidebar selected={selectedTopic} onSelect={setSelectedTopic} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <EventTimeline selectedTopic={selectedTopic} />
      </div>
    </>
  );
}
