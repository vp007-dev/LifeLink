import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { PRIORITY_COLORS, EmergencyPriority, SLA_TIMES } from '@/lib/dispatchEngine';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: EmergencyPriority;
  showSLA?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  showSLA = false,
  size = 'md',
}) => {
  const colors = PRIORITY_COLORS[priority];
  const slaTime = SLA_TIMES[priority];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const getIcon = () => {
    const className = iconSizes[size];
    switch (priority) {
      case 'critical':
        return <AlertTriangle className={className} />;
      case 'high':
        return <AlertCircle className={className} />;
      case 'medium':
        return <Info className={className} />;
      case 'low':
        return <CheckCircle className={className} />;
    }
  };

  const getPriorityLabel = () => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        sizeClasses[size],
        colors.bg,
        colors.text
      )}
    >
      {getIcon()}
      <span>{getPriorityLabel()}</span>
      {showSLA && (
        <span className="opacity-80 text-[0.85em]">
          ({slaTime}min)
        </span>
      )}
    </div>
  );
};

export default PriorityBadge;
