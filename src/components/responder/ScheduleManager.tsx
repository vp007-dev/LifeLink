import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ResponderNetwork, ResponderSchedule } from '@/lib/responderNetwork';
import { useToast } from '@/hooks/use-toast';

interface ScheduleManagerProps {
  responderId: string;
  className?: string;
}

const DAYS = [
  { value: 0, label: 'Sun', fullLabel: 'Sunday' },
  { value: 1, label: 'Mon', fullLabel: 'Monday' },
  { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { value: 4, label: 'Thu', fullLabel: 'Thursday' },
  { value: 5, label: 'Fri', fullLabel: 'Friday' },
  { value: 6, label: 'Sat', fullLabel: 'Saturday' },
];

const DEFAULT_SHIFT = {
  shift_start: '08:00:00',
  shift_end: '20:00:00',
  is_active: true,
};

const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  responderId,
  className,
}) => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Record<number, ResponderSchedule>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    loadSchedules();
  }, [responderId]);

  const loadSchedules = async () => {
    setLoading(true);
    const data = await ResponderNetwork.getResponderSchedule(responderId);
    const scheduleMap: Record<number, ResponderSchedule> = {};
    data.forEach(s => {
      scheduleMap[s.day_of_week] = s;
    });
    setSchedules(scheduleMap);
    setLoading(false);
  };

  const handleDayToggle = async (dayOfWeek: number, isActive: boolean) => {
    const current = schedules[dayOfWeek] || { 
      ...DEFAULT_SHIFT, 
      responder_id: responderId,
      day_of_week: dayOfWeek 
    };
    
    const success = await ResponderNetwork.updateSchedule(
      responderId,
      dayOfWeek,
      current.shift_start,
      current.shift_end,
      isActive
    );

    if (success) {
      setSchedules(prev => ({
        ...prev,
        [dayOfWeek]: { ...current, is_active: isActive } as ResponderSchedule
      }));
    }
  };

  const handleTimeChange = (
    dayOfWeek: number, 
    field: 'shift_start' | 'shift_end', 
    value: string
  ) => {
    const timeValue = value + ':00'; // Add seconds
    setSchedules(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...(prev[dayOfWeek] || { 
          ...DEFAULT_SHIFT, 
          responder_id: responderId,
          day_of_week: dayOfWeek 
        }),
        [field]: timeValue
      } as ResponderSchedule
    }));
  };

  const handleSaveDay = async (dayOfWeek: number) => {
    setSaving(true);
    const schedule = schedules[dayOfWeek] || DEFAULT_SHIFT;
    
    const success = await ResponderNetwork.updateSchedule(
      responderId,
      dayOfWeek,
      schedule.shift_start,
      schedule.shift_end,
      schedule.is_active ?? true
    );

    setSaving(false);
    
    if (success) {
      toast({
        title: 'Schedule Updated',
        description: `${DAYS[dayOfWeek].fullLabel} schedule saved.`,
      });
      setSelectedDay(null);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to save schedule.',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (time: string) => {
    // Remove seconds for display
    return time.slice(0, 5);
  };

  if (loading) {
    return (
      <div className={cn("p-4 rounded-xl bg-secondary animate-pulse", className)}>
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="space-y-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Weekly Schedule</h3>
      </div>

      <div className="space-y-2">
        {DAYS.map((day) => {
          const schedule = schedules[day.value];
          const isActive = schedule?.is_active ?? false;
          const isSelected = selectedDay === day.value;

          return (
            <div
              key={day.value}
              className={cn(
                "rounded-xl border transition-all",
                isActive ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/50"
              )}
            >
              <div 
                className="flex items-center justify-between p-3 cursor-pointer"
                onClick={() => setSelectedDay(isSelected ? null : day.value)}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "w-10 text-sm font-medium",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {day.label}
                  </span>
                  <Switch
                    checked={isActive}
                    onCheckedChange={(checked) => handleDayToggle(day.value, checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                {isActive && schedule && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(schedule.shift_start)} - {formatTime(schedule.shift_end)}</span>
                  </div>
                )}
              </div>

              {/* Expanded time editor */}
              {isSelected && isActive && (
                <div className="p-3 pt-0 space-y-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Start Time</label>
                      <input
                        type="time"
                        value={formatTime(schedule?.shift_start || DEFAULT_SHIFT.shift_start)}
                        onChange={(e) => handleTimeChange(day.value, 'shift_start', e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">End Time</label>
                      <input
                        type="time"
                        value={formatTime(schedule?.shift_end || DEFAULT_SHIFT.shift_end)}
                        onChange={(e) => handleTimeChange(day.value, 'shift_end', e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground"
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSaveDay(day.value)}
                    disabled={saving}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save {day.fullLabel}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleManager;