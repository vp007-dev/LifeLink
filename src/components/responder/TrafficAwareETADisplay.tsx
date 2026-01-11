import React from 'react';
import { Clock, AlertTriangle, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  TrafficAwareETA, 
  TrafficLevel, 
  VEHICLE_PROFILES 
} from '@/lib/responderNetwork';

interface TrafficAwareETADisplayProps {
  eta: TrafficAwareETA;
  className?: string;
  showDetails?: boolean;
}

const TRAFFIC_STYLES: Record<TrafficLevel, { bg: string; text: string; label: string }> = {
  free: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Clear Roads' },
  light: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', label: 'Light Traffic' },
  moderate: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: 'Moderate Traffic' },
  heavy: { bg: 'bg-orange-500/10', text: 'text-orange-600', label: 'Heavy Traffic' },
  severe: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Severe Traffic' },
};

const TrafficAwareETADisplay: React.FC<TrafficAwareETADisplayProps> = ({
  eta,
  className,
  showDetails = true,
}) => {
  const trafficStyle = TRAFFIC_STYLES[eta.trafficLevel];
  const vehicle = VEHICLE_PROFILES[eta.vehicleType];
  const etaDiff = eta.trafficAdjustedEtaMinutes - eta.baseEtaMinutes;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Main ETA Display */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estimated Arrival</p>
            <p className="text-xl font-bold text-foreground">
              {eta.trafficAdjustedEtaMinutes} min
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Distance</p>
          <p className="text-lg font-semibold text-foreground">
            {eta.distanceKm.toFixed(1)} km
          </p>
        </div>
      </div>

      {showDetails && (
        <>
          {/* Traffic Status */}
          <div className={cn(
            "flex items-center justify-between p-2 rounded-lg",
            trafficStyle.bg
          )}>
            <div className="flex items-center gap-2">
              <Gauge className={cn("w-4 h-4", trafficStyle.text)} />
              <span className={cn("text-sm font-medium", trafficStyle.text)}>
                {trafficStyle.label}
              </span>
            </div>
            {etaDiff > 0 && (
              <span className="text-xs text-muted-foreground">
                +{etaDiff} min due to traffic
              </span>
            )}
          </div>

          {/* Vehicle Info */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <span className="text-lg">{vehicle.icon}</span>
              <span className="text-sm text-muted-foreground">
                {vehicle.label}
              </span>
            </div>
            {eta.usingSirens && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs font-medium">Priority Mode</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TrafficAwareETADisplay;