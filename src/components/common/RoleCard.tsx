import React from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';
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
    default: 'bg-secondary',
    emergency: 'bg-emergency/10',
    primary: 'bg-primary/10',
  };

  const iconStyles = {
    default: 'text-foreground bg-background',
    emergency: 'text-emergency bg-emergency/10',
    primary: 'text-primary bg-primary/10',
  };

  const iconWrapperStyles = {
    default: 'bg-background',
    emergency: 'bg-white',
    primary: 'bg-white',
  };

  return (
    <button
      className={cn(
        "w-full p-4 rounded-2xl transition-all duration-200 touch-feedback",
        variantStyles[variant],
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          iconWrapperStyles[variant]
        )}>
          <Icon className={cn("w-6 h-6", iconStyles[variant].split(' ')[0])} />
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </button>
  );
};

export default RoleCard;
