import React from 'react';
import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmergencyButtonProps {
  onPress: () => void;
  isActive?: boolean;
  className?: string;
}

const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  onPress,
  isActive = false,
  className,
}) => {
  return (
    <div className={cn("relative", className)}>
      {/* Ripple rings */}
      {!isActive && (
        <>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-40 h-40 rounded-full bg-emergency/20 animate-ripple" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-40 h-40 rounded-full bg-emergency/15 animate-ripple" style={{ animationDelay: '0.5s' }} />
          </div>
        </>
      )}
      
      {/* Main button */}
      <button
        onClick={onPress}
        className={cn(
          "relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center gap-1",
          "bg-emergency text-emergency-foreground",
          "transition-all duration-200 active:scale-95",
          isActive && "scale-95 opacity-90",
          "focus:outline-none"
        )}
        aria-label="Emergency distress button"
      >
        <Phone className="w-10 h-10" strokeWidth={2} />
        <span className="font-bold text-base tracking-wider">
          {isActive ? 'ACTIVE' : 'SOS'}
        </span>
      </button>
    </div>
  );
};

export default EmergencyButton;
