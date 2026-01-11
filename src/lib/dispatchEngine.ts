/**
 * Smart Dispatch Engine - Client SDK
 * 
 * Features:
 * 1. Priority-based routing (critical > high > medium > low)
 * 2. Multi-responder broadcast (no single failure)
 * 3. Lock-on accept logic (prevents conflicts)
 * 4. SLA timer (governance compliance)
 */

import { supabase } from '@/integrations/supabase/client';

// Emergency priority levels
export type EmergencyPriority = 'critical' | 'high' | 'medium' | 'low';

// Emergency types mapped to priorities
export const EMERGENCY_TYPES = {
  // Critical (3 min SLA)
  heart_attack: { label: 'Heart Attack', priority: 'critical' as EmergencyPriority },
  stroke: { label: 'Stroke', priority: 'critical' as EmergencyPriority },
  cardiac_arrest: { label: 'Cardiac Arrest', priority: 'critical' as EmergencyPriority },
  severe_trauma: { label: 'Severe Trauma', priority: 'critical' as EmergencyPriority },
  
  // High (5 min SLA)
  accident: { label: 'Accident', priority: 'high' as EmergencyPriority },
  severe_bleeding: { label: 'Severe Bleeding', priority: 'high' as EmergencyPriority },
  breathing_difficulty: { label: 'Breathing Difficulty', priority: 'high' as EmergencyPriority },
  fracture: { label: 'Fracture', priority: 'high' as EmergencyPriority },
  
  // Medium (10 min SLA)
  minor_injury: { label: 'Minor Injury', priority: 'medium' as EmergencyPriority },
  fall: { label: 'Fall', priority: 'medium' as EmergencyPriority },
  general: { label: 'General Emergency', priority: 'medium' as EmergencyPriority },
  
  // Low (15 min SLA)
  non_urgent: { label: 'Non-Urgent', priority: 'low' as EmergencyPriority },
  assistance: { label: 'Assistance Required', priority: 'low' as EmergencyPriority },
};

// SLA times in minutes
export const SLA_TIMES: Record<EmergencyPriority, number> = {
  critical: 3,
  high: 5,
  medium: 10,
  low: 15,
};

// Priority colors for UI
export const PRIORITY_COLORS: Record<EmergencyPriority, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-500', text: 'text-white', border: 'border-red-500' },
  high: { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-500' },
  medium: { bg: 'bg-yellow-500', text: 'text-black', border: 'border-yellow-500' },
  low: { bg: 'bg-green-500', text: 'text-white', border: 'border-green-500' },
};

export interface CreateEmergencyParams {
  patient_name?: string;
  patient_phone?: string;
  patient_lat: number;
  patient_lng: number;
  emergency_type: keyof typeof EMERGENCY_TYPES;
  description?: string;
}

export interface EmergencyResponse {
  success: boolean;
  emergency?: any;
  broadcast_count?: number;
  message?: string;
  error?: string;
}

export interface SLAStatus {
  emergency_id: string;
  priority: EmergencyPriority;
  sla_deadline: string;
  remaining_minutes: number;
  is_breached: boolean;
  status: string;
}

/**
 * Smart Dispatch Engine Client
 */
