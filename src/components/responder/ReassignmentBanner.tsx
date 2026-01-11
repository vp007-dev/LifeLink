import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ReassignmentReason } from '@/lib/responderNetwork';

interface ReassignmentBannerProps {
  reason: ReassignmentReason;
  onRetry?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

const REASON_MESSAGES: Record<ReassignmentReason, { title: string; description: string }> = {
  timeout: {
    title: 'Response Timeout',
    description: 'The assigned responder did not respond in time. Finding a new responder...',
  },
  responder_unavailable: {
    title: 'Responder Unavailable',
    description: 'The responder is no longer available. Reassigning to another responder...',
  },
  responder_rejected: {
    title: 'Responder Declined',
    description: 'The responder declined this emergency. Finding an alternative...',
  },
  vehicle_breakdown: {
    title: 'Vehicle Issue',
    description: 'The responder reported a vehicle problem. Dispatching backup...',
  },
  manual_override: {
    title: 'Manual Reassignment',
    description: 'This emergency is being reassigned by dispatch control.',
  },
  better_match_found: {
    title: 'Optimizing Response',
    description: 'A faster responder became available nearby.',
  },
};

const ReassignmentBanner: React.FC<ReassignmentBannerProps> = ({
  reason,
  onRetry,
  onCancel,
  isLoading = false,
  className,
}) => {
  const message = REASON_MESSAGES[reason];

  return (
    <div
      className={cn(
        "p-4 rounded-xl bg-orange-500/10 border border-orange-500/30",
        "animate-fade-in-up",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
          {isLoading ? (
            <RefreshCw className="w-5 h-5 text-orange-500 animate-spin" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          )}
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-orange-600 dark:text-orange-400">
            {message.title}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {message.description}
          </p>
          
          {(onRetry || onCancel) && (
            <div className="flex gap-2 mt-3">
              {onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  disabled={isLoading}
                  className="border-orange-500/30 text-orange-600 hover:bg-orange-500/10"
                >
                  <RefreshCw className={cn("w-4 h-4 mr-1", isLoading && "animate-spin")} />
                  Retry
                </Button>
              )}
              {onCancel && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReassignmentBanner;