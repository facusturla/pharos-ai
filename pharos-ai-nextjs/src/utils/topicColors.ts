const TOPIC_COLORS = [
  'bg-red-100 text-red-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-yellow-100 text-yellow-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
  'bg-orange-100 text-orange-700',
  'bg-teal-100 text-teal-700',
  'bg-cyan-100 text-cyan-700',
];

const topicColorCache = new Map<string, string>();

export const getTopicColor = (topicName: string): string => {
  if (!topicName) return 'bg-gray-100 text-gray-700';
  const normalizedTopic = topicName.toLowerCase().trim();
  if (topicColorCache.has(normalizedTopic)) {
    return topicColorCache.get(normalizedTopic)!;
  }
  let hash = 0;
  for (let i = 0; i < normalizedTopic.length; i++) {
    const char = normalizedTopic.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const colorIndex = Math.abs(hash) % TOPIC_COLORS.length;
  const color = TOPIC_COLORS[colorIndex];
  topicColorCache.set(normalizedTopic, color);
  return color;
};

export const getAllTopicColors = (): string[] => [...TOPIC_COLORS];
export const clearTopicColorCache = (): void => { topicColorCache.clear(); };
