import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Government Ambulance Service Configuration
const GOV_AMBULANCE_CONFIG = {
  // Simulated government ambulance fleet zones
  zones: {
    'zone_north': { baseStation: 'North District Hospital', capacity: 5, available: 3 },
    'zone_south': { baseStation: 'South Medical Center', capacity: 4, available: 2 },
    'zone_east': { baseStation: 'East Emergency Hub', capacity: 6, available: 4 },
    'zone_west': { baseStation: 'West Trauma Center', capacity: 5, available: 3 },
    'zone_central': { baseStation: 'Central City Hospital', capacity: 8, available: 5 },
  },
  // Ambulance types and their capabilities
  ambulanceTypes: {
    'ALS': { name: 'Advanced Life Support', priority: ['critical', 'high'], equipment: ['defibrillator', 'ventilator', 'cardiac_monitor'] },
    'BLS': { name: 'Basic Life Support', priority: ['medium', 'low'], equipment: ['first_aid', 'oxygen', 'stretcher'] },
    'MICU': { name: 'Mobile ICU', priority: ['critical'], equipment: ['full_icu_suite', 'surgeon_on_board'] },
    'NEONATAL': { name: 'Neonatal Transport', priority: ['critical', 'high'], equipment: ['incubator', 'pediatric_ventilator'] },
  },
  // Response time targets (in minutes)
  responseTargets: {
    'critical': 4,
    'high': 8,
    'medium': 15,
    'low': 30,
  }
};

// Determine zone based on coordinates
function determineZone(lat: number, lng: number): string {
  // Simple zone determination based on coordinates
  // In production, this would use actual geographic boundaries
  if (lat > 28.65) return 'zone_north';
  if (lat < 28.55) return 'zone_south';
  if (lng > 77.25) return 'zone_east';
  if (lng < 77.15) return 'zone_west';
  return 'zone_central';
}

// Select appropriate ambulance type based on emergency
function selectAmbulanceType(emergencyType: string, priority: string): string {
  const criticalTypes = ['cardiac_arrest', 'stroke', 'severe_trauma', 'respiratory_failure'];
  const neonatalTypes = ['pediatric_emergency', 'neonatal_emergency'];
  
  if (neonatalTypes.includes(emergencyType)) return 'NEONATAL';
  if (priority === 'critical' || criticalTypes.includes(emergencyType)) return 'MICU';
  if (priority === 'high') return 'ALS';
  return 'BLS';
}

// Calculate ETA based on distance and traffic
function calculateGovAmbulanceETA(distanceKm: number, priority: string): number {
  const baseSpeed = 40; // km/h average in city
  const priorityMultiplier = {
    'critical': 1.5, // Faster due to sirens, traffic clearing
    'high': 1.3,
    'medium': 1.0,
    'low': 0.9,
  };
  
  const effectiveSpeed = baseSpeed * (priorityMultiplier[priority as keyof typeof priorityMultiplier] || 1.0);
  const etaMinutes = Math.ceil((distanceKm / effectiveSpeed) * 60);
  
  // Add 2 minutes for dispatch processing
  return etaMinutes + 2;
}

// Generate unique dispatch ID
function generateDispatchId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `GOV-AMB-${timestamp}-${random}`.toUpperCase();
}

interface DispatchRequest {
  emergency_id: string;
  patient_lat: number;
  patient_lng: number;
  emergency_type: string;
  priority: string;
  patient_name?: string;
  patient_phone?: string;
  description?: string;
  requester_type?: 'citizen' | 'hospital' | 'police' | 'fire_dept';
}

interface DispatchResponse {
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
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const action = pathParts[pathParts.length - 1] || 'dispatch';

    console.log(`[Ambulance Gateway] Action: ${action}, Method: ${req.method}`);

