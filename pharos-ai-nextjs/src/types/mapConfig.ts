export interface Viewport {
  center?: { lat: number; lon: number };
  zoom?: number;
  bbox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface MapMarker {
  markerId: string;
  position: { lat: number; lon: number };
  label: string;
  entityId?: string;
  type?: string;
  note: string;
  icon?: string;
}

export interface MapShape {
  shapeId: string;
  type: 'Polygon' | 'LineString' | 'Circle';
  coordinates: any;
  style?: {
    color?: string;
    opacity?: number;
  };
  note?: string;
}

export interface LayerToggle {
  layerKey: string;
  label: string;
  visible: boolean;
}

export interface MapConfig {
  configId: string;
  documentId: string;
  viewport: Viewport;
  markers: MapMarker[];
  shapes?: MapShape[];
  layers?: LayerToggle[];
}
