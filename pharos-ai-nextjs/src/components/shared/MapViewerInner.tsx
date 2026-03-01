'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapConfig, MapMarker, MapShape, LayerToggle } from '@/types/mapConfig';
import { Switch } from '@/components/ui/switch';

const createCustomMarker = (type?: string, isActive = false) => {
  const getMarkerConfig = (t?: string) => {
    switch (t?.toLowerCase()) {
      case 'location': return { color: '#3b82f6', label: 'LOC' };
      case 'person': return { color: '#16a34a', label: 'PER' };
      case 'organization': return { color: '#7c3aed', label: 'ORG' };
      case 'event': return { color: '#ea580c', label: 'EVT' };
      case 'infrastructure': return { color: '#dc2626', label: 'INF' };
      case 'newschannel': return { color: '#ec4899', label: 'NEWS' };
      default: return { color: '#64748b', label: 'OTH' };
    }
  };
  const config = getMarkerConfig(type);
  const size = isActive ? 32 : 24;
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="white" stroke="${config.color}" stroke-width="2"/>
    <circle cx="16" cy="16" r="10" fill="${config.color}"/>
    <circle cx="16" cy="16" r="3" fill="white"/>
    <text x="16" y="6" text-anchor="middle" font-family="Arial" font-size="8" font-weight="bold" fill="${config.color}">${config.label}</text>
  </svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [size, size], iconAnchor: [size/2, size/2], popupAnchor: [0, -size/2] });
};

interface Props { config: MapConfig; }

