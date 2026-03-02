'use client';

import { useState } from 'react';

import StoryCard from './StoryCard';
import StoryTimeline from './StoryTimeline';

import { MAP_STORIES } from '@/data/mapStories';

import type { MapStory } from '@/data/mapStories';

const SORTED_STORIES = [...MAP_STORIES].sort(
  (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
);

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  isOpen:          boolean;
  activeStory:     MapStory | null;
  onToggle:        () => void;
  onActivateStory: (story: MapStory) => void;
  onClearStory:    () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapSidebar({ isOpen, activeStory, onToggle, onActivateStory, onClearStory }: Props) {
  const [openStoryId, setOpenStoryId] = useState<string | null>(null);

  const handleToggleStory = (story: MapStory) => {
    const opening = openStoryId !== story.id;
    setOpenStoryId(opening ? story.id : null);
    if (opening) onActivateStory(story);
    else onClearStory();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      width:         320,
      flexShrink:    0,
      display:       'flex',
      flexDirection: 'column',
      background:    'var(--bg-app)',
      borderRight:   '1px solid var(--bd)',
      overflow:      'hidden',
    }}>
      {/* Header */}
      <div className="panel-header">
        <span style={{ color: 'var(--blue)', fontWeight: 700, fontSize: 12 }}>◈ STORIES</span>
        <span className="label" style={{
          background: 'var(--bg-3)', color: 'var(--t4)',
          padding: '1px 6px', borderRadius: 2, marginLeft: 4,
        }}>AI CURATED</span>
        <span style={{
          background: 'var(--blue-dim)', color: 'var(--blue-l)',
          fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 10, marginLeft: 2,
        }}>{MAP_STORIES.length}</span>
        <button
          onClick={onToggle}
          style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--t4)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px' }}
        >‹</button>
      </div>

      {/* Timeline */}
      <StoryTimeline
        stories={SORTED_STORIES}
        activeId={activeStory?.id ?? null}
        onActivate={(story) => { setOpenStoryId(story.id); onActivateStory(story); }}
      />

      {/* Stories list */}
      <div className="panel-body">
        {SORTED_STORIES.map(story => (
          <StoryCard
            key={story.id}
            story={story}
            isOpen={openStoryId === story.id}
            onToggle={() => handleToggleStory(story)}
            onFlyTo={() => onActivateStory(story)}
          />
        ))}
      </div>
    </div>
  );
}
