import React from 'react';
import { MapPin, Clock, Navigation } from 'lucide-react';
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
    <div 
      className={cn(
        "rounded-2xl bg-emergency/5 border border-emergency/20 overflow-hidden animate-fade-in-up",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-emergency/10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emergency animate-pulse-subtle" />
          <span className="text-xs font-semibold text-emergency uppercase tracking-wide">
            Emergency Alert
          </span>
        </div>
        <h3 className="text-lg font-bold text-foreground">
          Medical Emergency Nearby
        </h3>
      </div>

      <div className="p-4 space-y-3">
        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
            <Navigation className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Distance</p>
              <p className="font-semibold text-foreground">{distance}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">ETA</p>
              <p className="font-semibold text-foreground">{eta}</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary">
          <MapPin className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="text-sm text-foreground">{location}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline" 
            size="lg"
            className="flex-1"
            onClick={onReject}
          >
            Decline
          </Button>
          <Button 
            variant="emergencyStatic" 
            size="lg"
            className="flex-1"
            onClick={onAccept}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
