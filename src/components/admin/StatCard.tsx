import React from 'react';
import { LucideIcon } from 'lucide-react';
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
    default: 'text-foreground bg-secondary',
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
    <div className={cn("p-4 rounded-2xl bg-secondary animate-fade-in-up", className)}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
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
        <p className="text-2xl font-bold text-foreground">
          {value}
        </p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">
          {title}
        </p>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
