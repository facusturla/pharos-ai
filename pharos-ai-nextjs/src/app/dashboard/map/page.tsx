'use client';

/**
 * Thin shell — delegates all work to a dynamically-loaded chunk.
 *
 * WHY: Next.js 16 Turbopack evaluates every route chunk in its own module scope.
 * If map/page.tsx statically imports @deck.gl/react → @luma.gl/core, Turbopack
 * re-evaluates @luma.gl/core when navigating here, replacing globalThis.luma with
 * a fresh empty Luma instance that has no registered adapters → crash.
 *
 * Wrapping the real content in next/dynamic({ssr:false}) puts luma.gl in an async
 * chunk that shares the browser module cache with IntelMap's chunk on the dashboard
 * — luma.gl is only ever evaluated once.
 */

import dynamic from 'next/dynamic';

const MapPageContent = dynamic(
  () => import('@/components/map/MapPageContent'),
  { ssr: false },
);

export default function FullMapPage() {
  return <MapPageContent />;
}
