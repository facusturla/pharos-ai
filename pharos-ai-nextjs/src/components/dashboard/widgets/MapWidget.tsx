'use client';

import dynamic from 'next/dynamic';

const FullMapPage = dynamic(() => import('@/components/map/MapPageContent'), { ssr: false });

export function MapWidget() {
  return (
    <div className="h-full w-full">
      <FullMapPage embedded />
    </div>
  );
}
