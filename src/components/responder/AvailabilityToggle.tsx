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
        "w-full p-4 rounded-2xl transition-all duration-200 touch-feedback",
        "flex items-center justify-between",
        isOnline
          ? "bg-success/10"
          : "bg-secondary",
        className
      )}
      aria-label={isOnline ? 'Go offline' : 'Go online'}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-3 h-3 rounded-full transition-colors",
          isOnline ? "bg-success animate-pulse-subtle" : "bg-muted-foreground"
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
        "w-12 h-7 rounded-full p-1 transition-colors",
        isOnline ? "bg-success" : "bg-muted-foreground/30"
      )}>
        <div className={cn(
          "w-5 h-5 rounded-full bg-white transition-transform",
          isOnline ? "translate-x-5" : "translate-x-0"
        )} />
      </div>
    </button>
  );
};

export default AvailabilityToggle;
