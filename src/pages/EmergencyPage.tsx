import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import Header from '@/components/common/Header';
import ThemeToggle from '@/components/theme/ThemeToggle';
import EmergencyButton from '@/components/emergency/EmergencyButton';
import StatusCard from '@/components/emergency/StatusCard';
import LiveTrackingMap from '@/components/emergency/LiveTrackingMap';
import LocationPermissionFallback from '@/components/emergency/LocationPermissionFallback';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useGeolocation } from '@/hooks/useGeolocation';
import { triggerEmergencyFeedback } from '@/lib/feedback';

type EmergencyState = 'idle' | 'requesting' | 'searching' | 'found' | 'arriving';

const EmergencyPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<EmergencyState>('idle');
  const [liveDistance, setLiveDistance] = useState<number>(0);
  const [liveEta, setLiveEta] = useState<number>(0);
  
  const { 
    latitude, 
    longitude, 
    address, 
    loading: locationLoading, 
    error: locationError, 
    permissionDenied,
    retry: retryLocation 
  } = useGeolocation(true);

  // Simulated responder location (moves toward user)
  const [responderOffset, setResponderOffset] = useState({ lat: 0.008, lng: 0.006 });
  
  // Simulated hospital location
  const hospitalLocation = useMemo(() => {
    if (!latitude || !longitude) return null;
    return { lat: latitude + 0.012, lng: longitude - 0.008 };
  }, [latitude, longitude]);

  // Simulate responder movement
  useEffect(() => {
    if (state === 'found' || state === 'arriving') {
      const interval = setInterval(() => {
        setResponderOffset(prev => ({
          lat: Math.max(0, prev.lat - 0.001),
          lng: Math.max(0, prev.lng - 0.001),
        }));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [state]);

  const responderLocation = useMemo(() => {
    if (!latitude || !longitude || (state !== 'found' && state !== 'arriving')) return null;
    return { 
      lat: latitude + responderOffset.lat, 
      lng: longitude + responderOffset.lng 
    };
  }, [latitude, longitude, state, responderOffset]);

  const userLocation = useMemo(() => {
    if (!latitude || !longitude) return null;
    return { lat: latitude, lng: longitude };
  }, [latitude, longitude]);

  const locationDisplay = locationLoading 
    ? 'Detecting location...' 
    : address || `${latitude?.toFixed(4)}, ${longitude?.toFixed(4)}`;

  // Callback for live distance/ETA updates from map
  const handleDistanceUpdate = useCallback((distance: number, eta: number) => {
    setLiveDistance(distance);
    setLiveEta(eta);
  }, []);

  // Format distance for display
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m away`;
    }
    return `${(meters / 1000).toFixed(1)} km away`;
  };

  const handleEmergencyPress = () => {
    // Accessibility feedback (requires a user gesture, so fire immediately)
    triggerEmergencyFeedback();

    if (state === 'idle') {
      setState('requesting');
      toast({
        title: 'Emergency Alert Sent',
        description: 'Searching for nearby responders...',
      });

      // Simulate finding a responder
      setTimeout(() => setState('searching'), 1000);
      setTimeout(() => {
        setState('found');
        toast({
          title: 'Responder Found!',
          description: 'Help is on the way.',
        });
      }, 3000);
      setTimeout(() => setState('arriving'), 5000);
    }
  };

  const handleCancel = () => {
    setState('idle');
    toast({
      title: 'Emergency Cancelled',
      description: 'Your request has been cancelled.',
    });
  };

  return (
    <MobileLayout
      header={
        <Header
          title="Emergency Help"
          subtitle="One tap to get immediate assistance"
          showBack
          onBack={() => navigate('/')}
          action={<ThemeToggle />}
        />
      }
    >
      <div className="flex-1 flex flex-col px-5 pb-5 overflow-y-auto">
        {/* Location Permission Fallback */}
        {permissionDenied && (
          <div className="mb-4">
            <LocationPermissionFallback 
              error={locationError || 'Location access denied'} 
              onRetry={retryLocation} 
            />
          </div>
        )}

        {/* Live Tracking Map */}
        {!permissionDenied && (
          <div className="mb-4">
            <LiveTrackingMap
              userLocation={userLocation}
              responderLocation={responderLocation}
              hospitalLocation={state !== 'idle' ? hospitalLocation : null}
              showResponder={state === 'found' || state === 'arriving'}
              onDistanceUpdate={handleDistanceUpdate}
            />
          </div>
        )}

        {/* Main Emergency Button */}
        <div className="flex items-center justify-center py-6">
          <EmergencyButton
            onPress={handleEmergencyPress}
            isActive={state !== 'idle'}
          />
        </div>

        {/* Status Cards */}
        <div className="space-y-3 mb-4">
          <StatusCard
            type="location"
            title="Your Location"
            value={locationDisplay}
            status={!locationLoading && !locationError ? 'active' : 'pending'}
          />

          {state !== 'idle' && (
            <>
              <StatusCard
                type="responder"
                title="Responder"
                value={state === 'searching' ? 'Searching...' : 'Rajesh Kumar'}
                subtitle={state !== 'searching' ? 'Auto Rickshaw Driver' : undefined}
                status={state === 'searching' ? 'pending' : 'active'}
              />

              {(state === 'found' || state === 'arriving') && (
                <StatusCard
                  type="eta"
                  title="Estimated Arrival"
                  value={liveEta > 0 ? `${liveEta} min` : 'Calculating...'}
                  subtitle={liveDistance > 0 ? formatDistance(liveDistance) : undefined}
                  status="active"
                />
              )}

              <StatusCard
                type="hospital"
                title="Nearest Hospital"
                value="Max Hospital, Sector 19"
                subtitle="1.2 km away"
                status="success"
              />
            </>
          )}
        </div>

        {/* Action Buttons */}
        {state !== 'idle' && (
          <div className="space-y-3">
            {state === 'arriving' && (
              <Button variant="success" size="lg" className="w-full">
                <Shield className="w-5 h-5 mr-2" />
                Responder is Nearby
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleCancel}
            >
              Cancel Request
            </Button>
          </div>
        )}

        {/* Instruction Text */}
        {state === 'idle' && (
          <p className="text-center text-sm text-muted-foreground mb-4">
            Press the SOS button to alert nearby emergency responders.
          </p>
        )}
      </div>
    </MobileLayout>
  );
};

export default EmergencyPage;
