export type ConflictStatus = 'CRITICAL' | 'ESCALATING' | 'ELEVATED' | 'MONITORING' | 'DE-ESCALATING';

export interface Conflict {
  id: string;
  name: string;
  shortName: string;
  region: string;
  status: ConflictStatus;
  escalationScore: number; // 0–100
  trend: 'UP' | 'DOWN' | 'STABLE';
  criticalToday: number;
  highToday: number;
  standardToday: number;
  lastUpdated: string;
  keyDevelopments: string[];
  actors: string[];
  accentColor: string;
}

export const CONFLICTS: Conflict[] = [
  {
    id: 'middle-east',
    name: 'Middle East Conflict',
    shortName: 'MIDDLE EAST',
    region: 'Gaza Strip / Israel / Iran',
    status: 'ESCALATING',
    escalationScore: 78,
    trend: 'UP',
    criticalToday: 3,
    highToday: 5,
    standardToday: 8,
    lastUpdated: '2 min ago',
    keyDevelopments: [
      'IDF confirms targeted precision strikes in northern Gaza',
      'EU foreign ministers call emergency session',
      'US carrier group repositioned to Eastern Med',
    ],
    actors: ['idf', 'iran', 'hamas', 'hezbollah', 'us', 'eu', 'egypt'],
    accentColor: '#dc2626',
  },
  {
    id: 'ukraine',
    name: 'Ukraine–Russia War',
    shortName: 'UKRAINE',
    region: 'Eastern Ukraine / Black Sea',
    status: 'ELEVATED',
    escalationScore: 45,
    trend: 'STABLE',
    criticalToday: 2,
    highToday: 8,
    standardToday: 12,
    lastUpdated: '17 min ago',
    keyDevelopments: [
      'Russian forces report significant buildup near Kharkiv',
      'NATO reinforces eastern flank with additional battalions',
    ],
    actors: ['russia', 'ukraine', 'nato', 'us', 'eu'],
    accentColor: '#2563eb',
  },
  {
    id: 'china-taiwan',
    name: 'China–Taiwan Tensions',
    shortName: 'CHINA–TAIWAN',
    region: 'Taiwan Strait / South China Sea',
    status: 'MONITORING',
    escalationScore: 32,
    trend: 'STABLE',
    criticalToday: 0,
    highToday: 2,
    standardToday: 5,
    lastUpdated: '1 hr ago',
    keyDevelopments: [
      'PLA conducts routine patrol near median line',
      'Taiwan activates air defense tracking systems',
    ],
    actors: ['china', 'taiwan', 'us', 'japan'],
    accentColor: '#f97316',
  },
  {
    id: 'nato-europe',
    name: 'NATO & European Security',
    shortName: 'NATO / EUROPE',
    region: 'Eastern Europe / Baltic',
    status: 'ELEVATED',
    escalationScore: 41,
    trend: 'UP',
    criticalToday: 1,
    highToday: 4,
    standardToday: 7,
    lastUpdated: '45 min ago',
    keyDevelopments: [
      'NATO Article 4 consultations initiated by Poland',
      'Baltic states request additional air patrol assets',
    ],
    actors: ['nato', 'russia', 'poland', 'us', 'eu'],
    accentColor: '#7c3aed',
  },
  {
    id: 'cyber',
    name: 'Cyber Warfare & Espionage',
    shortName: 'CYBER',
    region: 'Global',
    status: 'ELEVATED',
    escalationScore: 55,
    trend: 'UP',
    criticalToday: 1,
    highToday: 3,
    standardToday: 9,
    lastUpdated: '30 min ago',
    keyDevelopments: [
      'State-sponsored APT group targets European energy infrastructure',
      'Critical water treatment facility breach confirmed in Israel',
    ],
    actors: ['russia', 'china', 'iran', 'us'],
    accentColor: '#16a34a',
  },
];

export const STATUS_STYLE: Record<ConflictStatus, { label: string; color: string; bg: string }> = {
  CRITICAL:       { label: 'CRITICAL',       color: '#dc2626', bg: '#fef2f2' },
  ESCALATING:     { label: 'ESCALATING',     color: '#ea580c', bg: '#fff7ed' },
  ELEVATED:       { label: 'ELEVATED',       color: '#d97706', bg: '#fffbeb' },
  MONITORING:     { label: 'MONITORING',     color: '#64748b', bg: '#f8fafc' },
  'DE-ESCALATING':{ label: 'DE-ESCALATING', color: '#16a34a', bg: '#f0fdf4' },
};
