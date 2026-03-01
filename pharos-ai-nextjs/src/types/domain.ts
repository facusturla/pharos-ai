// Central domain types for Pharos.
// All export type / export interface declarations live here.
// Data files in src/data/ import from here — they never define types.
// Component prop interfaces stay local to the component.

// ── Conflict ─────────────────────────────────────────────────────────────────

export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MONITORING';
export type ConflictStatus = 'ONGOING' | 'PAUSED' | 'CEASEFIRE' | 'RESOLVED';

// ── Actors ───────────────────────────────────────────────────────────────────

export type ActivityLevel = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MODERATE';
export type Stance = 'AGGRESSOR' | 'DEFENDER' | 'RETALIATING' | 'PROXY' | 'NEUTRAL' | 'CONDEMNING';

export interface RecentAction {
  date: string;
  type: 'MILITARY' | 'DIPLOMATIC' | 'POLITICAL' | 'ECONOMIC' | 'INTELLIGENCE';
  description: string;
  verified: boolean;
  significance: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Actor {
  id: string;
  name: string;
  fullName: string;
  countryCode?: string;
  type: 'STATE' | 'NON-STATE' | 'ORGANIZATION' | 'INDIVIDUAL';
  activityLevel: ActivityLevel;
  activityScore: number;
  stance: Stance;
  saying: string;
  doing: string[];
  assessment: string;
  recentActions: RecentAction[];
  keyFigures: string[];
  linkedEventIds: string[];
}

// ── Events ───────────────────────────────────────────────────────────────────

export type Severity = 'CRITICAL' | 'HIGH' | 'STANDARD';
export type EventType = 'MILITARY' | 'DIPLOMATIC' | 'INTELLIGENCE' | 'ECONOMIC' | 'HUMANITARIAN' | 'POLITICAL';

export interface Source {
  name: string;
  tier: 1 | 2 | 3;
  reliability: number;
  url?: string;
}

export interface ActorResponse {
  actorId: string;
  actorName: string;
  stance: 'SUPPORTING' | 'OPPOSING' | 'NEUTRAL' | 'UNKNOWN';
  type: string;
  statement: string;
}

export interface IntelEvent {
  id: string;
  timestamp: string;
  severity: Severity;
  type: EventType;
  title: string;
  location: string;
  summary: string;
  fullContent: string;
  verified: boolean;
  sources: Source[];
  actorResponses: ActorResponse[];
  tags: string[];
}

// ── X Posts (Field Signals) ───────────────────────────────────────────────────

export type Significance = 'BREAKING' | 'HIGH' | 'STANDARD';
export type AccountType = 'military' | 'government' | 'journalist' | 'analyst' | 'official';

export interface XPost {
  id: string;
  handle: string;
  displayName: string;
  avatar: string;
  avatarColor: string;
  verified: boolean;
  accountType: AccountType;
  significance: Significance;
  timestamp: string;
  content: string;
  images?: string[];
  videoThumb?: string;
  likes: number;
  retweets: number;
  replies: number;
  views: number;
  eventId?: string;
  actorId?: string;
  pharosNote?: string;
}

// ── Map data types live in src/data/mapData.ts + src/data/mapTokens.ts ───────
// (Not re-defined here — that system uses Extract<> from mapTokens which
//  requires co-location with the token types.)

// ── Map stories ───────────────────────────────────────────────────────────────

export interface StoryEvent {
  time: string;
  label: string;
  type: 'STRIKE' | 'RETALIATION' | 'INTEL' | 'NAVAL' | 'POLITICAL';
}

export interface MapStory {
  id: string;
  title: string;
  tagline: string;
  iconName: string;
  category: 'STRIKE' | 'RETALIATION' | 'NAVAL' | 'INTEL' | 'DIPLOMATIC';
  narrative: string;
  highlightStrikeIds: string[];
  highlightMissileIds: string[];
  highlightTargetIds: string[];
  highlightAssetIds: string[];
  viewState: { longitude: number; latitude: number; zoom: number };
  keyFacts: string[];
  timestamp: string;
  events: StoryEvent[];
}

// ── Prediction markets ────────────────────────────────────────────────────────

export interface MarketGroup {
  id: string;
  label: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  titleMatches: string[];
}
