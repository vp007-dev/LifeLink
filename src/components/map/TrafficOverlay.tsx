import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { estimateTrafficLevel, TrafficLevel, TRAFFIC_MULTIPLIERS } from '@/lib/responderNetwork';

interface TrafficOverlayProps {
  map: L.Map | null;
  centerLocation: { lat: number; lng: number } | null;
  radiusKm?: number;
  enabled?: boolean;
}

// Traffic level colors (matching common traffic color schemes)
const TRAFFIC_COLORS: Record<TrafficLevel, string> = {
  free: '#22c55e',      // Green
  light: '#84cc16',     // Lime
  moderate: '#eab308',  // Yellow
  heavy: '#f97316',     // Orange
  severe: '#ef4444',    // Red
};

const TRAFFIC_LABELS: Record<TrafficLevel, string> = {
  free: 'Free Flow',
  light: 'Light Traffic',
  moderate: 'Moderate',
  heavy: 'Heavy Traffic',
  severe: 'Severe Congestion',
};

// Generate random road segments around a center point
const generateTrafficSegments = (
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  baseTrafficLevel: TrafficLevel
): Array<{ points: L.LatLngExpression[]; level: TrafficLevel }> => {
  const segments: Array<{ points: L.LatLngExpression[]; level: TrafficLevel }> = [];
  const kmToDeg = 0.009; // Approximately 1km in degrees
  
  // Traffic levels with their relative probabilities based on base level
  const trafficLevels: TrafficLevel[] = ['free', 'light', 'moderate', 'heavy', 'severe'];
  const baseIndex = trafficLevels.indexOf(baseTrafficLevel);
  
  // Generate main road segments radiating from center
  const numMainRoads = 6;
  for (let i = 0; i < numMainRoads; i++) {
    const angle = (i / numMainRoads) * 2 * Math.PI;
    const length = radiusKm * (0.5 + Math.random() * 0.5);
    
    // Create segments along the road
    const numSegments = Math.floor(length / 0.5) + 1;
    for (let j = 0; j < numSegments; j++) {
      const startDist = (j / numSegments) * length;
      const endDist = ((j + 1) / numSegments) * length;
      
      const startLat = centerLat + Math.sin(angle) * startDist * kmToDeg;
      const startLng = centerLng + Math.cos(angle) * startDist * kmToDeg / Math.cos(centerLat * Math.PI / 180);
      const endLat = centerLat + Math.sin(angle) * endDist * kmToDeg;
      const endLng = centerLng + Math.cos(angle) * endDist * kmToDeg / Math.cos(centerLat * Math.PI / 180);
      
      // Vary traffic level based on distance from center (typically worse near center)
      const distanceFactor = 1 - (startDist / length) * 0.5;
      const randomOffset = Math.floor(Math.random() * 3) - 1;
      const levelIndex = Math.max(0, Math.min(4, baseIndex + randomOffset + (distanceFactor > 0.7 ? 1 : 0)));
      
      segments.push({
        points: [[startLat, startLng], [endLat, endLng]],
        level: trafficLevels[levelIndex],
      });
    }
  }
  
  // Generate connecting roads (ring roads)
  const numRings = 2;
  for (let ring = 1; ring <= numRings; ring++) {
    const ringRadius = (ring / (numRings + 1)) * radiusKm;
    const numPoints = 12;
    
    for (let i = 0; i < numPoints; i++) {
      const angle1 = (i / numPoints) * 2 * Math.PI;
      const angle2 = ((i + 1) / numPoints) * 2 * Math.PI;
      
      const lat1 = centerLat + Math.sin(angle1) * ringRadius * kmToDeg;
      const lng1 = centerLng + Math.cos(angle1) * ringRadius * kmToDeg / Math.cos(centerLat * Math.PI / 180);
      const lat2 = centerLat + Math.sin(angle2) * ringRadius * kmToDeg;
      const lng2 = centerLng + Math.cos(angle2) * ringRadius * kmToDeg / Math.cos(centerLat * Math.PI / 180);
      
      const randomOffset = Math.floor(Math.random() * 2);
      const levelIndex = Math.max(0, Math.min(4, baseIndex + randomOffset));
      
      segments.push({
        points: [[lat1, lng1], [lat2, lng2]],
        level: trafficLevels[levelIndex],
      });
    }
  }
  
  return segments;
};

