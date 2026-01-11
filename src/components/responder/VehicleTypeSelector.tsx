import React from 'react';
import { cn } from '@/lib/utils';
import { VehicleType, VEHICLE_PROFILES } from '@/lib/responderNetwork';

interface VehicleTypeSelectorProps {
  selectedType: VehicleType;
  onSelect: (type: VehicleType) => void;
  className?: string;
  disabled?: boolean;
}

const VehicleTypeSelector: React.FC<VehicleTypeSelectorProps> = ({
  selectedType,
  onSelect,
  className,
  disabled = false,
}) => {
  const vehicles = Object.values(VEHICLE_PROFILES);

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground">
        Your Vehicle Type
      </label>
      <div className="grid grid-cols-5 gap-2">
        {vehicles.map((vehicle) => (
          <button
            key={vehicle.type}
            onClick={() => !disabled && onSelect(vehicle.type)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center p-2 rounded-xl transition-all duration-200",
              "border-2",
              selectedType === vehicle.type
                ? "border-primary bg-primary/10"
                : "border-border bg-secondary hover:border-primary/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            aria-label={`Select ${vehicle.label}`}
          >
            <span className="text-2xl mb-1">{vehicle.icon}</span>
            <span className="text-xs text-muted-foreground text-center">
              {vehicle.label}
            </span>
          </button>
        ))}
      </div>
      
      {/* Selected vehicle info */}
      <div className="p-3 rounded-xl bg-secondary/50 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Avg Speed:</span>
          <span className="font-medium">
            {VEHICLE_PROFILES[selectedType].avgSpeed} km/h
          </span>
        </div>
        {VEHICLE_PROFILES[selectedType].canUseSirens && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-muted-foreground">Emergency Speed:</span>
            <span className="font-medium text-destructive">
              {VEHICLE_PROFILES[selectedType].peakSpeed} km/h 🚨
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleTypeSelector;