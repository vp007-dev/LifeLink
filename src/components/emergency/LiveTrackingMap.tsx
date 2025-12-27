import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LiveTrackingMapProps {
  userLocation: { lat: number; lng: number } | null;
  responderLocation?: { lat: number; lng: number } | null;
  hospitalLocation?: { lat: number; lng: number } | null;
  showResponder?: boolean;
}

const MAPBOX_TOKEN_KEY = 'lifelink_mapbox_token';

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  userLocation,
  responderLocation,
  hospitalLocation,
  showResponder = false,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const responderMarker = useRef<mapboxgl.Marker | null>(null);
  const hospitalMarker = useRef<mapboxgl.Marker | null>(null);
  
  const [mapboxToken, setMapboxToken] = useState<string>(
    localStorage.getItem(MAPBOX_TOKEN_KEY) || ''
  );
  const [tokenInput, setTokenInput] = useState('');
  const [mapError, setMapError] = useState<string | null>(null);

  const saveToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem(MAPBOX_TOKEN_KEY, tokenInput.trim());
      setMapboxToken(tokenInput.trim());
      setMapError(null);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !userLocation) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [userLocation.lng, userLocation.lat],
        zoom: 15,
        pitch: 45,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        'top-right'
      );

      // User marker (red pulse)
      const userEl = document.createElement('div');
      userEl.className = 'user-marker';
      userEl.innerHTML = `
        <div class="relative">
          <div class="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
          <div class="relative w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      `;

      userMarker.current = new mapboxgl.Marker(userEl)
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Map failed to load. Please check your Mapbox token.');
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError('Failed to initialize map');
    }

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, userLocation]);

  // Update user location
  useEffect(() => {
    if (userMarker.current && userLocation) {
      userMarker.current.setLngLat([userLocation.lng, userLocation.lat]);
      map.current?.flyTo({ center: [userLocation.lng, userLocation.lat] });
    }
  }, [userLocation]);

  // Update responder marker
  useEffect(() => {
    if (!map.current || !showResponder) return;

    if (responderLocation) {
      if (!responderMarker.current) {
        const responderEl = document.createElement('div');
        responderEl.className = 'responder-marker';
        responderEl.innerHTML = `
          <div class="w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </div>
        `;

        responderMarker.current = new mapboxgl.Marker(responderEl)
          .setLngLat([responderLocation.lng, responderLocation.lat])
          .addTo(map.current);
      } else {
        responderMarker.current.setLngLat([responderLocation.lng, responderLocation.lat]);
      }

      // Fit bounds to show both markers
      if (userLocation) {
        const bounds = new mapboxgl.LngLatBounds()
          .extend([userLocation.lng, userLocation.lat])
          .extend([responderLocation.lng, responderLocation.lat]);
        
        map.current.fitBounds(bounds, { padding: 80 });
      }
    }
  }, [responderLocation, showResponder, userLocation]);

  // Update hospital marker
  useEffect(() => {
    if (!map.current || !hospitalLocation) return;

    if (!hospitalMarker.current) {
      const hospitalEl = document.createElement('div');
      hospitalEl.className = 'hospital-marker';
      hospitalEl.innerHTML = `
        <div class="w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/>
          </svg>
        </div>
      `;

      hospitalMarker.current = new mapboxgl.Marker(hospitalEl)
        .setLngLat([hospitalLocation.lng, hospitalLocation.lat])
        .addTo(map.current);
    }
  }, [hospitalLocation]);

  // No token state
  if (!mapboxToken) {
    return (
      <div className="relative w-full h-48 rounded-xl bg-card border border-border overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <MapPin className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-3">
            Enter your Mapbox public token to enable live tracking
          </p>
          <div className="flex gap-2 w-full max-w-xs">
            <Input
              type="text"
              placeholder="pk.eyJ1..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="text-xs"
            />
            <Button size="sm" onClick={saveToken}>
              Save
            </Button>
          </div>
          <a 
            href="https://mapbox.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-primary mt-2 underline"
          >
            Get token from Mapbox
          </a>
        </div>
      </div>
    );
  }

  // No location state
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

  // Map error state
  if (mapError) {
    return (
      <div className="relative w-full h-48 rounded-xl bg-card border border-border overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <AlertTriangle className="w-8 h-8 text-destructive mb-2" />
          <p className="text-sm text-destructive mb-2">{mapError}</p>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              localStorage.removeItem(MAPBOX_TOKEN_KEY);
              setMapboxToken('');
              setMapError(null);
            }}
          >
            Reset Token
          </Button>
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
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span>Your Location</span>
        </div>
        {showResponder && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Responder</span>
          </div>
        )}
        {hospitalLocation && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span>Hospital</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTrackingMap;
