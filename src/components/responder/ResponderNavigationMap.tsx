import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Locate, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResponderNavigationMapProps {
  responderLocation: { lat: number; lng: number } | null;
  patientLocation: { lat: number; lng: number };
  hospitalLocation?: { lat: number; lng: number } | null;
  onDistanceUpdate?: (distance: number, eta: number) => void;
}

// Custom icon creator
const createIcon = (color: string, emoji: string) => {
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        border: 3px solid white;
      ">${emoji}</div>
    `,
    className: 'custom-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const responderIcon = createIcon('#22c55e', '🏍️');
const patientIcon = createIcon('#ef4444', '🆘');
const hospitalIcon = createIcon('#3b82f6', '🏥');

// Calculate distance between two coordinates in meters (Haversine formula)
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate ETA in minutes based on distance (assuming 30 km/h average speed)
const calculateETA = (distanceMeters: number): number => {
  const speedMps = 30 * 1000 / 3600; // 30 km/h in m/s
  return Math.ceil(distanceMeters / speedMps / 60);
};

// Format distance for display
const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

const ResponderNavigationMap: React.FC<ResponderNavigationMapProps> = ({
  responderLocation,
  patientLocation,
  hospitalLocation,
  onDistanceUpdate,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const responderMarkerRef = useRef<L.Marker | null>(null);
  const patientMarkerRef = useRef<L.Marker | null>(null);
  const hospitalMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const initialViewSetRef = useRef<boolean>(false);

  // Calculate live distance and ETA
  const { distance, eta } = useMemo(() => {
    if (!responderLocation) {
      return { distance: 0, eta: 0 };
    }
    const dist = calculateDistance(
      responderLocation.lat,
      responderLocation.lng,
      patientLocation.lat,
      patientLocation.lng
    );
    return { distance: dist, eta: calculateETA(dist) };
  }, [responderLocation, patientLocation]);

  // Notify parent of distance/ETA updates
  useEffect(() => {
    if (onDistanceUpdate && distance > 0) {
      onDistanceUpdate(distance, eta);
    }
  }, [distance, eta, onDistanceUpdate]);

  // Re-center handler
  const handleRecenter = useCallback(() => {
    if (mapRef.current && responderLocation) {
      mapRef.current.setView([responderLocation.lat, responderLocation.lng], 15, { animate: true });
    }
  }, [responderLocation]);

  // Fit all markers in view
  const handleFitAll = useCallback(() => {
    if (!mapRef.current) return;
    
    const points: L.LatLngExpression[] = [
      [patientLocation.lat, patientLocation.lng],
    ];
    
    if (responderLocation) {
      points.push([responderLocation.lat, responderLocation.lng]);
    }
    
    if (hospitalLocation) {
      points.push([hospitalLocation.lat, hospitalLocation.lng]);
    }
    
    const bounds = L.latLngBounds(points);
    mapRef.current.fitBounds(bounds, { padding: [40, 40] });
  }, [responderLocation, patientLocation, hospitalLocation]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapRef.current = L.map(mapContainer.current, {
      center: [patientLocation.lat, patientLocation.lng],
      zoom: 14,
      zoomControl: false,
    });

    // OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Add zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

    // Ensure Leaflet measures the container correctly
    requestAnimationFrame(() => {
      mapRef.current?.invalidateSize();
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [patientLocation]);

  // Update patient marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (patientMarkerRef.current) {
      patientMarkerRef.current.setLatLng([patientLocation.lat, patientLocation.lng]);
    } else {
      patientMarkerRef.current = L.marker([patientLocation.lat, patientLocation.lng], { icon: patientIcon })
        .addTo(mapRef.current)
        .bindPopup('<b>Patient Location</b><br/>Emergency!');
    }
  }, [patientLocation]);

  // Update responder marker
  useEffect(() => {
    if (!mapRef.current || !responderLocation) return;

    if (responderMarkerRef.current) {
      responderMarkerRef.current.setLatLng([responderLocation.lat, responderLocation.lng]);
    } else {
      responderMarkerRef.current = L.marker([responderLocation.lat, responderLocation.lng], { icon: responderIcon })
        .addTo(mapRef.current)
        .bindPopup('<b>You</b><br/>Navigate to patient');
    }

    // Set initial view to show both points
    if (!initialViewSetRef.current) {
      const bounds = L.latLngBounds([
        [responderLocation.lat, responderLocation.lng],
        [patientLocation.lat, patientLocation.lng],
      ]);
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
      initialViewSetRef.current = true;
    }
  }, [responderLocation, patientLocation]);

  // Update hospital marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (hospitalLocation) {
      if (hospitalMarkerRef.current) {
        hospitalMarkerRef.current.setLatLng([hospitalLocation.lat, hospitalLocation.lng]);
      } else {
        hospitalMarkerRef.current = L.marker([hospitalLocation.lat, hospitalLocation.lng], { icon: hospitalIcon })
          .addTo(mapRef.current)
          .bindPopup('<b>Nearest Hospital</b><br/>For patient handover');
      }
    } else if (hospitalMarkerRef.current) {
      mapRef.current.removeLayer(hospitalMarkerRef.current);
      hospitalMarkerRef.current = null;
    }
  }, [hospitalLocation]);

  // Draw route line
  useEffect(() => {
    if (!mapRef.current || !responderLocation) return;

    const routePoints: L.LatLngExpression[] = [
      [responderLocation.lat, responderLocation.lng],
      [patientLocation.lat, patientLocation.lng],
    ];

    if (hospitalLocation) {
      routePoints.push([hospitalLocation.lat, hospitalLocation.lng]);
    }

    if (routeLineRef.current) {
      routeLineRef.current.setLatLngs(routePoints);
    } else {
      routeLineRef.current = L.polyline(routePoints, {
        color: '#22c55e',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10',
      }).addTo(mapRef.current);
    }
  }, [responderLocation, patientLocation, hospitalLocation]);

  // Loading state when no responder location
  if (!responderLocation) {
    return (
      <div className="relative w-full h-56 rounded-xl bg-card border border-border overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm text-muted-foreground">Acquiring your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-56 rounded-xl overflow-hidden border border-border">
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      {/* Control buttons */}
      <div className="absolute top-2 left-2 z-[1000] flex gap-2">
        <button
          className="h-8 w-8 rounded-lg bg-background/90 backdrop-blur-sm flex items-center justify-center touch-feedback"
          onClick={handleRecenter}
          title="Re-center to your location"
        >
          <Locate className="w-4 h-4 text-foreground" />
        </button>
        <button
          className="h-8 w-8 rounded-lg bg-background/90 backdrop-blur-sm flex items-center justify-center touch-feedback"
          onClick={handleFitAll}
          title="Fit all markers in view"
        >
          <Navigation className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Live ETA/Distance overlay */}
      {distance > 0 && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-semibold text-primary-foreground flex items-center gap-2 shadow-lg">
          <span>🆘</span>
          <span>{formatDistance(distance)}</span>
          <span className="text-primary-foreground/70">•</span>
          <span>{eta} min</span>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 text-xs space-y-1 z-[1000]">
        <div className="flex items-center gap-2">
          <span className="text-sm">🏍️</span>
          <span>You</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">🆘</span>
          <span>Patient</span>
        </div>
        {hospitalLocation && (
          <div className="flex items-center gap-2">
            <span className="text-sm">🏥</span>
            <span>Hospital</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponderNavigationMap;