export const DispatchEngine = {
  /**
   * Create a new emergency and automatically dispatch to nearby responders
   * Uses priority-based routing and multi-responder broadcast
   */
  async createEmergency(params: CreateEmergencyParams): Promise<EmergencyResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('smart-dispatch', {
        body: {
          action: 'create_emergency',
          ...params,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[DispatchEngine] Create emergency error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create emergency',
      };
    }
  },

  /**
   * Accept an emergency with lock-on logic
   * Prevents multiple responders from accepting the same emergency
   */
  async acceptEmergency(emergencyId: string, responderId: string): Promise<EmergencyResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('smart-dispatch', {
        body: {
          action: 'accept_emergency',
          emergency_id: emergencyId,
          responder_id: responderId,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[DispatchEngine] Accept emergency error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to accept emergency',
      };
    }
  },

  /**
   * Reject an emergency and potentially trigger re-broadcast
   */
  async rejectEmergency(emergencyId: string, responderId: string, reason?: string): Promise<EmergencyResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('smart-dispatch', {
        body: {
          action: 'reject_emergency',
          emergency_id: emergencyId,
          responder_id: responderId,
          reason,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[DispatchEngine] Reject emergency error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reject emergency',
      };
    }
  },

  /**
   * Complete an emergency and update SLA tracking
   */
  async completeEmergency(emergencyId: string, responderId: string): Promise<EmergencyResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('smart-dispatch', {
        body: {
          action: 'complete_emergency',
          emergency_id: emergencyId,
          responder_id: responderId,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[DispatchEngine] Complete emergency error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete emergency',
      };
    }
  },

  /**
   * Check SLA status for an emergency
   */
  async checkSLA(emergencyId: string): Promise<SLAStatus | null> {
    try {
      const { data, error } = await supabase.functions.invoke('smart-dispatch', {
        body: {
          action: 'check_sla',
          emergency_id: emergencyId,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[DispatchEngine] Check SLA error:', error);
      return null;
    }
  },

  /**
   * Update responder location (for ETA calculations)
   */
  async updateResponderLocation(responderId: string, lat: number, lng: number): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('smart-dispatch', {
        body: {
          action: 'update_location',
          responder_id: responderId,
          lat,
          lng,
        },
      });

      if (error) throw error;
      return data?.success ?? false;
    } catch (error) {
      console.error('[DispatchEngine] Update location error:', error);
      return false;
    }
  },

  /**
   * Get pending alerts for a responder
   */
  async getPendingAlerts(responderId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.functions.invoke('smart-dispatch', {
        body: {
          action: 'get_pending_alerts',
          responder_id: responderId,
        },
      });

      if (error) throw error;
      return data?.alerts ?? [];
    } catch (error) {
      console.error('[DispatchEngine] Get pending alerts error:', error);
      return [];
    }
  },

  /**
   * Subscribe to real-time emergency updates
   */
  subscribeToEmergencies(callback: (payload: any) => void) {
    const channel = supabase
      .channel('emergencies-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergencies',
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Subscribe to dispatch broadcasts for a specific responder
   */
  subscribeToBroadcasts(responderId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`broadcasts-${responderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dispatch_broadcasts',
          filter: `responder_id=eq.${responderId}`,
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Subscribe to assignment updates
   */
  subscribeToAssignments(callback: (payload: any) => void) {
    const channel = supabase
      .channel('assignments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_assignments',
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};

/**
 * SLA Timer Hook Helper
 * Use this in components to track SLA countdown
 */
export function calculateSLARemaining(slaDeadline: string): {
  remainingMs: number;
  remainingMinutes: number;
  remainingSeconds: number;
  isBreached: boolean;
  urgencyLevel: 'normal' | 'warning' | 'critical' | 'breached';
} {
  const now = new Date();
  const deadline = new Date(slaDeadline);
  const remainingMs = deadline.getTime() - now.getTime();
  const remainingMinutes = Math.floor(remainingMs / 60000);
  const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);
  const isBreached = remainingMs < 0;

  let urgencyLevel: 'normal' | 'warning' | 'critical' | 'breached' = 'normal';
  if (isBreached) {
    urgencyLevel = 'breached';
  } else if (remainingMinutes <= 1) {
    urgencyLevel = 'critical';
  } else if (remainingMinutes <= 2) {
    urgencyLevel = 'warning';
  }

  return {
    remainingMs,
    remainingMinutes: Math.max(0, remainingMinutes),
    remainingSeconds: Math.max(0, remainingSeconds),
    isBreached,
    urgencyLevel,
  };
}

export default DispatchEngine;