const TrafficOverlay: React.FC<TrafficOverlayProps> = ({
  map,
  centerLocation,
  radiusKm = 5,
  enabled = true,
}) => {
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const segmentsInitRef = useRef<boolean>(false);
  
  // Get current traffic level based on time
  const currentTrafficLevel = useMemo(() => {
    return estimateTrafficLevel(new Date().getHours());
  }, []);
  
  // Generate segments once when center location is available
  const trafficSegments = useMemo(() => {
    if (!centerLocation) return [];
    return generateTrafficSegments(
      centerLocation.lat,
      centerLocation.lng,
      radiusKm,
      currentTrafficLevel
    );
  }, [centerLocation?.lat, centerLocation?.lng, radiusKm, currentTrafficLevel]);
  
  // Add/remove traffic overlay
  useEffect(() => {
    if (!map || !enabled || trafficSegments.length === 0) {
      if (layerGroupRef.current && map) {
        map.removeLayer(layerGroupRef.current);
        layerGroupRef.current = null;
      }
      return;
    }
    
    // Create layer group if not exists
    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup();
      layerGroupRef.current.addTo(map);
    } else {
      layerGroupRef.current.clearLayers();
    }
    
    // Add traffic segments
    trafficSegments.forEach(segment => {
      const polyline = L.polyline(segment.points, {
        color: TRAFFIC_COLORS[segment.level],
        weight: 6,
        opacity: 0.7,
        lineCap: 'round',
        lineJoin: 'round',
      });
      
      polyline.bindTooltip(TRAFFIC_LABELS[segment.level], {
        permanent: false,
        direction: 'top',
      });
      
      if (layerGroupRef.current) {
        layerGroupRef.current.addLayer(polyline);
      }
    });
    
    return () => {
      if (layerGroupRef.current && map) {
        map.removeLayer(layerGroupRef.current);
        layerGroupRef.current = null;
      }
    };
  }, [map, trafficSegments, enabled]);
  
  return null;
};

export default TrafficOverlay;

// Traffic Legend Component
export const TrafficLegend: React.FC<{ currentLevel: TrafficLevel }> = ({ currentLevel }) => {
  const levels: TrafficLevel[] = ['free', 'light', 'moderate', 'heavy', 'severe'];
  
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] font-semibold text-muted-foreground mb-0.5">Traffic</div>
      {levels.map(level => (
        <div key={level} className="flex items-center gap-1.5">
          <div 
            className="w-3 h-1 rounded-full"
            style={{ backgroundColor: TRAFFIC_COLORS[level] }}
          />
          <span className={`text-[10px] ${level === currentLevel ? 'font-semibold' : 'text-muted-foreground'}`}>
            {TRAFFIC_LABELS[level]}
          </span>
          {level === currentLevel && (
            <span className="text-[8px] text-primary font-medium">(now)</span>
          )}
        </div>
      ))}
    </div>
  );
};

// Traffic Status Badge Component
export const TrafficStatusBadge: React.FC<{ className?: string }> = ({ className }) => {
  const currentLevel = useMemo(() => estimateTrafficLevel(new Date().getHours()), []);
  const etaMultiplier = TRAFFIC_MULTIPLIERS[currentLevel];
  
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div 
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ backgroundColor: TRAFFIC_COLORS[currentLevel] }}
      />
      <span className="text-xs font-medium">{TRAFFIC_LABELS[currentLevel]}</span>
      {etaMultiplier > 1 && (
        <span className="text-[10px] text-muted-foreground">
          (+{Math.round((etaMultiplier - 1) * 100)}% ETA)
        </span>
      )}
    </div>
  );
};