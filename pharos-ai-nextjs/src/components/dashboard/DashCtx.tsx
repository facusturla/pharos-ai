import { createContext } from 'react';
import type { ConflictDaySnapshot, IntelEvent, Actor, XPost, Conflict } from '@/types/domain';

export type DashData = {
  day: string;
  conflict: Conflict | null;
  snapshots: ConflictDaySnapshot[];
  events: IntelEvent[];
  actors: Actor[];
  xPosts: XPost[];
  allDays: string[];
};

export const DashCtx = createContext<DashData>({
  day: '',
  conflict: null,
  snapshots: [],
  events: [],
  actors: [],
  xPosts: [],
  allDays: [],
});
