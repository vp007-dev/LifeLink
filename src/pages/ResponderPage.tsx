import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, CheckCircle } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import Header from '@/components/common/Header';
import AvailabilityToggle from '@/components/responder/AvailabilityToggle';
import AlertCard from '@/components/responder/AlertCard';
import StatusCard from '@/components/emergency/StatusCard';
import ResponderNavigationMap from '@/components/responder/ResponderNavigationMap';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useGeolocation } from '@/hooks/useGeolocation';

type ResponderState = 'offline' | 'waiting' | 'alert' | 'navigating' | 'completed';

const ResponderPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<ResponderState>('offline');
  const [isOnline, setIsOnline] = useState(false);
  const [liveDistance, setLiveDistance] = useState<number>(0);
  const [liveEta, setLiveEta] = useState<number>(0);

  // Get responder's current location
  const { latitude, longitude } = useGeolocation(true);

  // Simulated patient location (emergency call location)
  const patientLocation = useMemo(() => ({
    lat: 28.5355 + 0.008,
    lng: 77.391 + 0.006,
  }), []);

  // Simulated hospital location
  const hospitalLocation = useMemo(() => ({
    lat: 28.5355 - 0.005,
    lng: 77.391 + 0.008,
  }), []);

  // Responder's current location
  const responderLocation = useMemo(() => {
    if (!latitude || !longitude) return null;
    return { lat: latitude, lng: longitude };
  }, [latitude, longitude]);

  // Callback for live distance/ETA updates from map
  const handleDistanceUpdate = useCallback((distance: number, eta: number) => {
    setLiveDistance(distance);
    setLiveEta(eta);
  }, []);

  // Format distance for display
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const handleToggle = () => {
    const newOnline = !isOnline;
    setIsOnline(newOnline);
    setState(newOnline ? 'waiting' : 'offline');
    
    if (newOnline) {
      toast({
        title: 'You are now online',
        description: 'You will receive emergency alerts.',
      });
      // Simulate receiving an alert
      setTimeout(() => setState('alert'), 4000);
    } else {
      toast({
        title: 'You are now offline',
        description: 'You will not receive emergency alerts.',
      });
    }
  };

  const handleAccept = () => {
    setState('navigating');
    toast({
      title: 'Alert Accepted',
      description: 'Navigate to the patient location.',
    });
  };

  const handleReject = () => {
    setState('waiting');
    toast({
      title: 'Alert Declined',
      description: 'Waiting for next alert.',
    });
  };

  const handleComplete = () => {
    setState('completed');
    toast({
      title: 'Rescue Completed',
      description: 'Thank you for your service!',
    });
    setTimeout(() => setState('waiting'), 3000);
  };

  return (
    <MobileLayout
      header={
        <Header
          title="Responder Mode"
          subtitle="Help save lives in your area"
          showBack
          onBack={() => navigate('/')}
        />
      }
    >
      <div className="flex-1 flex flex-col px-5 pb-5 space-y-4">
        {/* Availability Toggle */}
        <AvailabilityToggle isOnline={isOnline} onToggle={handleToggle} />

        {/* Waiting State */}
        {state === 'waiting' && (
          <div className="rounded-2xl bg-secondary p-6 text-center animate-fade-in-up">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <div className="w-4 h-4 rounded-full bg-success animate-pulse-subtle" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              Waiting for Emergencies
            </h3>
            <p className="text-sm text-muted-foreground">
              You'll be notified when someone nearby needs help.
            </p>
          </div>
        )}

        {/* Alert Card */}
        {state === 'alert' && (
          <AlertCard
            distance="1.2 km"
            eta="3 mins"
            location="Block C-4, Sector 18, Noida, Uttar Pradesh"
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}

        {/* Navigation State */}
        {state === 'navigating' && (
          <div className="space-y-4 stagger-children">
            {/* Navigation Map */}
            <ResponderNavigationMap
              responderLocation={responderLocation}
              patientLocation={patientLocation}
              hospitalLocation={hospitalLocation}
              onDistanceUpdate={handleDistanceUpdate}
            />

            <div className="rounded-2xl bg-secondary p-4">
              <div className="flex items-center gap-2 mb-3">
                <Navigation className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Active Rescue</h3>
              </div>
              <div className="space-y-3">
                <StatusCard
                  type="location"
                  title="Patient Location"
                  value="Block C-4, Sector 18"
                  subtitle="Noida, UP"
                  status="active"
                />
                <StatusCard
                  type="eta"
                  title="Distance"
                  value={liveDistance > 0 ? formatDistance(liveDistance) : 'Calculating...'}
                  subtitle={liveEta > 0 ? `ETA: ${liveEta} min` : undefined}
                  status="active"
                />
                <StatusCard
                  type="hospital"
                  title="Nearest Hospital"
                  value="Max Hospital, Sector 19"
                  subtitle="For handover"
                  status="pending"
                />
              </div>
            </div>

            <Button
              variant="success"
              size="lg"
              className="w-full"
              onClick={handleComplete}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Mark Rescue Complete
            </Button>
          </div>
        )}

        {/* Completed State */}
        {state === 'completed' && (
          <div className="rounded-2xl bg-success/10 p-6 text-center animate-fade-in-up">
            <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-success" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              Rescue Completed!
            </h3>
            <p className="text-sm text-muted-foreground">
              Thank you for helping save a life today.
            </p>
          </div>
        )}

        {/* Stats when offline */}
        {state === 'offline' && (
          <div className="rounded-2xl bg-secondary p-4 animate-fade-in-up">
            <h3 className="font-semibold text-foreground mb-4">Your Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-xl bg-background">
                <p className="text-2xl font-bold text-primary">12</p>
                <p className="text-xs text-muted-foreground">Rescues</p>
              </div>
              <div className="p-3 rounded-xl bg-background">
                <p className="text-2xl font-bold text-success">4.8</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="p-3 rounded-xl bg-background">
                <p className="text-2xl font-bold text-foreground">3m</p>
                <p className="text-xs text-muted-foreground">Avg Time</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default ResponderPage;
