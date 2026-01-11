import { useState, useEffect, useCallback } from 'react';
import { calculateSLARemaining } from '@/lib/dispatchEngine';

interface UseSLATimerOptions {
  onBreach?: () => void;
  onWarning?: () => void;
  onCritical?: () => void;
}

export function useSLATimer(slaDeadline: string | null, options: UseSLATimerOptions = {}) {
  const [slaStatus, setSlaStatus] = useState(() => 
    slaDeadline ? calculateSLARemaining(slaDeadline) : null
  );
  const [hasNotifiedBreach, setHasNotifiedBreach] = useState(false);
  const [hasNotifiedWarning, setHasNotifiedWarning] = useState(false);
  const [hasNotifiedCritical, setHasNotifiedCritical] = useState(false);

  const reset = useCallback(() => {
    setHasNotifiedBreach(false);
    setHasNotifiedWarning(false);
    setHasNotifiedCritical(false);
  }, []);

  useEffect(() => {
    if (!slaDeadline) {
      setSlaStatus(null);
      return;
    }

    const interval = setInterval(() => {
      const newStatus = calculateSLARemaining(slaDeadline);
      setSlaStatus(newStatus);

      // Trigger callbacks based on urgency level
      if (newStatus.isBreached && !hasNotifiedBreach && options.onBreach) {
        options.onBreach();
        setHasNotifiedBreach(true);
      }

      if (newStatus.urgencyLevel === 'critical' && !hasNotifiedCritical && options.onCritical) {
        options.onCritical();
        setHasNotifiedCritical(true);
      }

      if (newStatus.urgencyLevel === 'warning' && !hasNotifiedWarning && options.onWarning) {
        options.onWarning();
        setHasNotifiedWarning(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [slaDeadline, hasNotifiedBreach, hasNotifiedWarning, hasNotifiedCritical, options]);

  return {
    ...slaStatus,
    reset,
    isActive: !!slaDeadline,
  };
}

export default useSLATimer;
