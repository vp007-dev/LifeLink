/**
 * Responder Network Engine - Client SDK
 * 
 * Features:
 * 1. Traffic-aware ETA routing (Leaflet routing + ETA calc)
 * 2. Vehicle type prioritization (Bike / Auto / Ambulance / Police routing)
 * 3. Reassignment engine (Auto re-route if responder fails)
 * 4. Availability scheduler (On-duty/off-duty system)
 */

import { supabase } from '@/integrations/supabase/client';

// Vehicle types with speed profiles (km/h)
export type VehicleType = 'bike' | 'auto' | 'ambulance' | 'police' | 'car';

export interface VehicleProfile {
  type: VehicleType;
  label: string;
  icon: string;
  avgSpeed: number; // km/h in normal traffic
  peakSpeed: number; // km/h with priority/sirens
  trafficMultiplier: number; // How much traffic affects this vehicle
  priorityScore: number; // Higher = better for critical emergencies
  canUseSirens: boolean;
}

// Vehicle speed profiles for ETA calculations
export const VEHICLE_PROFILES: Record<VehicleType, VehicleProfile> = {
  bike: {
    type: 'bike',
    label: 'Bike',
    icon: '🏍️',
    avgSpeed: 25,
    peakSpeed: 40,
    trafficMultiplier: 0.3, // Less affected by traffic
    priorityScore: 60,
    canUseSirens: false,
  },
  auto: {
    type: 'auto',
    label: 'Auto Rickshaw',
    icon: '🛺',
    avgSpeed: 20,
    peakSpeed: 30,
    trafficMultiplier: 0.5,
    priorityScore: 40,
    canUseSirens: false,
  },
  car: {
    type: 'car',
    label: 'Car',
    icon: '🚗',
    avgSpeed: 30,
    peakSpeed: 50,
    trafficMultiplier: 0.7,
    priorityScore: 50,
    canUseSirens: false,
  },
  ambulance: {
    type: 'ambulance',
    label: 'Ambulance',
    icon: '🚑',
    avgSpeed: 35,
    peakSpeed: 60,
    trafficMultiplier: 0.2, // Sirens help
    priorityScore: 100,
    canUseSirens: true,
  },
  police: {
    type: 'police',
    label: 'Police',
    icon: '🚔',
    avgSpeed: 40,
    peakSpeed: 80,
    trafficMultiplier: 0.15, // Sirens + training
    priorityScore: 90,
    canUseSirens: true,
  },
};

// Traffic conditions
export type TrafficLevel = 'free' | 'light' | 'moderate' | 'heavy' | 'severe';

export const TRAFFIC_MULTIPLIERS: Record<TrafficLevel, number> = {
  free: 1.0,
  light: 1.2,
  moderate: 1.5,
  heavy: 2.0,
  severe: 3.0,
};

// Time-based traffic estimation (for India)
export function estimateTrafficLevel(hour: number): TrafficLevel {
  // Peak hours: 8-10 AM and 5-8 PM
  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
    return 'heavy';
  }
  // Moderate: 7-8 AM, 10 AM - 5 PM
  if ((hour >= 7 && hour < 8) || (hour > 10 && hour < 17)) {
    return 'moderate';
  }
  // Light: 6-7 AM, 8-10 PM
  if ((hour >= 6 && hour < 7) || (hour >= 20 && hour <= 22)) {
    return 'light';
  }
  // Free: Late night / early morning
  return 'free';
}

// Reassignment reasons
export type ReassignmentReason = 
  | 'timeout' 
  | 'responder_unavailable' 
  | 'responder_rejected' 
  | 'vehicle_breakdown' 
  | 'manual_override'
  | 'better_match_found';

// Schedule types
export interface ResponderSchedule {
  id: string;
  responder_id: string;
  day_of_week: number; // 0-6, 0 = Sunday
  shift_start: string; // HH:MM:SS
  shift_end: string;
  is_active: boolean;
}

export interface ResponderWithVehicle {
  id: string;
  name: string;
  phone: string | null;
  vehicle_type: VehicleType;
  current_lat: number | null;
  current_lng: number | null;
  status: 'available' | 'busy' | 'offline';
  rating: number;
  total_rescues: number;
  is_on_duty: boolean;
  shift_start: string;
  shift_end: string;
  max_range_km: number;
}

export interface TrafficAwareETA {
  distanceKm: number;
  baseEtaMinutes: number;
  trafficAdjustedEtaMinutes: number;
  trafficLevel: TrafficLevel;
  vehicleType: VehicleType;
  usingSirens: boolean;
}

