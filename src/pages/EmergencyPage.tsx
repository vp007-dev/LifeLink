import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Shield } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import Header from '@/components/common/Header';
import EmergencyButton from '@/components/emergency/EmergencyButton';
import StatusCard from '@/components/emergency/StatusCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type EmergencyState = 'idle' | 'requesting' | 'searching' | 'found' | 'arriving';

const EmergencyPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<EmergencyState>('idle');
  const [location, setLocation] = useState<string>('Detecting location...');

  useEffect(() => {
    // Simulate location detection
    const timer = setTimeout(() => {
      setLocation('Sector 18, Noida, UP');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleEmergencyPress = () => {
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
        />
      }
    >
      <div className="flex-1 flex flex-col p-4">
        {/* Main Emergency Button */}
        <div className="flex-1 flex items-center justify-center py-8">
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
            value={location}
            status={location !== 'Detecting location...' ? 'active' : 'pending'}
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
                  value={state === 'arriving' ? '2 mins' : '4 mins'}
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
            <br />
            <span className="text-xs">No login required in emergency mode.</span>
          </p>
        )}
      </div>
    </MobileLayout>
  );
};

export default EmergencyPage;