const MapViewerInner: React.FC<Props> = ({ config }) => {
  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(new Set());
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  const getInitialCenter = (): [number, number] => {
    if (config.viewport?.center) return [config.viewport.center.lat, config.viewport.center.lon];
    if (config.markers.length > 0) {
      const lats = config.markers.map(m => m.position.lat);
      const lons = config.markers.map(m => m.position.lon);
      return [(Math.max(...lats) + Math.min(...lats)) / 2, (Math.max(...lons) + Math.min(...lons)) / 2];
    }
    return [20, 0];
  };

  const dynamicLayers = useMemo<LayerToggle[]>(() => {
    const types = new Set(config.markers.map(m => m.type?.toLowerCase()).filter(Boolean));
    const layers: LayerToggle[] = [];
    if (types.has('location')) layers.push({ layerKey: 'locations', label: 'Key Locations', visible: true });
    if (types.has('event')) layers.push({ layerKey: 'events', label: 'Event Sites', visible: true });
    if (types.has('infrastructure')) layers.push({ layerKey: 'infrastructure', label: 'Infrastructure', visible: true });
    if (types.has('person')) layers.push({ layerKey: 'persons', label: 'Key Figures', visible: true });
    if (types.has('organization')) layers.push({ layerKey: 'organizations', label: 'Organizations', visible: true });
    if (config.shapes?.length) layers.push({ layerKey: 'conflictZones', label: 'Conflict Zones', visible: true });
    return layers;
  }, [config]);

  useEffect(() => {
    setVisibleLayers(new Set(dynamicLayers.filter(l => l.visible).map(l => l.layerKey)));
  }, [dynamicLayers]);

  const toggleLayer = (key: string) => {
    setVisibleLayers(prev => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s; });
  };

  const typeToLayer: Record<string, string> = { location: 'locations', event: 'events', infrastructure: 'infrastructure', person: 'persons', organization: 'organizations' };
  const filteredMarkers = config.markers.filter(m => {
    const lk = typeToLayer[m.type?.toLowerCase() || ''];
    return !lk || visibleLayers.has(lk);
  });
  const filteredShapes = config.shapes?.filter(() => visibleLayers.has('conflictZones')) || [];

  const legendItems = useMemo(() => {
    const types = new Set(config.markers.map(m => m.type?.toLowerCase()).filter(Boolean));
    const items = [];
    if (types.has('location')) items.push({ color: 'bg-blue-500', label: 'LOCATION' });
    if (types.has('event')) items.push({ color: 'bg-orange-600', label: 'EVENT' });
    if (types.has('infrastructure')) items.push({ color: 'bg-red-600', label: 'INFRASTRUCTURE' });
    if (types.has('person')) items.push({ color: 'bg-green-600', label: 'PERSON' });
    if (types.has('organization')) items.push({ color: 'bg-purple-600', label: 'ORGANIZATION' });
    return items;
  }, [config]);

  const renderShape = (shape: MapShape) => {
    if (!shape.coordinates?.length) return null;
    const style = { color: shape.style?.color || '#dc2626', weight: 2, opacity: 0.8, fillOpacity: 0.1, dashArray: '5, 5' };
    if (shape.type === 'Polygon') {
      const ring = shape.coordinates[0];
      if (!Array.isArray(ring)) return null;
      const positions = ring.filter((c: any) => Array.isArray(c) && c.length >= 2).map((c: number[]) => [c[1], c[0]] as [number, number]);
      return <Polygon key={shape.shapeId} positions={positions} pathOptions={style}><Tooltip permanent={false} className=""><div><div className="font-bold text-xs tracking-wider">CONFLICT ZONE</div><div className="text-sm mt-1">{shape.note}</div></div></Tooltip></Polygon>;
    }
    if (shape.type === 'LineString') {
      const positions = shape.coordinates.filter((c: any) => Array.isArray(c) && c.length >= 2).map((c: number[]) => [c[1], c[0]] as [number, number]);
      return <Polyline key={shape.shapeId} positions={positions} pathOptions={style}><Tooltip permanent={false} className=""><div><div className="font-bold text-xs">ROUTE</div><div className="text-sm">{shape.note}</div></div></Tooltip></Polyline>;
    }
    return null;
  };

  const mapBounds = config.viewport.bbox ? new L.LatLngBounds([config.viewport.bbox.south, config.viewport.bbox.west], [config.viewport.bbox.north, config.viewport.bbox.east]) : undefined;

  return (
    <div className="w-full">
      <div className="mb-6 border-l-4 border-slate-900 bg-slate-50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold tracking-wider text-slate-900 uppercase font-sans text-sm uppercase tracking-[0.05em]">LIVE INTELLIGENCE</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1 font-sans font-bold tracking-tight">Regional Intelligence Map</h2>
        <p className="text-sm text-slate-600 font-serif leading-relaxed">Interactive geospatial analysis of key locations and operational zones</p>
      </div>

      {dynamicLayers.length > 0 && (
        <div className="mb-6 bg-white border border-slate-300 rounded-lg overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-300 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-wider uppercase font-sans text-sm uppercase tracking-[0.05em]">Intelligence Layers</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            {dynamicLayers.map((layer) => (
              <div key={layer.layerKey} className="flex items-center justify-between p-3 bg-slate-50 rounded border">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded ${layer.layerKey === 'infrastructure' ? 'bg-red-600' : layer.layerKey === 'events' ? 'bg-orange-600' : layer.layerKey === 'locations' ? 'bg-blue-600' : layer.layerKey === 'persons' ? 'bg-green-600' : layer.layerKey === 'organizations' ? 'bg-purple-600' : 'bg-red-600'}`}></div>
                  <label className="text-sm font-medium text-slate-700 cursor-pointer font-serif leading-relaxed">{layer.label}</label>
                </div>
                <Switch checked={visibleLayers.has(layer.layerKey)} onCheckedChange={() => toggleLayer(layer.layerKey)} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-96 w-full rounded-lg overflow-hidden border border-slate-300 shadow-sm">
        <MapContainer
          center={getInitialCenter()}
          zoom={config.viewport?.zoom || 6}
          bounds={mapBounds}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
          />
          {filteredMarkers.map((marker) => (
            <Marker
              key={marker.markerId}
              position={[marker.position.lat, marker.position.lon]}
              icon={createCustomMarker(marker.type, hoveredMarker === marker.markerId)}
              eventHandlers={{ mouseover: () => setHoveredMarker(marker.markerId), mouseout: () => setHoveredMarker(null) }}
            >
              <Tooltip permanent={false} className="" direction="top" offset={[0, -10]}>
                <div className="min-w-48">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs tracking-wider uppercase">{marker.type || 'LOCATION'}</span>
                    <span className="text-xs text-slate-300">{marker.markerId}</span>
                  </div>
                  <div className="font-bold text-sm mb-1">{marker.label}</div>
                  <div className="text-xs text-slate-300 leading-relaxed">{marker.note}</div>
                </div>
              </Tooltip>
            </Marker>
          ))}
          {filteredShapes.map(renderShape)}
        </MapContainer>
      </div>

      {legendItems.length > 0 && (
        <div className="mt-4 bg-white border border-slate-300 rounded-lg overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-300 px-4 py-2">
            <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase font-sans text-sm uppercase tracking-[0.05em]">Intelligence Classification</h3>
          </div>
          <div className="p-4 grid grid-cols-3 md:grid-cols-6 gap-4 text-xs">
            {legendItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border-2 ${item.color}`}></div>
                <span className="font-medium text-slate-700 uppercase tracking-wide">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapViewerInner;
