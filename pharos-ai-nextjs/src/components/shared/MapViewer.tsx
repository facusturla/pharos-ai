'use client';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MapConfig, LayerToggle } from '@/types/mapConfig';

// Dynamically import the actual map to avoid SSR issues with Leaflet
const MapViewerInner = dynamic(() => import('./MapViewerInner'), { ssr: false, loading: () => (
  <div className="h-96 w-full bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center">
    <div className="text-slate-500 font-serif leading-relaxed text-sm">Loading map...</div>
  </div>
)});

interface MapViewerProps { config: MapConfig; }

const MapViewer: React.FC<MapViewerProps> = ({ config }) => <MapViewerInner config={config} />;

export default MapViewer;
