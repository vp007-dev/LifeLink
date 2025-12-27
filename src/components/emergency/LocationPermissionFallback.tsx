import React from 'react';
import { MapPinOff, Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LocationPermissionFallbackProps {
  error: string;
  onRetry: () => void;
}

const LocationPermissionFallback: React.FC<LocationPermissionFallbackProps> = ({
  error,
  onRetry,
}) => {
  return (
    <Card variant="outline" className="border-destructive/50 bg-destructive/5">
      <CardContent className="p-4 pt-4 text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-3">
          <MapPinOff className="w-6 h-6 text-destructive" />
        </div>
        
        <h3 className="font-semibold text-foreground mb-2">Location Access Required</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        
        <div className="space-y-2">
          <Button onClick={onRetry} className="w-full" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <div className="text-xs text-muted-foreground">
            <p className="mb-2">To enable location access:</p>
            <ol className="text-left space-y-1 pl-4">
              <li>1. Open browser settings</li>
              <li>2. Go to Site Settings → Location</li>
              <li>3. Allow location for this site</li>
              <li>4. Refresh and try again</li>
            </ol>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-amber-400">
            ⚠️ Without location, responders cannot find you. In an emergency, call 112 directly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationPermissionFallback;