export interface ReassignmentResult {
  success: boolean;
  newResponderId?: string;
  reason: ReassignmentReason;
  message: string;
}

/**
 * Calculate distance using Haversine formula
 */
export function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate traffic-aware ETA based on vehicle type and current traffic
 */
export function calculateTrafficAwareETA(
  distanceKm: number,
  vehicleType: VehicleType,
  trafficLevel?: TrafficLevel,
  isEmergency: boolean = true
): TrafficAwareETA {
  const vehicle = VEHICLE_PROFILES[vehicleType];
  const traffic = trafficLevel || estimateTrafficLevel(new Date().getHours());
  const trafficMultiplier = TRAFFIC_MULTIPLIERS[traffic];
  
  // Use peak speed for emergencies with sirens
  const usingSirens = isEmergency && vehicle.canUseSirens;
  const baseSpeed = usingSirens ? vehicle.peakSpeed : vehicle.avgSpeed;
  
  // Calculate base ETA
  const baseEtaMinutes = Math.ceil((distanceKm / baseSpeed) * 60);
  
  // Apply traffic adjustment (reduced for vehicles less affected by traffic)
  const effectiveTrafficMultiplier = 1 + (trafficMultiplier - 1) * vehicle.trafficMultiplier;
  const trafficAdjustedEtaMinutes = Math.ceil(baseEtaMinutes * effectiveTrafficMultiplier);
  
  return {
    distanceKm,
    baseEtaMinutes,
    trafficAdjustedEtaMinutes,
    trafficLevel: traffic,
    vehicleType,
    usingSirens,
  };
}

/**
 * Score responders based on vehicle type, distance, and priority
 */
export function scoreResponderForEmergency(
  responder: ResponderWithVehicle,
  patientLat: number,
  patientLng: number,
  emergencyPriority: 'critical' | 'high' | 'medium' | 'low'
): number {
  if (!responder.current_lat || !responder.current_lng) return 0;
  
  const distance = calculateDistance(
    responder.current_lat,
    responder.current_lng,
    patientLat,
    patientLng
  );
  
  // If outside max range, score is 0
  if (distance > responder.max_range_km) return 0;
  
  const vehicle = VEHICLE_PROFILES[responder.vehicle_type] || VEHICLE_PROFILES.bike;
  const eta = calculateTrafficAwareETA(distance, responder.vehicle_type);
  
  // Distance score (closer = higher, max 40 points)
  const distanceScore = Math.max(0, 40 - (distance * 4));
  
  // ETA score (faster = higher, max 25 points)
  const etaScore = Math.max(0, 25 - eta.trafficAdjustedEtaMinutes);
  
  // Vehicle priority score (max 20 points)
  // Critical emergencies favor ambulances/police
  let vehiclePriorityBonus = 0;
  if (emergencyPriority === 'critical' || emergencyPriority === 'high') {
    vehiclePriorityBonus = (vehicle.priorityScore / 100) * 20;
  } else {
    // For lower priority, bikes are actually better (faster, more agile)
    vehiclePriorityBonus = vehicle.type === 'bike' ? 15 : 10;
  }
  
  // Rating score (max 10 points)
  const ratingScore = (responder.rating || 5) * 2;
  
  // Experience score (max 5 points)
  const experienceScore = Math.min(5, (responder.total_rescues || 0) * 0.5);
  
  return distanceScore + etaScore + vehiclePriorityBonus + ratingScore + experienceScore;
}

/**
 * Responder Network Engine Client
 */
