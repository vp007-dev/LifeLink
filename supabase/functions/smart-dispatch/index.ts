import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Priority weights for scoring
const PRIORITY_WEIGHTS = {
  critical: 100, // Heart attack, stroke, severe trauma
  high: 75,      // Accidents, severe injuries
  medium: 50,    // Minor injuries, general emergencies
  low: 25,       // Non-urgent assistance
};

// SLA times in minutes
const SLA_TIMES = {
  critical: 3,
  high: 5,
  medium: 10,
  low: 15,
};

// Emergency type to priority mapping
const EMERGENCY_TYPE_PRIORITY: Record<string, string> = {
  'heart_attack': 'critical',
  'stroke': 'critical',
  'severe_trauma': 'critical',
  'cardiac_arrest': 'critical',
  'accident': 'high',
  'severe_bleeding': 'high',
  'fracture': 'high',
  'breathing_difficulty': 'high',
  'minor_injury': 'medium',
  'fall': 'medium',
  'general': 'medium',
  'non_urgent': 'low',
  'assistance': 'low',
};

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate ETA based on distance (assuming avg speed of 30 km/h in urban areas)
function calculateETA(distanceKm: number): number {
  const avgSpeedKmh = 30;
  return Math.ceil((distanceKm / avgSpeedKmh) * 60);
}

