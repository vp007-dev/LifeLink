import React from 'react';
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'emergency' | 'resolved' | 'cancelled';
  title: string;
  location: string;
  time: string;
  responder?: string;
}

interface ActivityLogProps {
  activities: Activity[];
  className?: string;
}

const ActivityLog: React.FC<ActivityLogProps> = ({
  activities,
  className,
}) => {
  const typeConfig = {
    emergency: {
      icon: AlertCircle,
      color: 'text-emergency',
      bg: 'bg-emergency/10',
    },
    resolved: {
      icon: CheckCircle,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    cancelled: {
      icon: XCircle,
      color: 'text-muted-foreground',
      bg: 'bg-secondary',
    },
  };

  return (
    <div className={cn("rounded-2xl bg-secondary p-4 animate-fade-in-up", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
      </div>
      <div className="space-y-3">
        {activities.map((activity, index) => {
          const config = typeConfig[activity.type];
          const Icon = config.icon;

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-background animate-slide-in-right"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", config.bg)}>
                <Icon className={cn("w-4 h-4", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {activity.location}
                </p>
                {activity.responder && (
                  <p className="text-xs text-primary mt-0.5">
                    {activity.responder}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityLog;
