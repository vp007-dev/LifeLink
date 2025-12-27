import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LiveTrackingMapProps {
  userLocation: { lat: number; lng: number } | null;
  responderLocation?: { lat: number; lng: number } | null;
  hospitalLocation?: { lat: number; lng: number } | null;
  showResponder?: boolean;
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

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  userLocation,
  responderLocation,
  hospitalLocation,
  showResponder = false,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const responderMarkerRef = useRef<L.Marker | null>(null);
  const hospitalMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  
  const [simulatedResponder, setSimulatedResponder] = useState<{ lat: number; lng: number } | null>(null);
  const [simulatedHospital, setSimulatedHospital] = useState<{ lat: number; lng: number } | null>(null);

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

  // Initialize map
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

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update user location on map
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapRef.current)
        .bindPopup('<b>Your Location</b><br/>Help is on the way!');
    }

    mapRef.current.setView([userLocation.lat, userLocation.lng], 16, { animate: true });
  }, [userLocation]);

  // Update responder marker
  useEffect(() => {
    if (!mapRef.current) return;

    const currentResponder = responderLocation || simulatedResponder;

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
  }, [responderLocation, simulatedResponder, showResponder]);

  // Update hospital marker
  useEffect(() => {
    if (!mapRef.current) return;

    const currentHospital = hospitalLocation || simulatedHospital;

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
  }, [hospitalLocation, simulatedHospital, showResponder]);

  // Draw route line between responder -> user -> hospital
  useEffect(() => {
    if (!mapRef.current) return;

    const currentResponder = responderLocation || simulatedResponder;
    const currentHospital = hospitalLocation || simulatedHospital;

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

      // Fit bounds to show all markers
      const bounds = L.latLngBounds(routePoints);
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
    } else if (routeLineRef.current) {
      mapRef.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }
  }, [userLocation, responderLocation, hospitalLocation, simulatedResponder, simulatedHospital, showResponder]);

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
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 text-xs space-y-1">
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
