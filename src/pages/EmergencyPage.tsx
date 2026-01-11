import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Ambulance, Phone, ExternalLink } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import Header from '@/components/common/Header';
import ThemeToggle from '@/components/theme/ThemeToggle';
import EmergencyButton from '@/components/emergency/EmergencyButton';
import StatusCard from '@/components/emergency/StatusCard';
import LiveTrackingMap from '@/components/emergency/LiveTrackingMap';
import LocationPermissionFallback from '@/components/emergency/LocationPermissionFallback';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useGeolocation } from '@/hooks/useGeolocation';
import { triggerEmergencyFeedback } from '@/lib/feedback';
import { AmbulanceGateway, AmbulanceDispatchResponse, AmbulanceStatusResponse } from '@/lib/ambulanceGateway';

type EmergencyState = 'idle' | 'requesting' | 'searching' | 'found' | 'arriving';

interface AmbulanceInfo {
  dispatchId: string;
  ambulanceType: string;
  zone: string;
  baseStation: string;
  etaMinutes: number;
  trackingUrl?: string;
  contactNumber?: string;
  status: 'dispatched' | 'en_route' | 'arrived' | 'completed' | 'cancelled';
}

const EmergencyPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<EmergencyState>('idle');
  const [liveDistance, setLiveDistance] = useState<number>(0);
  const [liveEta, setLiveEta] = useState<number>(0);
  const [ambulanceInfo, setAmbulanceInfo] = useState<AmbulanceInfo | null>(null);
  const [ambulanceLoading, setAmbulanceLoading] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  
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

  // Cleanup ambulance subscription on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Handle ambulance status updates
  const handleAmbulanceStatusUpdate = useCallback((status: AmbulanceStatusResponse) => {
    if (status.success && status.status) {
      setAmbulanceInfo(prev => prev ? {
        ...prev,
        status: status.status!,
        etaMinutes: status.eta_remaining_minutes || prev.etaMinutes,
      } : null);

      if (status.status === 'arrived') {
        toast({
          title: 'Ambulance Arrived!',
          description: 'Medical assistance has arrived at your location.',
        });
      }
    }
  }, [toast]);

  // Auto-dispatch ambulance when SOS is triggered
  const dispatchAmbulance = useCallback(async () => {
    if (!latitude || !longitude) return;

    setAmbulanceLoading(true);
    
    const emergencyId = `EM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const response = await AmbulanceGateway.dispatch({
      emergency_id: emergencyId,
      patient_lat: latitude,
      patient_lng: longitude,
      emergency_type: 'medical',
      priority: 'critical',
      description: 'SOS Emergency - Immediate assistance required',
      requester_type: 'citizen',
    });

    setAmbulanceLoading(false);

    if (response.success && response.dispatch_id) {
      setAmbulanceInfo({
        dispatchId: response.dispatch_id,
        ambulanceType: response.ambulance_type || 'ALS',
        zone: response.zone || 'Unknown',
        baseStation: response.base_station || 'Central Station',
        etaMinutes: response.eta_minutes || 8,
        trackingUrl: response.tracking_url,
        contactNumber: response.contact_number,
        status: 'dispatched',
      });

      toast({
        title: '🚑 Ambulance Dispatched!',
        description: `${response.ambulance_type} unit en route. ETA: ${response.eta_minutes} minutes`,
      });

      // Subscribe to status updates
      unsubscribeRef.current = AmbulanceGateway.subscribeToUpdates(
        response.dispatch_id,
        handleAmbulanceStatusUpdate
      );
    } else {
      toast({
        title: 'Ambulance Dispatch Failed',
        description: response.error || 'Could not dispatch ambulance. Trying alternative responders.',
        variant: 'destructive',
      });
    }
  }, [latitude, longitude, toast, handleAmbulanceStatusUpdate]);

  const handleEmergencyPress = async () => {
    // Accessibility feedback (requires a user gesture, so fire immediately)
    triggerEmergencyFeedback();

    if (state === 'idle') {
      setState('requesting');
      toast({
        title: 'Emergency Alert Sent',
        description: 'Dispatching ambulance and searching for nearby responders...',
      });

      // Auto-dispatch government ambulance
      dispatchAmbulance();

      // Simulate finding a responder (runs in parallel with ambulance dispatch)
      setTimeout(() => setState('searching'), 1000);
      setTimeout(() => {
        setState('found');
        toast({
          title: 'Responder Found!',
          description: 'Additional help is on the way.',
        });
      }, 3000);
      setTimeout(() => setState('arriving'), 5000);
    }
  };

  const handleCancel = async () => {
    // Cancel ambulance if dispatched
    if (ambulanceInfo?.dispatchId) {
      await AmbulanceGateway.cancel(ambulanceInfo.dispatchId, 'User cancelled request');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    }

    setState('idle');
    setAmbulanceInfo(null);
    toast({
      title: 'Emergency Cancelled',
      description: 'Your request has been cancelled.',
    });
  };

  // Get ambulance status badge variant
  const getAmbulanceStatusVariant = (status: AmbulanceInfo['status']) => {
    switch (status) {
      case 'dispatched': return 'secondary';
      case 'en_route': return 'default';
      case 'arrived': return 'success';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getAmbulanceStatusText = (status: AmbulanceInfo['status']) => {
    switch (status) {
      case 'dispatched': return 'Dispatched';
      case 'en_route': return 'En Route';
      case 'arrived': return 'Arrived';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
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
              {/* Ambulance Status Card */}
              {(ambulanceLoading || ambulanceInfo) && (
                <div className="rounded-xl border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ambulance className="w-5 h-5 text-destructive" />
                      <span className="font-semibold">Government Ambulance</span>
                    </div>
                    {ambulanceInfo && (
                      <Badge variant={getAmbulanceStatusVariant(ambulanceInfo.status) as any}>
                        {getAmbulanceStatusText(ambulanceInfo.status)}
                      </Badge>
                    )}
                  </div>
                  
                  {ambulanceLoading && !ambulanceInfo && (
                    <p className="text-sm text-muted-foreground">Dispatching ambulance...</p>
                  )}
                  
                  {ambulanceInfo && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium">{ambulanceInfo.ambulanceType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base Station:</span>
                        <span className="font-medium">{ambulanceInfo.baseStation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ETA:</span>
                        <span className="font-medium text-destructive">{ambulanceInfo.etaMinutes} min</span>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 pt-2">
                        {ambulanceInfo.contactNumber && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => window.open(`tel:${ambulanceInfo.contactNumber}`, '_self')}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Call
                          </Button>
                        )}
                        {ambulanceInfo.trackingUrl && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => window.open(ambulanceInfo.trackingUrl, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Track
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <StatusCard
                type="responder"
                title="Nearby Responder"
                value={state === 'searching' ? 'Searching...' : 'Rajesh Kumar'}
                subtitle={state !== 'searching' ? 'Auto Rickshaw Driver' : undefined}
                status={state === 'searching' ? 'pending' : 'active'}
              />

              {(state === 'found' || state === 'arriving') && (
                <StatusCard
                  type="eta"
                  title="Responder Arrival"
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