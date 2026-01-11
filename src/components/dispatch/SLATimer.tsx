import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, XCircle } from 'lucide-react';
import { calculateSLARemaining, PRIORITY_COLORS, EmergencyPriority } from '@/lib/dispatchEngine';
import { cn } from '@/lib/utils';

interface SLATimerProps {
  slaDeadline: string;
  priority: EmergencyPriority;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onBreach?: () => void;
}

const SLATimer: React.FC<SLATimerProps> = ({
  slaDeadline,
  priority,
  showLabel = true,
  size = 'md',
  onBreach,
}) => {
  const [slaStatus, setSlaStatus] = useState(() => calculateSLARemaining(slaDeadline));

  useEffect(() => {
    const interval = setInterval(() => {
      const newStatus = calculateSLARemaining(slaDeadline);
      setSlaStatus(newStatus);

      if (newStatus.isBreached && onBreach) {
        onBreach();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [slaDeadline, onBreach]);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const getStatusStyles = () => {
    switch (slaStatus.urgencyLevel) {
      case 'breached':
        return 'bg-red-600 text-white animate-pulse';
      case 'critical':
        return 'bg-red-500 text-white animate-pulse';
      case 'warning':
        return 'bg-orange-500 text-white';
      default:
        return cn(PRIORITY_COLORS[priority].bg, PRIORITY_COLORS[priority].text);
    }
  };

  const getIcon = () => {
    switch (slaStatus.urgencyLevel) {
      case 'breached':
        return <XCircle className={cn(iconSizes[size])} />;
      case 'critical':
        return <AlertTriangle className={cn(iconSizes[size])} />;
      default:
        return <Clock className={cn(iconSizes[size])} />;
    }
  };

  const formatTime = () => {
    if (slaStatus.isBreached) {
      const breachedMinutes = Math.abs(slaStatus.remainingMinutes);
      return `+${breachedMinutes}:${String(Math.abs(slaStatus.remainingSeconds)).padStart(2, '0')}`;
    }
    return `${slaStatus.remainingMinutes}:${String(slaStatus.remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-mono font-semibold',
        sizeClasses[size],
        getStatusStyles()
      )}
    >
      {getIcon()}
      {showLabel && <span className="uppercase text-[0.65em] opacity-80">SLA</span>}
      <span>{formatTime()}</span>
    </div>
  );
};

export default SLATimer;
