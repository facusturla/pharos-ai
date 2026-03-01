'use client';

import { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { ArcLayer, ScatterplotLayer, TextLayer, PolygonLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { PickingInfo } from '@deck.gl/core';
import type { MapViewState } from '@deck.gl/core';

import {
  STRIKE_ARCS,
  MISSILE_TRACKS,
  TARGETS,
  ALLIED_ASSETS,
  THREAT_ZONES,
  HEAT_POINTS,
  type StrikeArc,
  type MissileTrack,
  type Target,
  type Asset,
  type ThreatZone,
  type HeatPoint,
} from '@/data/mapData';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 51.0,
  latitude: 30.0,
  zoom: 4.5,
  pitch: 0,
  bearing: 0,
};

interface LayerVisibility {
  strikes: boolean;
  missiles: boolean;
  targets: boolean;
  assets: boolean;
  zones: boolean;
  heat: boolean;
}

type TooltipObject = StrikeArc | MissileTrack | Target | Asset | ThreatZone | HeatPoint;

export default function IntelMap() {
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
  const [visibility, setVisibility] = useState<LayerVisibility>({
    strikes: true,
    missiles: true,
    targets: true,
    assets: true,
    zones: true,
    heat: true,
  });

  const toggleLayer = (key: keyof LayerVisibility) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const layers = [
    visibility.heat &&
      new HeatmapLayer<HeatPoint>({
        id: 'heat',
        data: HEAT_POINTS,
        getPosition: (d: HeatPoint): [number, number] => d.position,
        getWeight: (d: HeatPoint): number => d.weight,
        radiusPixels: 60,
        intensity: 1,
        threshold: 0.03,
        colorRange: [
          [255, 255, 178, 25],
          [254, 204, 92, 80],
          [253, 141, 60, 120],
          [240, 59, 32, 160],
          [189, 0, 38, 200],
        ],
      }),

    visibility.zones &&
      new PolygonLayer<ThreatZone>({
        id: 'zones',
        data: THREAT_ZONES,
        getPolygon: (d: ThreatZone): [number, number][] => d.coordinates,
        getFillColor: (d: ThreatZone): [number, number, number, number] => d.color,
        getLineColor: (d: ThreatZone): [number, number, number, number] => [d.color[0], d.color[1], d.color[2], 200],
        lineWidthMinPixels: 1,
        filled: true,
        stroked: true,
        pickable: true,
      }),

    visibility.strikes &&
      new ArcLayer<StrikeArc>({
        id: 'strikes',
        data: STRIKE_ARCS,
        getSourcePosition: (d: StrikeArc): [number, number] => d.from,
        getTargetPosition: (d: StrikeArc): [number, number] => d.to,
        getSourceColor: (d: StrikeArc): [number, number, number] =>
          d.type === 'NAVAL' ? [50, 200, 200] : d.type === 'ISRAEL_STRIKE' ? [50, 200, 120] : [45, 114, 210],
        getTargetColor: (): [number, number, number, number] => [255, 255, 255, 180],
        getWidth: 2,
        pickable: true,
      }),

    visibility.missiles &&
      new ArcLayer<MissileTrack>({
        id: 'missiles',
        data: MISSILE_TRACKS,
        getSourcePosition: (d: MissileTrack): [number, number] => d.from,
        getTargetPosition: (d: MissileTrack): [number, number] => d.to,
        getSourceColor: (): [number, number, number] => [210, 50, 50],
        getTargetColor: (d: MissileTrack): [number, number, number, number] =>
          d.intercepted ? [255, 200, 0, 200] : [255, 50, 50, 220],
        getWidth: (d: MissileTrack): number => (d.intercepted ? 1 : 2),
        pickable: true,
      }),

    visibility.targets &&
      new ScatterplotLayer<Target>({
        id: 'targets',
        data: TARGETS,
        getPosition: (d: Target): [number, number] => d.position,
        getRadius: (d: Target): number =>
          d.status === 'DESTROYED' ? 18000 : d.status === 'DAMAGED' ? 14000 : 10000,
        getFillColor: (d: Target): [number, number, number, number] =>
          d.status === 'DESTROYED'
            ? [220, 50, 50, 200]
            : d.status === 'DAMAGED'
            ? [220, 150, 50, 200]
            : [220, 200, 50, 200],
        stroked: true,
        getLineColor: (): [number, number, number, number] => [255, 255, 255, 100],
        lineWidthMinPixels: 1,
        pickable: true,
      }),

    visibility.assets &&
      new ScatterplotLayer<Asset>({
        id: 'assets',
        data: ALLIED_ASSETS,
        getPosition: (d: Asset): [number, number] => d.position,
        getRadius: (d: Asset): number => (d.type === 'CARRIER' ? 20000 : 14000),
        getFillColor: (d: Asset): [number, number, number, number] =>
          d.nation === 'US' ? [45, 114, 210, 220] : [50, 200, 200, 220],
        stroked: true,
        getLineColor: (): [number, number, number, number] => [255, 255, 255, 150],
        lineWidthMinPixels: 1,
        pickable: true,
      }),

    visibility.targets &&
      new TextLayer<Target>({
        id: 'target-labels',
        data: TARGETS,
        getPosition: (d: Target): [number, number] => d.position,
        getText: (d: Target): string => d.name,
        getSize: 11,
        getColor: (): [number, number, number, number] => [220, 220, 220, 200],
        getPixelOffset: (): [number, number] => [0, -20],
        fontFamily: 'SFMono-Regular, Menlo, monospace',
        background: true,
        getBackgroundColor: (): [number, number, number, number] => [28, 33, 39, 200],
        backgroundPadding: [3, 2, 3, 2] as [number, number, number, number],
      }),

    visibility.assets &&
      new TextLayer<Asset>({
        id: 'asset-labels',
        data: ALLIED_ASSETS,
        getPosition: (d: Asset): [number, number] => d.position,
        getText: (d: Asset): string => d.name,
        getSize: 10,
        getColor: (): [number, number, number, number] => [150, 200, 255, 200],
        getPixelOffset: (): [number, number] => [0, -22],
        fontFamily: 'SFMono-Regular, Menlo, monospace',
        background: true,
        getBackgroundColor: (): [number, number, number, number] => [28, 33, 39, 200],
        backgroundPadding: [3, 2, 3, 2] as [number, number, number, number],
      }),
  ].filter(Boolean);

  const getTooltip = ({ object }: PickingInfo<TooltipObject>) => {
    if (!object) return null;
    const obj = object as unknown as Record<string, unknown>;
    const hasContent = obj.label || obj.name || obj.description;
    if (!hasContent) return null;
    return {
      html: `<div style="background:#1C2127;border:1px solid #404854;padding:6px 8px;font-size:11px;font-family:monospace;color:#E8E8E8;max-width:220px">${obj.label || obj.name}${obj.description ? `<br><span style="color:#8F99A8;font-size:10px">${String(obj.description)}</span>` : ''}</div>`,
      style: { backgroundColor: 'transparent', border: 'none', padding: '0' },
    };
  };

  const buttonConfig: Array<{
    key: keyof LayerVisibility;
    label: string;
    active: { bg: string; border: string; color: string };
  }> = [
    { key: 'strikes', label: 'STRIKES', active: { bg: '#1C3A5E', border: '#2D72D2', color: '#4C9BE8' } },
    { key: 'missiles', label: 'MISSILES', active: { bg: '#3A1C1C', border: '#D23232', color: '#E84C4C' } },
    { key: 'targets', label: 'TARGETS', active: { bg: '#3A2A1C', border: '#D27832', color: '#E8A84C' } },
    { key: 'assets', label: 'ASSETS', active: { bg: '#1C3A3A', border: '#32C8C8', color: '#4CE8E8' } },
    { key: 'zones', label: 'ZONES', active: { bg: '#3A3A1C', border: '#C8C832', color: '#E8E84C' } },
    { key: 'heat', label: 'HEAT', active: { bg: '#2A1C3A', border: '#8232D2', color: '#B84CE8' } },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1C2127' }}>
      {/* Title Bar */}
      <div
        style={{
          height: 36,
          background: 'var(--bg-app)',
          borderBottom: '1px solid var(--bd)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 8,
          flexShrink: 0,
        }}
      >
        <span style={{ color: '#2D72D2', fontWeight: 700, fontSize: 11, fontFamily: 'monospace' }}>◈ INTEL MAP</span>
        <span style={{ color: '#8F99A8', fontSize: 9, fontFamily: 'monospace', marginLeft: 4 }}>
          OPERATION EPIC FURY
        </span>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#32C832',
            display: 'inline-block',
            marginLeft: 4,
          }}
        />
        <span style={{ color: '#32C832', fontSize: 9, fontFamily: 'monospace' }}>LIVE</span>

        {/* Toggle buttons */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {buttonConfig.map(({ key, label, active }) => {
            const isActive = visibility[key];
            return (
              <button
                key={key}
                onClick={() => toggleLayer(key)}
                style={{
                  padding: '2px 6px',
                  borderRadius: 2,
                  fontSize: 8,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  border: `1px solid ${isActive ? active.border : '#404854'}`,
                  background: isActive ? active.bg : '#252A31',
                  color: isActive ? active.color : '#5C7080',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <DeckGL
          viewState={viewState}
          onViewStateChange={({ viewState: vs }) => setViewState(vs as MapViewState)}
          controller={true}
          layers={layers}
          getTooltip={getTooltip as (info: PickingInfo) => ReturnType<typeof getTooltip>}
          style={{ width: '100%', height: '100%' }}
        >
          <Map mapStyle={MAP_STYLE} />
        </DeckGL>

        {/* Legend */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 12,
            background: 'rgba(28,33,39,0.92)',
            border: '1px solid #404854',
            borderRadius: 2,
            padding: '10px 12px',
            fontFamily: 'monospace',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 8, color: '#5C7080', marginBottom: 6 }}>LEGEND</div>
          {[
            { color: '#2D72D2', shape: 'rect', label: 'US STRIKE TRACK' },
            { color: '#32C878', shape: 'rect', label: 'IDF STRIKE TRACK' },
            { color: '#32C8C8', shape: 'rect', label: 'NAVAL STRIKE' },
            { color: '#D23232', shape: 'rect', label: 'HOSTILE MISSILE' },
            { color: '#FFC800', shape: 'rect', label: 'INTERCEPTED MISSILE' },
            { color: '#DC3232', shape: 'circle', label: 'DESTROYED TARGET' },
            { color: '#DC9632', shape: 'circle', label: 'DAMAGED TARGET' },
            { color: '#DCC832', shape: 'circle', label: 'TARGETED' },
            { color: '#2D72D2', shape: 'circle', label: 'US ASSET' },
            { color: '#32C8C8', shape: 'circle', label: 'IDF ASSET' },
            { color: '#DC3232', shape: 'zone', label: 'CLOSURE ZONE' },
            { color: '#DC9632', shape: 'zone', label: 'PATROL ZONE' },
          ].map(({ color, shape, label }) => (
            <div
              key={label}
              style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, fontSize: 9, color: '#8F99A8' }}
            >
              {shape === 'rect' ? (
                <div style={{ width: 12, height: 3, background: color, flexShrink: 0 }} />
              ) : shape === 'zone' ? (
                <div style={{ width: 10, height: 8, background: color + '44', border: `1px solid ${color}`, flexShrink: 0 }} />
              ) : (
                <div
                  style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }}
                />
              )}
              {label}
            </div>
          ))}
        </div>

        {/* Coords */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 12,
            background: 'rgba(28,33,39,0.85)',
            border: '1px solid #404854',
            padding: '4px 8px',
            fontSize: 9,
            fontFamily: 'monospace',
            color: '#5C7080',
            pointerEvents: 'none',
          }}
        >
          {viewState.latitude.toFixed(2)}°N {viewState.longitude.toFixed(2)}°E
        </div>
      </div>
    </div>
  );
}
