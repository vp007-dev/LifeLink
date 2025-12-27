import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'emergency';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  className,
}) => {
  const variantStyles = {
    default: 'text-primary bg-primary/10',
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    emergency: 'text-emergency bg-emergency/10',
  };

  const trendColors = {
    up: 'text-success',
    down: 'text-emergency',
    neutral: 'text-muted-foreground',
  };

  return (
    <Card variant="gradient" className={cn("animate-fade-in-up", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "p-2.5 rounded-lg",
            variantStyles[variant]
          )}>
            <Icon className="w-5 h-5" />
          </div>
          {trend && trendValue && (
            <span className={cn(
              "text-sm font-medium",
              trendColors[trend]
            )}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '–'} {trendValue}
            </span>
          )}
        </div>
        
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
