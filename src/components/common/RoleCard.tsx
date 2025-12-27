import React from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RoleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  variant?: 'default' | 'emergency' | 'primary';
  onClick: () => void;
  className?: string;
}

const RoleCard: React.FC<RoleCardProps> = ({
  title,
  description,
  icon: Icon,
  variant = 'default',
  onClick,
  className,
}) => {
  const variantStyles = {
    default: 'hover:border-primary/50',
    emergency: 'hover:border-emergency/50 bg-emergency/5',
    primary: 'hover:border-primary/50 bg-primary/5',
  };

  const iconStyles = {
    default: 'text-muted-foreground bg-secondary',
    emergency: 'text-emergency bg-emergency/10',
    primary: 'text-primary bg-primary/10',
  };

  return (
    <Card
      variant="gradient"
      className={cn(
        "cursor-pointer transition-all duration-200 active:scale-[0.98]",
        variantStyles[variant],
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-xl",
            iconStyles[variant]
          )}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleCard;
