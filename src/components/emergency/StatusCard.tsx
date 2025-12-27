import React from 'react';
import { MapPin, Clock, User, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusCardProps {
  type: 'location' | 'eta' | 'responder' | 'hospital';
  title: string;
  value: string;
  subtitle?: string;
  status?: 'pending' | 'active' | 'success';
  className?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({
  type,
  title,
  value,
  subtitle,
  status = 'pending',
  className,
}) => {
  const icons = {
    location: MapPin,
    eta: Clock,
    responder: User,
    hospital: Navigation,
  };

  const statusStyles = {
    pending: {
      icon: 'text-muted-foreground',
      bg: 'bg-secondary',
      border: '',
    },
    active: {
      icon: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-l-2 border-l-primary',
    },
    success: {
      icon: 'text-success',
      bg: 'bg-success/10',
      border: 'border-l-2 border-l-success',
    },
  };

  const Icon = icons[type];
  const styles = statusStyles[status];

  return (
    <div 
      className={cn(
        "p-4 rounded-2xl bg-secondary animate-fade-in-up",
        styles.border,
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          styles.bg
        )}>
          <Icon className={cn("w-5 h-5", styles.icon)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {title}
          </p>
          <p className="font-semibold text-foreground truncate">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
