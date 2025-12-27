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
      {/* Outer pulse rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-48 h-48 rounded-full bg-emergency/20 animate-emergency-ring" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-48 h-48 rounded-full bg-emergency/10 animate-emergency-ring" style={{ animationDelay: '0.5s' }} />
      </div>
      
      {/* Main button */}
      <button
        onClick={onPress}
        className={cn(
          "relative z-10 w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2",
          "emergency-gradient emergency-shadow",
          "transition-all duration-200 active:scale-95",
          isActive && "scale-105",
          "focus:outline-none focus:ring-4 focus:ring-emergency/50"
        )}
        aria-label="Emergency distress button"
      >
        <Phone className="w-12 h-12 text-emergency-foreground" strokeWidth={2.5} />
        <span className="text-emergency-foreground font-bold text-lg tracking-wide">
          {isActive ? 'ACTIVE' : 'SOS'}
        </span>
      </button>
    </div>
  );
};

export default EmergencyButton;
