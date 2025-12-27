import React from 'react';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  patientName?: string;
  distance: string;
  eta: string;
  location: string;
  onAccept: () => void;
  onReject: () => void;
  className?: string;
}

const AlertCard: React.FC<AlertCardProps> = ({
  patientName = 'Anonymous',
  distance,
  eta,
  location,
  onAccept,
  onReject,
  className,
}) => {
  return (
    <Card 
      variant="emergency" 
      className={cn("animate-fade-in-up overflow-hidden", className)}
    >
      {/* Emergency header bar */}
      <div className="h-1 emergency-gradient" />
      
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emergency animate-pulse" />
          <span className="text-xs font-semibold text-emergency uppercase tracking-wider">
            Emergency Alert
          </span>
        </div>
        <CardTitle className="text-lg mt-2">
          Medical Emergency Nearby
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
            <Navigation className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Distance</p>
              <p className="font-semibold">{distance}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
            <Clock className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">ETA</p>
              <p className="font-semibold">{eta}</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50">
          <MapPin className="w-4 h-4 text-primary mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="text-sm">{location}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onReject}
          >
            Decline
          </Button>
          <Button 
            variant="emergencyStatic" 
            className="flex-1"
            onClick={onAccept}
          >
            Accept
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertCard;
