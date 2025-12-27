import React from 'react';
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card variant="gradient" className={cn("animate-fade-in-up", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity, index) => {
          const config = typeConfig[activity.type];
          const Icon = config.icon;

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 animate-slide-in-right"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={cn("p-2 rounded-lg", config.bg)}>
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
                  <p className="text-xs text-primary mt-1">
                    Responder: {activity.responder}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ActivityLog;
