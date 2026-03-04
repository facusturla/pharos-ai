'use client';

import dynamic from 'next/dynamic';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useIsLandscapePhone } from '@/hooks/use-is-landscape-phone';
import { useMapPage } from '@/components/map/use-map-page';

const LandscapeMapLayout = dynamic(() => import('@/components/map/landscape/MapLayout'), { ssr: false });
const MobileMapLayout    = dynamic(() => import('@/components/map/mobile/MapLayout'),    { ssr: false });
const DesktopMapLayout   = dynamic(() => import('@/components/map/desktop/MapLayout'),   { ssr: false });

export default function FullMapPage({ embedded = false }: { embedded?: boolean }) {
  const isLandscapePhone = useIsLandscapePhone();
  const isMobile = useIsMobile(1024);
  const ctx = useMapPage({ isMobile: isMobile || isLandscapePhone });

  // Clear stale transitionDuration when layout mode changes
  // so DeckGL doesn't try to animate on fresh mount
  const mode = isLandscapePhone ? 'landscape' : isMobile ? 'mobile' : 'desktop';

  if (isLandscapePhone) return <LandscapeMapLayout key={mode} ctx={ctx} embedded={embedded} />;
  if (isMobile) return <MobileMapLayout key={mode} ctx={ctx} embedded={embedded} />;
  return <DesktopMapLayout key={mode} ctx={ctx} embedded={embedded} />;
}
