import React from 'react';
import { MapPin, Clock, User, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

  const statusColors = {
    pending: 'text-muted-foreground',
    active: 'text-primary',
    success: 'text-success',
  };

  const Icon = icons[type];

  return (
    <Card 
      variant="gradient" 
      className={cn(
        "animate-fade-in-up",
        status === 'active' && "border-primary/50",
        status === 'success' && "border-success/50",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg bg-secondary",
            statusColors[status]
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {title}
            </p>
            <p className={cn(
              "font-semibold text-foreground truncate",
              status === 'active' && "text-primary"
            )}>
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
