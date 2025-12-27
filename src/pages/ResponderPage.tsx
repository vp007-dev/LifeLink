import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, CheckCircle } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import Header from '@/components/common/Header';
import AvailabilityToggle from '@/components/responder/AvailabilityToggle';
import AlertCard from '@/components/responder/AlertCard';
import StatusCard from '@/components/emergency/StatusCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type ResponderState = 'offline' | 'waiting' | 'alert' | 'navigating' | 'completed';

const ResponderPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<ResponderState>('offline');
  const [isOnline, setIsOnline] = useState(false);

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
      <div className="flex-1 flex flex-col p-4 space-y-4">
        {/* Availability Toggle */}
        <AvailabilityToggle isOnline={isOnline} onToggle={handleToggle} />

        {/* Waiting State */}
        {state === 'waiting' && (
          <Card variant="gradient" className="animate-fade-in-up">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <div className="w-4 h-4 rounded-full bg-success animate-pulse" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Waiting for Emergencies
              </h3>
              <p className="text-sm text-muted-foreground">
                You'll be notified when someone nearby needs help.
              </p>
            </CardContent>
          </Card>
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
            <Card variant="gradient">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-primary" />
                  Active Rescue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                  value="1.2 km away"
                  status="active"
                />
                <StatusCard
                  type="hospital"
                  title="Nearest Hospital"
                  value="Max Hospital, Sector 19"
                  subtitle="For handover"
                  status="pending"
                />
              </CardContent>
            </Card>

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
          <Card variant="gradient" className="animate-fade-in-up border-success/50">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Rescue Completed!
              </h3>
              <p className="text-sm text-muted-foreground">
                Thank you for helping save a life today.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats when offline */}
        {state === 'offline' && (
          <Card variant="gradient" className="animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-base">Your Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">12</p>
                  <p className="text-xs text-muted-foreground">Rescues</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">4.8</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">3m</p>
                  <p className="text-xs text-muted-foreground">Avg Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
};

export default ResponderPage;
