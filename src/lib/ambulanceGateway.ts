import { supabase } from '@/integrations/supabase/client';

// Government Ambulance API Gateway Client SDK

export interface AmbulanceDispatchRequest {
  emergency_id: string;
  patient_lat: number;
  patient_lng: number;
  emergency_type: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  patient_name?: string;
  patient_phone?: string;
  description?: string;
  requester_type?: 'citizen' | 'hospital' | 'police' | 'fire_dept';
}

export interface AmbulanceDispatchResponse {
  success: boolean;
  dispatch_id?: string;
  ambulance_type?: string;
  zone?: string;
  base_station?: string;
  eta_minutes?: number;
  tracking_url?: string;
  contact_number?: string;
  error?: string;
  error_code?: string;
  retry_after_seconds?: number;
}

export interface AmbulanceStatusResponse {
  success: boolean;
  dispatch_id?: string;
  status?: 'dispatched' | 'en_route' | 'arrived' | 'completed' | 'cancelled';
  ambulance_type?: string;
  base_station?: string;
  eta_remaining_minutes?: number;
  elapsed_minutes?: number;
  equipment_onboard?: string[];
  error?: string;
}

export interface AmbulanceAvailability {
  success: boolean;
  timestamp?: string;
  overall?: {
    total_units: number;
    available_units: number;
    utilization_percent: number;
  };
  zones?: Array<{
    zone_id: string;
    base_station: string;
    total_units: number;
    available_units: number;
    utilization_percent: number;
  }>;
  ambulance_types?: Array<{
    type_id: string;
    name: string;
    handles_priority: string[];
    equipment: string[];
  }>;
  error?: string;
}

/**
 * Government Ambulance API Gateway
 * Provides interface to government ambulance dispatch system
 */
export const AmbulanceGateway = {
  /**
   * Dispatch a government ambulance to an emergency
   */
  async dispatch(request: AmbulanceDispatchRequest): Promise<AmbulanceDispatchResponse> {
    try {
      console.log('[AmbulanceGateway] Dispatching ambulance:', request);

      const { data, error } = await supabase.functions.invoke('ambulance-dispatch', {
        body: { ...request, action: 'dispatch' },
      });

      if (error) {
        console.error('[AmbulanceGateway] Dispatch error:', error);
        return {
          success: false,
          error: error.message,
          error_code: 'INVOKE_ERROR',
        };
      }

      console.log('[AmbulanceGateway] Dispatch response:', data);
      return data as AmbulanceDispatchResponse;
    } catch (err) {
      console.error('[AmbulanceGateway] Dispatch exception:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        error_code: 'EXCEPTION',
      };
    }
  },

  /**
   * Get status of an ambulance dispatch
   */
  async getStatus(dispatchId: string): Promise<AmbulanceStatusResponse> {
    try {
      console.log('[AmbulanceGateway] Getting status for:', dispatchId);

      const { data, error } = await supabase.functions.invoke('ambulance-dispatch', {
        body: { action: 'status', dispatch_id: dispatchId },
      });

      if (error) {
        console.error('[AmbulanceGateway] Status error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      return data as AmbulanceStatusResponse;
    } catch (err) {
      console.error('[AmbulanceGateway] Status exception:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },

  /**
   * Cancel an ambulance dispatch
   */
  async cancel(dispatchId: string, reason?: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log('[AmbulanceGateway] Cancelling dispatch:', dispatchId);

      const { data, error } = await supabase.functions.invoke('ambulance-dispatch', {
        body: { action: 'cancel', dispatch_id: dispatchId, reason },
      });

      if (error) {
        console.error('[AmbulanceGateway] Cancel error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      return data;
    } catch (err) {
      console.error('[AmbulanceGateway] Cancel exception:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },

  /**
   * Get current ambulance fleet availability
   */
  async getAvailability(): Promise<AmbulanceAvailability> {
    try {
      console.log('[AmbulanceGateway] Getting availability');

      const { data, error } = await supabase.functions.invoke('ambulance-dispatch', {
        body: { action: 'availability' },
      });

      if (error) {
        console.error('[AmbulanceGateway] Availability error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      return data as AmbulanceAvailability;
    } catch (err) {
      console.error('[AmbulanceGateway] Availability exception:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },

  /**
   * Subscribe to ambulance status updates
   */
  subscribeToUpdates(dispatchId: string, callback: (status: AmbulanceStatusResponse) => void) {
    let intervalId: NodeJS.Timeout;

    const pollStatus = async () => {
      const status = await this.getStatus(dispatchId);
      callback(status);

      // Stop polling if arrived or completed
      if (status.status === 'arrived' || status.status === 'completed' || status.status === 'cancelled') {
        clearInterval(intervalId);
      }
    };

    // Poll every 10 seconds
    intervalId = setInterval(pollStatus, 10000);
    
    // Initial poll
    pollStatus();

    // Return unsubscribe function
    return () => {
      clearInterval(intervalId);
    };
  },
};

export default AmbulanceGateway;