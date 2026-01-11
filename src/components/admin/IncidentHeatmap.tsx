import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// @ts-ignore - leaflet.heat doesn't have types
import 'leaflet.heat';

interface IncidentPoint {
  lat: number;
  lng: number;
  intensity?: number;
}

interface IncidentHeatmapProps {
  incidents?: IncidentPoint[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

// Sample incident data for Delhi NCR region
const defaultIncidents: IncidentPoint[] = [
  // Noida area - high density
  { lat: 28.5355, lng: 77.391, intensity: 1 },
  { lat: 28.5400, lng: 77.380, intensity: 0.9 },
  { lat: 28.5320, lng: 77.395, intensity: 0.8 },
  { lat: 28.5450, lng: 77.370, intensity: 0.7 },
  { lat: 28.5280, lng: 77.400, intensity: 0.85 },
  { lat: 28.5500, lng: 77.365, intensity: 0.6 },
  
  // Ghaziabad area
  { lat: 28.6692, lng: 77.4538, intensity: 0.9 },
  { lat: 28.6600, lng: 77.4400, intensity: 0.75 },
  { lat: 28.6750, lng: 77.4600, intensity: 0.65 },
  
  // Greater Noida
  { lat: 28.4744, lng: 77.5040, intensity: 0.5 },
  { lat: 28.4800, lng: 77.5100, intensity: 0.45 },
  
  // Delhi Central
  { lat: 28.6139, lng: 77.2090, intensity: 1 },
  { lat: 28.6200, lng: 77.2200, intensity: 0.95 },
  { lat: 28.6080, lng: 77.2150, intensity: 0.85 },
  { lat: 28.6300, lng: 77.2100, intensity: 0.7 },
  
  // South Delhi
  { lat: 28.5245, lng: 77.2066, intensity: 0.8 },
  { lat: 28.5300, lng: 77.2100, intensity: 0.7 },
  { lat: 28.5150, lng: 77.2000, intensity: 0.6 },
  
  // Gurugram
  { lat: 28.4595, lng: 77.0266, intensity: 0.85 },
  { lat: 28.4700, lng: 77.0400, intensity: 0.75 },
  { lat: 28.4500, lng: 77.0300, intensity: 0.65 },
  { lat: 28.4800, lng: 77.0200, intensity: 0.55 },
  
  // Faridabad
  { lat: 28.4089, lng: 77.3178, intensity: 0.6 },
  { lat: 28.4150, lng: 77.3200, intensity: 0.5 },
];

const IncidentHeatmap: React.FC<IncidentHeatmapProps> = ({
  incidents = defaultIncidents,
  center = { lat: 28.5355, lng: 77.2910 }, // Delhi NCR center
  zoom = 10,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Initialize map
    mapRef.current = L.map(mapContainer.current, {
      center: [center.lat, center.lng],
      zoom: zoom,
      zoomControl: false,
    });

    // Use dark-themed tiles for better heatmap visibility
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CARTO',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Add zoom control
    L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

    // Prepare heat data: [lat, lng, intensity]
    const heatData = incidents.map((point) => [
      point.lat,
      point.lng,
      point.intensity || 0.5,
    ]);

    // Create heatmap layer
    // @ts-ignore - L.heatLayer is added by leaflet.heat plugin
    heatLayerRef.current = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: '#22c55e', // green - low
        0.3: '#84cc16', // lime
        0.5: '#eab308', // yellow
        0.7: '#f97316', // orange
        0.85: '#ef4444', // red
        1.0: '#dc2626', // dark red - high
      },
    }).addTo(mapRef.current);

    // Ensure proper sizing
    requestAnimationFrame(() => {
      mapRef.current?.invalidateSize();
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom, incidents]);

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 text-xs z-[1000]">
        <p className="font-medium mb-1.5 text-foreground">Incident Density</p>
        <div className="flex items-center gap-1">
          <div className="w-16 h-2 rounded-sm" style={{
            background: 'linear-gradient(to right, #22c55e, #84cc16, #eab308, #f97316, #ef4444, #dc2626)'
          }} />
        </div>
        <div className="flex justify-between mt-0.5 text-muted-foreground">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs z-[1000]">
        <p className="font-medium text-foreground">Delhi NCR Region</p>
        <p className="text-muted-foreground">{incidents.length} incidents</p>
      </div>
    </div>
  );
};

export default IncidentHeatmap;
