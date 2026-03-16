import { NextRequest } from 'next/server';

import { err,ok } from '@/server/lib/api-utils';
import { prisma } from '@/server/lib/db';

function normalizeViewState(viewState: unknown) {
  const value = (viewState ?? {}) as {
    center?: [number, number];
    latitude?: number;
    longitude?: number;
    zoom?: number;
  };

  if (typeof value.longitude === 'number' && typeof value.latitude === 'number') {
    return {
      longitude: value.longitude,
      latitude: value.latitude,
      zoom: value.zoom ?? 6,
    };
  }

  if (Array.isArray(value.center) && value.center.length === 2) {
    return {
      longitude: value.center[0],
      latitude: value.center[1],
      zoom: value.zoom ?? 6,
    };
  }

  return {
    longitude: 35.2,
    latitude: 31.5,
    zoom: value.zoom ?? 6,
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const stories = await prisma.mapStory.findMany({
    where: { conflictId: id },
    orderBy: { timestamp: 'asc' },
    include: {
      events: { orderBy: { ord: 'asc' } },
    },
  });

  if (stories.length === 0 && !(await prisma.conflict.findUnique({ where: { id } }))) {
    return err('NOT_FOUND', `Conflict ${id} not found`, 404);
  }

  const data = stories.map((s) => ({
      id: s.id,
      primaryEventId: s.primaryEventId,
      sourceEventIds: s.sourceEventIds,
      title: s.title,
      tagline: s.tagline,
      iconName: s.iconName,
      category: s.category,
      narrative: s.narrative,
      highlightStrikeIds: s.highlightStrikeIds,
      highlightMissileIds: s.highlightMissileIds,
      highlightTargetIds: s.highlightTargetIds,
      highlightAssetIds: s.highlightAssetIds,
      viewState: normalizeViewState(s.viewState),
      keyFacts: s.keyFacts,
      timestamp: s.timestamp.toISOString(),
      events: s.events.map((e) => ({
        time: e.time,
        label: e.label,
        type: e.type,
      })),
    }));

  return ok(data, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  });
}
