import React from 'react';
import { EMERGENCY_TYPES, PRIORITY_COLORS, EmergencyPriority } from '@/lib/dispatchEngine';
import { cn } from '@/lib/utils';
import { Heart, Car, Bone, Wind, UserX, HelpCircle, AlertTriangle, Activity } from 'lucide-react';

interface EmergencyTypeSelectorProps {
  selected: keyof typeof EMERGENCY_TYPES | null;
  onSelect: (type: keyof typeof EMERGENCY_TYPES) => void;
}

const EMERGENCY_ICONS: Record<keyof typeof EMERGENCY_TYPES, React.ReactNode> = {
  heart_attack: <Heart className="w-5 h-5" />,
  stroke: <Activity className="w-5 h-5" />,
  cardiac_arrest: <Heart className="w-5 h-5" />,
  severe_trauma: <AlertTriangle className="w-5 h-5" />,
  accident: <Car className="w-5 h-5" />,
  severe_bleeding: <AlertTriangle className="w-5 h-5" />,
  breathing_difficulty: <Wind className="w-5 h-5" />,
  fracture: <Bone className="w-5 h-5" />,
  minor_injury: <UserX className="w-5 h-5" />,
  fall: <UserX className="w-5 h-5" />,
  general: <HelpCircle className="w-5 h-5" />,
  non_urgent: <HelpCircle className="w-5 h-5" />,
  assistance: <HelpCircle className="w-5 h-5" />,
};

const EmergencyTypeSelector: React.FC<EmergencyTypeSelectorProps> = ({
  selected,
  onSelect,
}) => {
  // Group by priority
  const groupedTypes = Object.entries(EMERGENCY_TYPES).reduce(
    (acc, [key, value]) => {
      if (!acc[value.priority]) {
        acc[value.priority] = [];
      }
      acc[value.priority].push({ key: key as keyof typeof EMERGENCY_TYPES, ...value });
      return acc;
    },
    {} as Record<EmergencyPriority, Array<{ key: keyof typeof EMERGENCY_TYPES; label: string; priority: EmergencyPriority }>>
  );

  const priorityOrder: EmergencyPriority[] = ['critical', 'high', 'medium', 'low'];
  const priorityLabels: Record<EmergencyPriority, string> = {
    critical: '🔴 Critical (3 min SLA)',
    high: '🟠 High (5 min SLA)',
    medium: '🟡 Medium (10 min SLA)',
    low: '🟢 Low (15 min SLA)',
  };

  return (
    <div className="space-y-4">
      {priorityOrder.map((priority) => (
        <div key={priority}>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">
            {priorityLabels[priority]}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {groupedTypes[priority]?.map(({ key, label }) => {
              const isSelected = selected === key;
              const colors = PRIORITY_COLORS[priority];

              return (
                <button
                  key={key}
                  onClick={() => onSelect(key)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border-2 transition-all',
                    'text-left text-sm font-medium',
                    isSelected
                      ? cn(colors.bg, colors.text, colors.border)
                      : 'bg-card border-border hover:border-primary/50'
                  )}
                >
                  <span className={isSelected ? '' : 'opacity-60'}>
                    {EMERGENCY_ICONS[key]}
                  </span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmergencyTypeSelector;