    switch (action) {
      case 'dispatch': {
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ success: false, error: 'Method not allowed', error_code: 'METHOD_NOT_ALLOWED' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const body: DispatchRequest = await req.json();
        console.log(`[Ambulance Gateway] Dispatch request:`, JSON.stringify(body));

        // Validate required fields
        if (!body.emergency_id || !body.patient_lat || !body.patient_lng || !body.emergency_type || !body.priority) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Missing required fields', 
              error_code: 'VALIDATION_ERROR',
              required: ['emergency_id', 'patient_lat', 'patient_lng', 'emergency_type', 'priority']
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Determine zone and check availability
        const zone = determineZone(body.patient_lat, body.patient_lng);
        const zoneConfig = GOV_AMBULANCE_CONFIG.zones[zone as keyof typeof GOV_AMBULANCE_CONFIG.zones];

        if (!zoneConfig || zoneConfig.available <= 0) {
          // Try neighboring zones
          const allZones = Object.entries(GOV_AMBULANCE_CONFIG.zones);
          const availableZone = allZones.find(([_, config]) => config.available > 0);
          
          if (!availableZone) {
            console.log(`[Ambulance Gateway] No ambulances available in any zone`);
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'No ambulances available. All units deployed.', 
                error_code: 'NO_AVAILABILITY',
                retry_after_seconds: 120
              }),
              { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        // Select ambulance type
        const ambulanceType = selectAmbulanceType(body.emergency_type, body.priority);
        const ambulanceConfig = GOV_AMBULANCE_CONFIG.ambulanceTypes[ambulanceType as keyof typeof GOV_AMBULANCE_CONFIG.ambulanceTypes];

        // Calculate distance (simulated from base station)
        const baseDistance = 2 + Math.random() * 8; // 2-10 km range
        const etaMinutes = calculateGovAmbulanceETA(baseDistance, body.priority);

        // Generate dispatch ID
        const dispatchId = generateDispatchId();

        // Log dispatch to database
        const { error: logError } = await supabase.from('sla_logs').insert({
          emergency_id: body.emergency_id,
          event_type: 'gov_ambulance_dispatched',
          details: {
            dispatch_id: dispatchId,
            zone: zone,
            base_station: zoneConfig.baseStation,
            ambulance_type: ambulanceType,
            ambulance_name: ambulanceConfig.name,
            equipment: ambulanceConfig.equipment,
            eta_minutes: etaMinutes,
            distance_km: baseDistance.toFixed(2),
            requester_type: body.requester_type || 'citizen',
            patient_location: { lat: body.patient_lat, lng: body.patient_lng },
          }
        });

        if (logError) {
          console.error(`[Ambulance Gateway] Failed to log dispatch:`, logError);
        }

        // Update emergency with government dispatch info
        await supabase.from('emergencies').update({
          updated_at: new Date().toISOString(),
          description: `${body.description || ''}\n[GOV AMBULANCE: ${dispatchId}]`.trim()
        }).eq('id', body.emergency_id);

        const response: DispatchResponse = {
          success: true,
          dispatch_id: dispatchId,
          ambulance_type: `${ambulanceType} - ${ambulanceConfig.name}`,
          zone: zone,
          base_station: zoneConfig.baseStation,
          eta_minutes: etaMinutes,
          tracking_url: `https://gov-ambulance.example.com/track/${dispatchId}`,
          contact_number: '+91-108', // National ambulance number
        };

        console.log(`[Ambulance Gateway] Dispatch successful:`, JSON.stringify(response));

        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'status': {
        // Get dispatch status
        const dispatchId = url.searchParams.get('dispatch_id');
        
        if (!dispatchId) {
          return new Response(
            JSON.stringify({ success: false, error: 'dispatch_id required', error_code: 'VALIDATION_ERROR' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Query logs for dispatch info
        const { data: logs, error } = await supabase
          .from('sla_logs')
          .select('*')
          .eq('event_type', 'gov_ambulance_dispatched')
          .filter('details->dispatch_id', 'eq', dispatchId)
          .single();

        if (error || !logs) {
          return new Response(
            JSON.stringify({ success: false, error: 'Dispatch not found', error_code: 'NOT_FOUND' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const details = logs.details as Record<string, unknown>;
        const dispatchTime = new Date(logs.event_at as string).getTime();
        const elapsedMinutes = Math.floor((Date.now() - dispatchTime) / 60000);
        const originalEta = details.eta_minutes as number;
        const remainingEta = Math.max(0, originalEta - elapsedMinutes);

        // Simulate status progression
        let status = 'dispatched';
        if (remainingEta <= 0) status = 'arrived';
        else if (elapsedMinutes > 1) status = 'en_route';

        return new Response(JSON.stringify({
          success: true,
          dispatch_id: dispatchId,
          status: status,
          ambulance_type: details.ambulance_type,
          base_station: details.base_station,
          eta_remaining_minutes: remainingEta,
          elapsed_minutes: elapsedMinutes,
          equipment_onboard: details.equipment,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'cancel': {
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ success: false, error: 'Method not allowed' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { dispatch_id, reason } = await req.json();

        if (!dispatch_id) {
          return new Response(
            JSON.stringify({ success: false, error: 'dispatch_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Log cancellation
        await supabase.from('sla_logs').insert({
          emergency_id: dispatch_id, // Using dispatch_id as reference
          event_type: 'gov_ambulance_cancelled',
          details: {
            dispatch_id: dispatch_id,
            reason: reason || 'User cancelled',
            cancelled_at: new Date().toISOString(),
          }
        });

        console.log(`[Ambulance Gateway] Dispatch ${dispatch_id} cancelled: ${reason}`);

        return new Response(JSON.stringify({
          success: true,
          message: 'Ambulance dispatch cancelled',
          dispatch_id: dispatch_id,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'availability': {
        // Return current fleet availability
        const zones = Object.entries(GOV_AMBULANCE_CONFIG.zones).map(([id, config]) => ({
          zone_id: id,
          base_station: config.baseStation,
          total_units: config.capacity,
          available_units: config.available,
          utilization_percent: Math.round(((config.capacity - config.available) / config.capacity) * 100),
        }));

        const totalCapacity = zones.reduce((sum, z) => sum + z.total_units, 0);
        const totalAvailable = zones.reduce((sum, z) => sum + z.available_units, 0);

        return new Response(JSON.stringify({
          success: true,
          timestamp: new Date().toISOString(),
          overall: {
            total_units: totalCapacity,
            available_units: totalAvailable,
            utilization_percent: Math.round(((totalCapacity - totalAvailable) / totalCapacity) * 100),
          },
          zones: zones,
          ambulance_types: Object.entries(GOV_AMBULANCE_CONFIG.ambulanceTypes).map(([id, config]) => ({
            type_id: id,
            name: config.name,
            handles_priority: config.priority,
            equipment: config.equipment,
          })),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Unknown action', 
            error_code: 'UNKNOWN_ACTION',
            available_actions: ['dispatch', 'status', 'cancel', 'availability']
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Ambulance Gateway] Error:', errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        error_code: 'INTERNAL_ERROR'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});