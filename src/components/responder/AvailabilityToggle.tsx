import React from 'react';
import { cn } from '@/lib/utils';

interface AvailabilityToggleProps {
  isOnline: boolean;
  onToggle: () => void;
  className?: string;
}

const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({
  isOnline,
  onToggle,
  className,
}) => {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative w-full p-4 rounded-xl border-2 transition-all duration-300",
        "flex items-center justify-between",
        isOnline
          ? "border-success/50 bg-success/10"
          : "border-border bg-secondary/30",
        className
      )}
      aria-label={isOnline ? 'Go offline' : 'Go online'}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-3 h-3 rounded-full transition-colors",
          isOnline ? "bg-success animate-pulse" : "bg-muted-foreground"
        )} />
        <div className="text-left">
          <p className="font-semibold text-foreground">
            {isOnline ? 'Online' : 'Offline'}
          </p>
          <p className="text-sm text-muted-foreground">
            {isOnline ? 'Accepting emergency alerts' : 'Not accepting alerts'}
          </p>
        </div>
      </div>
      
      {/* Toggle switch */}
      <div className={cn(
        "w-14 h-8 rounded-full p-1 transition-colors",
        isOnline ? "bg-success" : "bg-secondary"
      )}>
        <div className={cn(
          "w-6 h-6 rounded-full bg-foreground transition-transform",
          isOnline ? "translate-x-6" : "translate-x-0"
        )} />
      </div>
    </button>
  );
};

export default AvailabilityToggle;