export const ResponderNetwork = {
  /**
   * Get current traffic level based on time
   */
  getCurrentTrafficLevel(): TrafficLevel {
    return estimateTrafficLevel(new Date().getHours());
  },

  /**
   * Calculate ETA for a specific responder to a location
   */
  getResponderETA(
    responderLat: number,
    responderLng: number,
    destLat: number,
    destLng: number,
    vehicleType: VehicleType
  ): TrafficAwareETA {
    const distance = calculateDistance(responderLat, responderLng, destLat, destLng);
    return calculateTrafficAwareETA(distance, vehicleType);
  },

  /**
   * Update responder's duty status
   */
  async toggleDutyStatus(responderId: string, isOnDuty: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('responders')
        .update({ 
          is_on_duty: isOnDuty,
          duty_started_at: isOnDuty ? new Date().toISOString() : null,
          status: isOnDuty ? 'available' : 'offline'
        })
        .eq('id', responderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[ResponderNetwork] Toggle duty error:', error);
      return false;
    }
  },

  /**
   * Get responder's schedule for the week
   */
  async getResponderSchedule(responderId: string): Promise<ResponderSchedule[]> {
    try {
      const { data, error } = await supabase
        .from('responder_schedules')
        .select('*')
        .eq('responder_id', responderId)
        .order('day_of_week');

      if (error) throw error;
      return (data || []) as unknown as ResponderSchedule[];
    } catch (error) {
      console.error('[ResponderNetwork] Get schedule error:', error);
      return [];
    }
  },

  /**
   * Update responder's schedule for a specific day
   */
  async updateSchedule(
    responderId: string,
    dayOfWeek: number,
    shiftStart: string,
    shiftEnd: string,
    isActive: boolean
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('responder_schedules')
        .upsert({
          responder_id: responderId,
          day_of_week: dayOfWeek,
          shift_start: shiftStart,
          shift_end: shiftEnd,
          is_active: isActive
        }, {
          onConflict: 'responder_id,day_of_week'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[ResponderNetwork] Update schedule error:', error);
      return false;
    }
  },

  /**
   * Check if responder is currently on schedule
   */
  async isResponderOnSchedule(responderId: string): Promise<boolean> {
    try {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0-6
      const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS

      const { data, error } = await supabase
        .from('responder_schedules')
        .select('*')
        .eq('responder_id', responderId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .gte('shift_end', currentTime)
        .lte('shift_start', currentTime)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('[ResponderNetwork] Check schedule error:', error);
      return false;
    }
  },

  /**
   * Update responder's vehicle type
   */
  async updateVehicleType(responderId: string, vehicleType: VehicleType): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('responders')
        .update({ vehicle_type: vehicleType })
        .eq('id', responderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[ResponderNetwork] Update vehicle error:', error);
      return false;
    }
  },

  /**
   * Request reassignment for an emergency
   */
  async requestReassignment(
    emergencyId: string,
    currentResponderId: string,
    reason: ReassignmentReason
  ): Promise<ReassignmentResult> {
    try {
      const { data, error } = await supabase.functions.invoke('smart-dispatch', {
        body: {
          action: 'reassign_emergency',
          emergency_id: emergencyId,
          current_responder_id: currentResponderId,
          reason
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[ResponderNetwork] Reassignment error:', error);
      return {
        success: false,
        reason,
        message: error instanceof Error ? error.message : 'Reassignment failed'
      };
    }
  },

  /**
   * Get available responders with vehicle info
   */
  async getAvailableResponders(): Promise<ResponderWithVehicle[]> {
    try {
      const { data, error } = await supabase
        .from('responders')
        .select('*')
        .eq('status', 'available')
        .eq('is_on_duty', true);

      if (error) throw error;
      return (data || []) as unknown as ResponderWithVehicle[];
    } catch (error) {
      console.error('[ResponderNetwork] Get responders error:', error);
      return [];
    }
  },

  /**
   * Get best responders for an emergency (vehicle-prioritized)
   */
  async getBestRespondersForEmergency(
    patientLat: number,
    patientLng: number,
    emergencyPriority: 'critical' | 'high' | 'medium' | 'low',
    limit: number = 5
  ): Promise<Array<ResponderWithVehicle & { score: number; eta: TrafficAwareETA }>> {
    try {
      const responders = await this.getAvailableResponders();
      
      const scored = responders
        .map(r => ({
          ...r,
          score: scoreResponderForEmergency(r, patientLat, patientLng, emergencyPriority),
          eta: r.current_lat && r.current_lng 
            ? calculateTrafficAwareETA(
                calculateDistance(r.current_lat, r.current_lng, patientLat, patientLng),
                r.vehicle_type
              )
            : null as any
        }))
        .filter(r => r.score > 0 && r.eta)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return scored;
    } catch (error) {
      console.error('[ResponderNetwork] Get best responders error:', error);
      return [];
    }
  },

  /**
   * Subscribe to reassignment events
   */
  subscribeToReassignments(emergencyId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`reassignments-${emergencyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reassignment_logs',
          filter: `emergency_id=eq.${emergencyId}`
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Get reassignment history for an emergency
   */
  async getReassignmentHistory(emergencyId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('reassignment_logs')
        .select('*, from_responder:from_responder_id(*), to_responder:to_responder_id(*)')
        .eq('emergency_id', emergencyId)
        .order('reassigned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[ResponderNetwork] Get reassignment history error:', error);
      return [];
    }
  },
};

export default ResponderNetwork;