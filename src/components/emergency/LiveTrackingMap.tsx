import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Locate } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LiveTrackingMapProps {
  userLocation: { lat: number; lng: number } | null;
  responderLocation?: { lat: number; lng: number } | null;
  hospitalLocation?: { lat: number; lng: number } | null;
  showResponder?: boolean;
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

const userIcon = createIcon('#ef4444', '🆘');
const responderIcon = createIcon('#22c55e', '🏍️');
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

// Calculate ETA in minutes based on distance (assuming 25 km/h average city speed)
const calculateETA = (distanceMeters: number): number => {
  const speedMps = 25 * 1000 / 3600; // 25 km/h in m/s
  return Math.ceil(distanceMeters / speedMps / 60);
};

// Format distance for display
const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  userLocation,
  responderLocation,
  hospitalLocation,
  showResponder = false,
  onDistanceUpdate,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const responderMarkerRef = useRef<L.Marker | null>(null);
  const hospitalMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const initialViewSetRef = useRef<boolean>(false);
  
  const [simulatedResponder, setSimulatedResponder] = useState<{ lat: number; lng: number } | null>(null);
  const [simulatedHospital, setSimulatedHospital] = useState<{ lat: number; lng: number } | null>(null);

  // Current responder position (either provided or simulated)
  const currentResponder = responderLocation || simulatedResponder;
  const currentHospital = hospitalLocation || simulatedHospital;

  // Calculate live distance and ETA
  const { distance, eta } = useMemo(() => {
    if (!userLocation || !currentResponder || !showResponder) {
      return { distance: 0, eta: 0 };
    }
    const dist = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      currentResponder.lat,
      currentResponder.lng
    );
    return { distance: dist, eta: calculateETA(dist) };
  }, [userLocation, currentResponder, showResponder]);

  // Notify parent of distance/ETA updates
  useEffect(() => {
    if (onDistanceUpdate && showResponder && distance > 0) {
      onDistanceUpdate(distance, eta);
    }
  }, [distance, eta, onDistanceUpdate, showResponder]);

  // Re-center handler
  const handleRecenter = useCallback(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 16, { animate: true });
    }
  }, [userLocation]);

  // Simulate responder and hospital locations for demo
  useEffect(() => {
    if (userLocation && showResponder) {
      // Simulate responder 400m away, moving closer
      const initialResponder = {
        lat: userLocation.lat + 0.004,
        lng: userLocation.lng + 0.003,
      };
      setSimulatedResponder(initialResponder);

      // Simulate hospital 800m away
      setSimulatedHospital({
        lat: userLocation.lat - 0.007,
        lng: userLocation.lng + 0.005,
      });

      // Animate responder movement
      const interval = setInterval(() => {
        setSimulatedResponder((prev) => {
          if (!prev || !userLocation) return prev;
          const newLat = prev.lat - (prev.lat - userLocation.lat) * 0.08;
          const newLng = prev.lng - (prev.lng - userLocation.lng) * 0.08;
          
          // Stop when very close
          if (Math.abs(newLat - userLocation.lat) < 0.0003 && Math.abs(newLng - userLocation.lng) < 0.0003) {
            clearInterval(interval);
            return userLocation;
          }
          return { lat: newLat, lng: newLng };
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [userLocation, showResponder]);

  // Initialize map (wait until the container is actually rendered)
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const defaultCenter: L.LatLngExpression = [20.5937, 78.9629]; // Center of India

    mapRef.current = L.map(mapContainer.current, {
      center: defaultCenter,
      zoom: 5,
      zoomControl: false,
    });

    // OpenStreetMap tiles - free, no API key, works great in India
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Add zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

    // Ensure Leaflet measures the container correctly (especially after conditional rendering)
    requestAnimationFrame(() => {
      mapRef.current?.invalidateSize();
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [userLocation]);

  // Update user location marker (but don't reset view after initial set)
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapRef.current)
        .bindPopup('<b>Your Location</b><br/>Help is on the way!');
    }

    // Only set initial view once
    if (!initialViewSetRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 16, { animate: true });
      initialViewSetRef.current = true;
    }
  }, [userLocation]);

  // Update responder marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (currentResponder && showResponder) {
      if (responderMarkerRef.current) {
        responderMarkerRef.current.setLatLng([currentResponder.lat, currentResponder.lng]);
      } else {
        responderMarkerRef.current = L.marker([currentResponder.lat, currentResponder.lng], { icon: responderIcon })
          .addTo(mapRef.current)
          .bindPopup('<b>Responder</b><br/>Coming to help!');
      }
    } else if (responderMarkerRef.current) {
      mapRef.current.removeLayer(responderMarkerRef.current);
      responderMarkerRef.current = null;
    }
  }, [currentResponder, showResponder]);

  // Update hospital marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (currentHospital && showResponder) {
      if (hospitalMarkerRef.current) {
        hospitalMarkerRef.current.setLatLng([currentHospital.lat, currentHospital.lng]);
      } else {
        hospitalMarkerRef.current = L.marker([currentHospital.lat, currentHospital.lng], { icon: hospitalIcon })
          .addTo(mapRef.current)
          .bindPopup('<b>Nearest Hospital</b><br/>Emergency services ready');
      }
    } else if (hospitalMarkerRef.current) {
      mapRef.current.removeLayer(hospitalMarkerRef.current);
      hospitalMarkerRef.current = null;
    }
  }, [currentHospital, showResponder]);

  // Draw route line between responder -> user -> hospital
  useEffect(() => {
    if (!mapRef.current) return;

    if (userLocation && currentResponder && showResponder) {
      const routePoints: L.LatLngExpression[] = [
        [currentResponder.lat, currentResponder.lng],
        [userLocation.lat, userLocation.lng],
      ];

      if (currentHospital) {
        routePoints.push([currentHospital.lat, currentHospital.lng]);
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
    } else if (routeLineRef.current) {
      mapRef.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }
  }, [userLocation, currentResponder, currentHospital, showResponder]);

  // Loading state
  if (!userLocation) {
    return (
      <div className="relative w-full h-48 rounded-xl bg-card border border-border overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm text-muted-foreground">Acquiring GPS location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border">
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      {/* Re-center button */}
      <button
        className="absolute top-2 left-2 z-[1000] h-8 w-8 rounded-lg bg-background/90 backdrop-blur-sm flex items-center justify-center touch-feedback"
        onClick={handleRecenter}
        title="Re-center to your location"
      >
        <Locate className="w-4 h-4 text-foreground" />
      </button>

      {/* Live ETA/Distance overlay when responder is active */}
      {showResponder && distance > 0 && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-success/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-semibold text-success-foreground flex items-center gap-2 shadow-lg">
          <span className="animate-pulse">🏍️</span>
          <span>{formatDistance(distance)}</span>
          <span className="text-success-foreground/70">•</span>
          <span>{eta} min</span>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 text-xs space-y-1 z-[1000]">
        <div className="flex items-center gap-2">
          <span className="text-sm">🆘</span>
          <span>Your Location</span>
        </div>
        {showResponder && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm">🏍️</span>
              <span>Responder</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">🏥</span>
              <span>Hospital</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveTrackingMap;