// Score responders based on distance, rating, and availability
function scoreResponder(responder: any, patientLat: number, patientLng: number): number {
  const distance = calculateDistance(
    responder.current_lat,
    responder.current_lng,
    patientLat,
    patientLng
  );
  
  // Distance score (closer = higher score, max 50 points)
  const distanceScore = Math.max(0, 50 - (distance * 5));
  
  // Rating score (max 30 points)
  const ratingScore = (responder.rating || 5) * 6;
  
  // Experience score (max 20 points)
  const experienceScore = Math.min(20, (responder.total_rescues || 0) * 2);
  
  return distanceScore + ratingScore + experienceScore;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, ...params } = await req.json();
    console.log(`[SmartDispatch] Action: ${action}`, params);

    switch (action) {
      // ========================================
      // 1. CREATE EMERGENCY WITH PRIORITY ROUTING
      // ========================================
      case 'create_emergency': {
        const { 
          patient_name, 
          patient_phone, 
          patient_lat, 
          patient_lng, 
          emergency_type, 
          description 
        } = params;

        // Auto-assign priority based on emergency type
        const priority = EMERGENCY_TYPE_PRIORITY[emergency_type] || 'medium';
        
        console.log(`[SmartDispatch] Creating emergency - Type: ${emergency_type}, Priority: ${priority}`);

        // Create emergency record
        const { data: emergency, error: emergencyError } = await supabase
          .from('emergencies')
          .insert({
            patient_name,
            patient_phone,
            patient_lat,
            patient_lng,
            emergency_type,
            priority,
            description,
            status: 'pending'
          })
          .select()
          .single();

        if (emergencyError) {
          console.error('[SmartDispatch] Error creating emergency:', emergencyError);
          throw emergencyError;
        }

        // Log SLA event
        await supabase.from('sla_logs').insert({
          emergency_id: emergency.id,
          event_type: 'created',
          details: { priority, emergency_type, sla_deadline: emergency.sla_deadline }
        });

        console.log(`[SmartDispatch] Emergency created: ${emergency.id}`);

        // Immediately trigger multi-responder broadcast
        const broadcastResult = await broadcastToResponders(
          supabase, 
          emergency, 
          PRIORITY_WEIGHTS[priority as keyof typeof PRIORITY_WEIGHTS]
        );

        return new Response(JSON.stringify({
          success: true,
          emergency,
          broadcast_count: broadcastResult.count,
          message: `Emergency dispatched to ${broadcastResult.count} nearby responders`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // ========================================
      // 2. ACCEPT EMERGENCY WITH LOCK-ON LOGIC
      // ========================================
      case 'accept_emergency': {
        const { emergency_id, responder_id } = params;
        
        console.log(`[SmartDispatch] Responder ${responder_id} accepting emergency ${emergency_id}`);

        // Check if emergency is still available (not already accepted)
        const { data: emergency } = await supabase
          .from('emergencies')
          .select('*')
          .eq('id', emergency_id)
          .single();

        if (!emergency) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Emergency not found'
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (emergency.status !== 'pending' && emergency.status !== 'dispatching') {
          return new Response(JSON.stringify({
            success: false,
            error: 'Emergency already accepted by another responder',
            current_status: emergency.status
          }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // LOCK-ON: Use transaction-like behavior with optimistic locking
        const { data: updated, error: updateError } = await supabase
          .from('emergencies')
          .update({ status: 'accepted', updated_at: new Date().toISOString() })
          .eq('id', emergency_id)
          .in('status', ['pending', 'dispatching']) // Only update if still available
          .select()
          .single();

        if (updateError || !updated) {
          console.log('[SmartDispatch] Lock-on failed - emergency taken by another responder');
          return new Response(JSON.stringify({
            success: false,
            error: 'Emergency was just accepted by another responder'
          }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Update broadcast record
        await supabase
          .from('dispatch_broadcasts')
          .update({ 
            response_status: 'accepted', 
            responded_at: new Date().toISOString(),
            locked_at: new Date().toISOString()
          })
          .eq('emergency_id', emergency_id)
          .eq('responder_id', responder_id);

        // Expire all other broadcasts for this emergency
        await supabase
          .from('dispatch_broadcasts')
          .update({ response_status: 'expired' })
          .eq('emergency_id', emergency_id)
          .neq('responder_id', responder_id)
          .eq('response_status', 'pending');

        // Get responder location for ETA calculation
        const { data: responder } = await supabase
          .from('responders')
          .select('*')
          .eq('id', responder_id)
          .single();

        const distance = responder ? calculateDistance(
          responder.current_lat,
          responder.current_lng,
          emergency.patient_lat,
          emergency.patient_lng
        ) : 0;

        const eta = calculateETA(distance);

        // Create assignment record
        await supabase.from('emergency_assignments').insert({
          emergency_id,
          responder_id,
          eta_minutes: eta,
          current_distance_km: distance
        });

        // Update responder status
        await supabase
          .from('responders')
          .update({ status: 'busy' })
          .eq('id', responder_id);

        // Log SLA event
        await supabase.from('sla_logs').insert({
          emergency_id,
          event_type: 'accepted',
          details: { responder_id, eta_minutes: eta, distance_km: distance }
        });

        console.log(`[SmartDispatch] Emergency ${emergency_id} locked to responder ${responder_id}`);

        return new Response(JSON.stringify({
          success: true,
          message: 'Emergency accepted and locked',
          assignment: { emergency_id, responder_id, eta_minutes: eta, distance_km: distance }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // ========================================
      // 3. REJECT/DECLINE EMERGENCY
      // ========================================
      case 'reject_emergency': {
        const { emergency_id, responder_id, reason } = params;
        
        console.log(`[SmartDispatch] Responder ${responder_id} rejecting emergency ${emergency_id}`);

        await supabase
          .from('dispatch_broadcasts')
          .update({ 
            response_status: 'rejected', 
            responded_at: new Date().toISOString() 
          })
          .eq('emergency_id', emergency_id)
          .eq('responder_id', responder_id);

        // Check if we need to broadcast to more responders
        const { data: pendingBroadcasts } = await supabase
          .from('dispatch_broadcasts')
          .select('*')
          .eq('emergency_id', emergency_id)
          .eq('response_status', 'pending');

        if (!pendingBroadcasts || pendingBroadcasts.length === 0) {
          // No pending broadcasts, expand search radius
          const { data: emergency } = await supabase
            .from('emergencies')
            .select('*')
            .eq('id', emergency_id)
            .single();

          if (emergency && (emergency.status === 'pending' || emergency.status === 'dispatching')) {
            console.log('[SmartDispatch] Expanding search radius...');
            await broadcastToResponders(supabase, emergency, 50, 10); // Larger radius
          }
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Emergency rejected'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // ========================================
      // 4. COMPLETE EMERGENCY
      // ========================================
      case 'complete_emergency': {
        const { emergency_id, responder_id } = params;

        await supabase
          .from('emergencies')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', emergency_id);

        await supabase
          .from('emergency_assignments')
          .update({ completed_at: new Date().toISOString() })
          .eq('emergency_id', emergency_id);

        // Update responder stats
        await supabase.rpc('increment_responder_rescues', { p_responder_id: responder_id });

        // Free up responder
        await supabase
          .from('responders')
          .update({ status: 'available' })
          .eq('id', responder_id);

        // Log SLA event
        const { data: emergency } = await supabase
          .from('emergencies')
          .select('*, sla_deadline')
          .eq('id', emergency_id)
          .single();

        const slaBreached = emergency && new Date() > new Date(emergency.sla_deadline);

        await supabase.from('sla_logs').insert({
          emergency_id,
          event_type: slaBreached ? 'completed_sla_breached' : 'completed',
          details: { 
            responder_id, 
            sla_breached: slaBreached,
            completed_at: new Date().toISOString()
          }
        });

        return new Response(JSON.stringify({
          success: true,
          message: 'Emergency completed',
          sla_breached: slaBreached
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // ========================================
      // 5. CHECK SLA STATUS
      // ========================================
      case 'check_sla': {
        const { emergency_id } = params;

        const { data: emergency } = await supabase
          .from('emergencies')
          .select('*')
          .eq('id', emergency_id)
          .single();

        if (!emergency) {
          return new Response(JSON.stringify({ error: 'Emergency not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const now = new Date();
        const deadline = new Date(emergency.sla_deadline);
        const remainingMs = deadline.getTime() - now.getTime();
        const remainingMinutes = Math.ceil(remainingMs / 60000);

        return new Response(JSON.stringify({
          emergency_id,
          priority: emergency.priority,
          sla_deadline: emergency.sla_deadline,
          remaining_minutes: Math.max(0, remainingMinutes),
          is_breached: remainingMs < 0,
          status: emergency.status
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // ========================================
      // 6. UPDATE RESPONDER LOCATION
      // ========================================
      case 'update_location': {
        const { responder_id, lat, lng } = params;

        await supabase
          .from('responders')
          .update({ 
            current_lat: lat, 
            current_lng: lng, 
            last_location_update: new Date().toISOString() 
          })
          .eq('id', responder_id);

        // Update assignment distance if active
        const { data: assignment } = await supabase
          .from('emergency_assignments')
          .select('*, emergencies(*)')
          .eq('responder_id', responder_id)
          .is('completed_at', null)
          .single();

        if (assignment && assignment.emergencies) {
          const distance = calculateDistance(
            lat, lng,
            assignment.emergencies.patient_lat,
            assignment.emergencies.patient_lng
          );
          const eta = calculateETA(distance);

          await supabase
            .from('emergency_assignments')
            .update({ current_distance_km: distance, eta_minutes: eta })
            .eq('id', assignment.id);
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // ========================================
      // 7. GET PENDING EMERGENCIES FOR RESPONDER
      // ========================================
      case 'get_pending_alerts': {
        const { responder_id } = params;

        const { data: broadcasts } = await supabase
          .from('dispatch_broadcasts')
          .select('*, emergencies(*)')
          .eq('responder_id', responder_id)
          .eq('response_status', 'pending')
          .order('broadcast_at', { ascending: false });

        return new Response(JSON.stringify({
          success: true,
          alerts: broadcasts || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('[SmartDispatch] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// ========================================
// MULTI-RESPONDER BROADCAST FUNCTION
// ========================================
async function broadcastToResponders(
  supabase: any, 
  emergency: any, 
  priorityWeight: number,
  radiusKm: number = 5
): Promise<{ count: number }> {
  console.log(`[SmartDispatch] Broadcasting to responders within ${radiusKm}km`);

  // Get all available responders
  const { data: responders } = await supabase
    .from('responders')
    .select('*')
    .eq('status', 'available');

  if (!responders || responders.length === 0) {
    console.log('[SmartDispatch] No available responders found');
    return { count: 0 };
  }

  // Filter responders within radius and score them
  const scoredResponders = responders
    .map((r: any) => ({
      ...r,
      distance: calculateDistance(
        r.current_lat,
        r.current_lng,
        emergency.patient_lat,
        emergency.patient_lng
      ),
      score: scoreResponder(r, emergency.patient_lat, emergency.patient_lng)
    }))
    .filter((r: any) => r.distance <= radiusKm)
    .sort((a: any, b: any) => b.score - a.score);

  console.log(`[SmartDispatch] Found ${scoredResponders.length} responders within ${radiusKm}km`);

  // Broadcast to top 5 responders (or all if less than 5)
  const topResponders = scoredResponders.slice(0, 5);

  if (topResponders.length === 0) {
    console.log('[SmartDispatch] No responders within radius, expanding search...');
    // Recursive call with larger radius
    if (radiusKm < 20) {
      return broadcastToResponders(supabase, emergency, priorityWeight, radiusKm * 2);
    }
    return { count: 0 };
  }

  // Create broadcast records
  const broadcasts = topResponders.map((r: any) => ({
    emergency_id: emergency.id,
    responder_id: r.id,
    distance_km: r.distance,
    eta_minutes: calculateETA(r.distance),
    response_status: 'pending'
  }));

  const { error: broadcastError } = await supabase
    .from('dispatch_broadcasts')
    .insert(broadcasts);

  if (broadcastError) {
    console.error('[SmartDispatch] Error creating broadcasts:', broadcastError);
  }

  // Update emergency status to dispatching
  await supabase
    .from('emergencies')
    .update({ status: 'dispatching' })
    .eq('id', emergency.id);

  // Log SLA event
  await supabase.from('sla_logs').insert({
    emergency_id: emergency.id,
    event_type: 'dispatched',
    details: { 
      responder_count: topResponders.length, 
      responder_ids: topResponders.map((r: any) => r.id) 
    }
  });

  console.log(`[SmartDispatch] Broadcasted to ${topResponders.length} responders`);

  return { count: topResponders.length };
}
