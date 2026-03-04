/**
 * GET /api/v1/admin/{conflictId}/workspace
 *
 * Returns a complete daily work plan for the Pharos agent.
 * This is the FULL session guide — not just a gap checker.
 * Covers every data model the dashboard consumes.
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ok, err } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/admin-auth';
import { MAP_ACTOR_KEYS } from '@/lib/admin-validate';

type Priority = 'P1' | 'P2' | 'P3';

type TodoItem = {
  priority: Priority;
  category: string;
  title: string;
  description: string;
  action: string;
  count?: number;
  items?: unknown[];
  suggestSubagent?: boolean;
  subagentHint?: string;
};

type ResearchTask = {
  priority: Priority;
  title: string;
  hint: string;
};

// Daily content targets — how much content a full day should have
const TARGETS = {
  eventsPerDay: 18,       // ~18 events across the conflict day
  xPostsPerDay: 12,       // ~12 X posts from key accounts
  mapFeaturesPerDay: 12,  // ~12 kinetic + installation features
  storiesPerDay: 3,       // 2-3 map stories
};

// Hour buckets for time-aware targets
// Morning (06-12 UTC): 40% of day targets
// Afternoon (12-18 UTC): 40%
// Evening (18-24 UTC): 20% — less expected
function getDayProgressFraction(): number {
  const hour = new Date().getUTCHours();
  if (hour < 6)  return 0.1;
  if (hour < 12) return 0.4;
  if (hour < 18) return 0.75;
  return 1.0;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conflictId: string }> },
) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { conflictId } = await params;

  const conflict = await prisma.conflict.findUnique({ where: { id: conflictId } });
  if (!conflict) return err('NOT_FOUND', `Conflict ${conflictId} not found`, 404);

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const todayStart = new Date(today + 'T00:00:00Z');
  const yesterday = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

  const dayProgress = getDayProgressFraction();
  const currentHourUTC = now.getUTCHours();

  // ── Parallel DB queries ───────────────────────────────────────────────────

  // Fetch actors first (needed for actorActions query below)
  const actors = await prisma.actor.findMany({
    where: { conflictId },
    select: { id: true, name: true, mapKey: true },
  });

  const [
    todaySnapshot,
    actorSnapshotsToday,
    eventsToday,
    eventsWithoutSources,
    eventsWithoutResponses,
    xPostsToday,
    unlinkedXPosts,
    mapFeaturesToday,
    allMapFeatures,
    allMapStories,
    storiesToday,
    actorActionsToday,
  ] = await Promise.all([
    prisma.conflictDaySnapshot.findFirst({
      where: { conflictId, day: todayStart },
      select: { id: true, escalation: true, keyFacts: true },
    }),
    prisma.actorDaySnapshot.findMany({
      where: { day: todayStart },
      select: { actorId: true },
    }),
    prisma.intelEvent.findMany({
      where: { conflictId, timestamp: { gte: todayStart } },
      select: { id: true, title: true, timestamp: true, type: true, severity: true },
      orderBy: { timestamp: 'desc' },
    }),
    prisma.intelEvent.findMany({
      where: { conflictId, sources: { none: {} } },
      select: { id: true, title: true, timestamp: true },
      orderBy: { timestamp: 'desc' },
      take: 30,
    }),
    prisma.$queryRaw<{ id: string; title: string; timestamp: Date }[]>`
      SELECT ie.id, ie.title, ie.timestamp
      FROM "IntelEvent" ie
      WHERE ie."conflictId" = ${conflictId}
        AND NOT EXISTS (
          SELECT 1 FROM "EventActorResponse" ear WHERE ear."eventId" = ie.id
        )
      ORDER BY ie.timestamp DESC
      LIMIT 30
    `,
    prisma.xPost.count({
      where: { conflictId, timestamp: { gte: todayStart } },
    }),
    prisma.xPost.findMany({
      where: { conflictId, eventId: null },
      select: { id: true, handle: true, significance: true, timestamp: true },
      orderBy: { timestamp: 'desc' },
      take: 20,
    }),
    prisma.mapFeature.count({
      where: { conflictId, timestamp: { gte: todayStart } },
    }),
    prisma.mapFeature.findMany({
      where: { conflictId },
      select: { id: true, actor: true, priority: true, featureType: true },
    }),
    prisma.mapStory.findMany({
      where: { conflictId },
      select: {
        id: true,
        title: true,
        timestamp: true,
        highlightStrikeIds: true,
        highlightMissileIds: true,
        highlightTargetIds: true,
        highlightAssetIds: true,
      },
    }),
    prisma.mapStory.count({
      where: { conflictId, timestamp: { gte: todayStart } },
    }),
    prisma.actorAction.count({
      where: { actorId: { in: actors.map(a => a.id) }, date: { startsWith: today } },
    }),
  ]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const actorIdsWithSnapshot = new Set(actorSnapshotsToday.map(s => s.actorId));
  const actorsWithoutSnapshot = actors.filter(a => !actorIdsWithSnapshot.has(a.id));

  const featureIdSet = new Set(allMapFeatures.map(f => f.id));
  const brokenStoryRefs: { storyId: string; storyTitle: string; missingIds: string[] }[] = [];
  for (const story of allMapStories) {
    const allHighlightIds = [
      ...story.highlightStrikeIds,
      ...story.highlightMissileIds,
      ...story.highlightTargetIds,
      ...story.highlightAssetIds,
    ];
    const missing = allHighlightIds.filter(id => !featureIdSet.has(id));
    if (missing.length > 0) {
      brokenStoryRefs.push({ storyId: story.id, storyTitle: story.title, missingIds: missing });
    }
  }

  const invalidActorFeatures = allMapFeatures.filter(
    f => !(MAP_ACTOR_KEYS as readonly string[]).includes(f.actor),
  );

  // Time-adjusted targets (what's expected given the current time of day)
  const adjustedEventTarget = Math.round(TARGETS.eventsPerDay * dayProgress);
  const adjustedXPostTarget = Math.round(TARGETS.xPostsPerDay * dayProgress);
  const adjustedMapFeatureTarget = Math.round(TARGETS.mapFeaturesPerDay * dayProgress);

  const eventGap = Math.max(0, adjustedEventTarget - eventsToday.length);
  const xPostGap = Math.max(0, adjustedXPostTarget - xPostsToday);
  const mapFeatureGap = Math.max(0, adjustedMapFeatureTarget - mapFeaturesToday);
  const storyGap = Math.max(0, TARGETS.storiesPerDay - storiesToday);

  // ── Build todo list ───────────────────────────────────────────────────────

  const todos: TodoItem[] = [];

  // ── P1: Broken infrastructure ─────────────────────────────────────────────

  if (!todaySnapshot) {
    todos.push({
      priority: 'P1',
      category: 'Day Snapshot',
      title: `Create today's day snapshot (${today})`,
      description: 'No day snapshot exists for today. Required for the dashboard to show current escalation, casualties, economic chips, and scenarios. Must be created first — everything else depends on it.',
      action: `POST /api/v1/admin/${conflictId}/days`,
    });
  }

  if (brokenStoryRefs.length > 0) {
    todos.push({
      priority: 'P1',
      category: 'Map Stories',
      title: `Fix ${brokenStoryRefs.length} story/stories with broken map feature references`,
      description: 'Stories reference feature IDs that do not exist. Map highlights won\'t render. Fix by removing broken IDs or creating the missing features.',
      action: `PUT /api/v1/admin/${conflictId}/map/stories/{storyId}`,
      count: brokenStoryRefs.length,
      items: brokenStoryRefs.map(r => ({ storyId: r.storyId, title: r.storyTitle, missingIds: r.missingIds })),
    });
  }

  if (invalidActorFeatures.length > 0) {
    todos.push({
      priority: 'P1',
      category: 'Map Features',
      title: `Fix ${invalidActorFeatures.length} map feature(s) with invalid actor value`,
      description: `These features have non-valid actor values and will be hidden on the map. Valid: ${MAP_ACTOR_KEYS.join(', ')}`,
      action: `PUT /api/v1/admin/${conflictId}/map/features/{featureId}`,
      count: invalidActorFeatures.length,
      items: invalidActorFeatures.map(f => ({ id: f.id, currentActor: f.actor })),
    });
  }

  // ── P1/P2: Daily content production ──────────────────────────────────────

  if (eventGap > 0) {
    const isUrgent = eventGap >= 5 && currentHourUTC >= 10;
    todos.push({
      priority: isUrgent ? 'P1' : 'P2',
      category: 'Events',
      title: `Add Day 5 events — ${eventsToday.length} created, target ${adjustedEventTarget} by now (${TARGETS.eventsPerDay} total for full day)`,
      description: `Each event = one real intelligence development. Cover: airstrikes, retaliation, diplomatic moves, economic impacts, casualties, regional spillover. Each event needs: title, location, summary, fullContent (400+ chars), sources, then actor responses. Use ?enforcement=true before creating. IMPORTANT: use web_search as your primary source — NOT the RSS feed.`,
      action: `POST /api/v1/admin/${conflictId}/events?enforcement=true → POST /api/v1/admin/${conflictId}/events`,
      count: eventGap,
      suggestSubagent: eventGap >= 8,
      subagentHint: eventGap >= 8
        ? `Consider spawning a research subagent to gather raw news material first, then write ${eventGap} events. The subagent can web_search for latest developments while main session prepares other data.`
        : undefined,
    });
  }

  if (actorsWithoutSnapshot.length > 0) {
    todos.push({
      priority: 'P1',
      category: 'Actor Snapshots',
      title: `Create daily snapshots for ${actorsWithoutSnapshot.length} actor(s)`,
      description: `These actors don't have a snapshot for ${today}. Each needs: activityLevel, activityScore, stance, saying (a real quote or paraphrase), doing[] (3-5 current actions), and assessment (2-3 paragraph analysis).`,
      action: `POST /api/v1/admin/${conflictId}/actors/{actorId}/snapshots`,
      count: actorsWithoutSnapshot.length,
      items: actorsWithoutSnapshot.map(a => ({ id: a.id, name: a.name })),
    });
  }

  if (xPostGap > 0) {
    const isUrgent = xPostGap >= 6 && currentHourUTC >= 12;
    todos.push({
      priority: isUrgent ? 'P1' : 'P2',
      category: 'X Posts',
      title: `Add Day 5 X posts — ${xPostsToday} created, target ${adjustedXPostTarget} by now (${TARGETS.xPostsPerDay} total for full day)`,
      description: `Capture key statements from: CENTCOM, IDF Spokesperson, Trump, PM Netanyahu, IRGC, Iranian FM, UK MoD, Macron, relevant journalists. Each post needs: handle, displayName, accountType, significance (BREAKING/HIGH/STANDARD), content (full post text), pharosNote (why it matters), eventId (link to relevant event). Use web_search to find real statements — do NOT invent content.`,
      action: `POST /api/v1/admin/${conflictId}/x-posts?enforcement=true → POST /api/v1/admin/${conflictId}/x-posts`,
      count: xPostGap,
    });
  }

  if (mapFeatureGap > 0) {
    const isUrgent = mapFeatureGap >= 8 && currentHourUTC >= 14;
    todos.push({
      priority: isUrgent ? 'P1' : 'P2',
      category: 'Map Features',
      title: `Add Day 5 map features — ${mapFeaturesToday} today, target ${adjustedMapFeatureTarget} by now (${TARGETS.mapFeaturesPerDay} total for full day)`,
      description: `Add geographic features for today's events. Types needed: strike-arcs (US/Israel strikes on Iran), missile-tracks (Iranian retaliation), targets (struck installations), assets (US carriers, IDF positions), threat-zones (closure areas). Each needs: actor (UPPERCASE mapKey), priority (P1/P2/P3), type, geometry, properties, timestamp. Run ?enforcement=true first.`,
      action: `POST /api/v1/admin/${conflictId}/map/strike-arcs | missile-tracks | targets | assets | threat-zones`,
      count: mapFeatureGap,
      suggestSubagent: mapFeatureGap >= 6,
      subagentHint: mapFeatureGap >= 6
        ? 'Consider spawning a subagent to write map features in parallel while main session handles X posts or actor responses.'
        : undefined,
    });
  }

  if (storyGap > 0 && currentHourUTC >= 14) {
    todos.push({
      priority: 'P2',
      category: 'Map Stories',
      title: `Create map stories — ${storiesToday} today, target ${TARGETS.storiesPerDay}`,
      description: `Map stories explain the narrative arc of a specific 2-6 hour event window on the map. Each story needs: title (event-focused, no "Day N"), tagline, iconName, narrative (400+ chars), keyFacts (3+), events[] (2-3 timeline points), highlightStrikeIds/highlightMissileIds/highlightTargetIds (map connections). Run ?enforcement=true first.`,
      action: `POST /api/v1/admin/${conflictId}/map/stories?enforcement=true → POST /api/v1/admin/${conflictId}/map/stories`,
      count: storyGap,
    });
  }

  // ── P2: Actor actions (timeline entries per actor) ────────────────────────

  if (actorActionsToday === 0 && eventsToday.length >= 3) {
    todos.push({
      priority: 'P2',
      category: 'Actor Actions',
      title: `Add today's actor actions (0 created) — timeline entries per actor`,
      description: `Actor actions are the timeline record of what each faction did today. Add 2-4 actions per major actor (US, IDF, IRAN, IRGC, HEZBOLLAH, NATO). Each needs: actorId, date (${today}), type (MILITARY/DIPLOMATIC/POLITICAL/ECONOMIC/INTELLIGENCE), description, significance (HIGH/MEDIUM/LOW), verified (true/false).`,
      action: `POST /api/v1/admin/${conflictId}/actors/{actorId}/actions`,
    });
  }

  // ── P2: Data quality ──────────────────────────────────────────────────────

  if (eventsWithoutSources.length > 0) {
    todos.push({
      priority: 'P2',
      category: 'Event Sources',
      title: `Add sources to ${eventsWithoutSources.length} event(s)`,
      description: 'Events without sources fail /validate and reduce dashboard credibility. Add at least 1 source per event: name (e.g. "CENTCOM Press Release"), tier (1=official/2=major media/3=regional/4=social/5=unverified), reliability (0-100), url (optional).',
      action: `POST /api/v1/admin/${conflictId}/events/{eventId}/sources`,
      count: eventsWithoutSources.length,
      items: eventsWithoutSources.slice(0, 10).map(e => ({
        id: e.id,
        title: e.title,
        timestamp: e.timestamp,
      })),
    });
  }

  if (eventsWithoutResponses.length > 0) {
    todos.push({
      priority: 'P2',
      category: 'Actor Responses',
      title: `Add actor responses to ${eventsWithoutResponses.length} event(s)`,
      description: 'Actor responses connect events to actors — who did what, what stance did they take. Add 1-3 responses per event from the most relevant actors. Each needs: actorId, actorName, stance (SUPPORTING/OPPOSING/NEUTRAL/UNKNOWN), type (e.g. "Military Strike"), statement (what they said or did).',
      action: `POST /api/v1/admin/${conflictId}/actors/{actorId}/responses`,
      count: eventsWithoutResponses.length,
      items: eventsWithoutResponses.slice(0, 10).map(e => ({
        id: e.id,
        title: e.title,
        timestamp: e.timestamp,
      })),
    });
  }

  const breakingUnlinked = unlinkedXPosts.filter(p => p.significance === 'BREAKING');
  if (breakingUnlinked.length > 0) {
    todos.push({
      priority: 'P2',
      category: 'X Posts',
      title: `Link ${breakingUnlinked.length} BREAKING X post(s) to events`,
      description: 'BREAKING posts without an eventId are disconnected from the intelligence record. Link via PUT with the relevant eventId.',
      action: `PUT /api/v1/admin/${conflictId}/x-posts/{postId}`,
      count: breakingUnlinked.length,
      items: breakingUnlinked.map(p => ({ id: p.id, handle: p.handle })),
    });
  }

  // ── P3: Research tasks ────────────────────────────────────────────────────

  const researchTasks: ResearchTask[] = [
    {
      priority: 'P3',
      title: 'Fetch latest CENTCOM, IDF, and Pentagon statements',
      hint: 'web_search: "CENTCOM Iran strike Day 5" / "IDF Lebanon operations" / "Pentagon briefing Iran 2026". These are Tier-1 sources — events from official military statements are highest value.',
    },
    {
      priority: 'P3',
      title: 'Check Iranian leadership and succession developments',
      hint: 'web_search: "Mojtaba Khamenei successor" / "Iran supreme leader interim" / "IRGC leadership". Succession is the key political story of Day 5.',
    },
    {
      priority: 'P3',
      title: 'Pull economic data: oil, markets, shipping',
      hint: 'web_search: "Brent crude oil price Iran war" / "Strait of Hormuz shipping 2026" / "stock market Iran conflict". Economic chips and the economicNarrative in the day snapshot need real figures.',
    },
    {
      priority: 'P3',
      title: 'Check Hezbollah, Houthi, and PMF activity',
      hint: 'web_search: "Hezbollah rockets Israel Day 5" / "Houthi Red Sea attack" / "PMF Iraq drone strike". These proxy actors need daily snapshot updates.',
    },
    {
      priority: 'P3',
      title: 'Search for diplomatic and UN developments',
      hint: 'web_search: "UN Security Council Iran ceasefire" / "EU Iran diplomacy 2026" / "Turkey Iran mediation". Diplomatic events = DIPLOMATIC event type.',
    },
    {
      priority: 'P3',
      title: 'Check NATO and allied military posture',
      hint: 'web_search: "NATO Iran response" / "UK France military Middle East 2026" / "aircraft carrier Gulf deployment". Allied activity drives asset map features and NATO actor updates.',
    },
  ];

  // Only show research tasks if content is still needed
  const activeResearchTasks = (eventGap > 0 || xPostGap > 0) ? researchTasks : [];

  // ── Subagent hints ────────────────────────────────────────────────────────

  const subagentHints: { priority: string; task: string }[] = [];
  if (eventGap >= 8) {
    subagentHints.push({
      priority: 'HIGH',
      task: `Spawn a research subagent: give it the conflict context and ask it to write ${eventGap} events for Day 5 using web_search. While it works, main session can handle X posts and actor responses.`,
    });
  }
  if (mapFeatureGap >= 6 && eventGap <= 3) {
    subagentHints.push({
      priority: 'MEDIUM',
      task: `Spawn a subagent for map features: ${mapFeatureGap} kinetic/installation features needed for Day 5. Give it the existing event IDs and coordinates from the agent manual.`,
    });
  }

  // ── Summary ───────────────────────────────────────────────────────────────

  const p1Count = todos.filter(t => t.priority === 'P1').length;
  const p2Count = todos.filter(t => t.priority === 'P2').length;
  const p3Count = todos.filter(t => t.priority === 'P3').length;

  const timeOfDay =
    currentHourUTC < 6 ? 'early morning' :
    currentHourUTC < 12 ? 'morning' :
    currentHourUTC < 18 ? 'afternoon' :
    'evening';

  return ok({
    conflictId,
    today,
    timeOfDay,
    currentHourUTC,
    dayProgressPct: Math.round(dayProgress * 100),
    generatedAt: now.toISOString(),
    overview: {
      hasTodaySnapshot: !!todaySnapshot,
      escalation: todaySnapshot?.escalation ?? conflict.escalation,
      eventsToday: eventsToday.length,
      xPostsToday,
      mapFeaturesToday,
      storiesToday,
      actorActionsToday,
    },
    contentTargets: {
      events: { current: eventsToday.length, adjustedTarget: adjustedEventTarget, fullDayTarget: TARGETS.eventsPerDay, gap: eventGap },
      xPosts: { current: xPostsToday, adjustedTarget: adjustedXPostTarget, fullDayTarget: TARGETS.xPostsPerDay, gap: xPostGap },
      mapFeatures: { current: mapFeaturesToday, adjustedTarget: adjustedMapFeatureTarget, fullDayTarget: TARGETS.mapFeaturesPerDay, gap: mapFeatureGap },
      stories: { current: storiesToday, target: TARGETS.storiesPerDay, gap: storyGap },
    },
    todos,
    researchTasks: activeResearchTasks,
    subagentHints,
    summary: {
      total: todos.length,
      p1: p1Count,
      p2: p2Count,
      p3: p3Count,
      allClear: todos.length === 0,
      message:
        todos.length === 0
          ? `All clear — dashboard is fully populated for ${timeOfDay}.`
          : `${p1Count} critical, ${p2Count} standard, ${p3Count} low-priority items. It is ${timeOfDay} (${currentHourUTC}:00 UTC) — targets are time-adjusted to ${Math.round(dayProgress * 100)}% of daily goal.`,
    },
  });
}
