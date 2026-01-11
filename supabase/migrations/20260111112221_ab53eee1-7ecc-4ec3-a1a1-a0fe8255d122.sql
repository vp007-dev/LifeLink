-- Add vehicle_type to responders table for vehicle prioritization
ALTER TABLE public.responders 
ADD COLUMN IF NOT EXISTS vehicle_type TEXT DEFAULT 'bike';

-- Add scheduling columns to responders table
ALTER TABLE public.responders 
ADD COLUMN IF NOT EXISTS shift_start TIME DEFAULT '08:00:00',
ADD COLUMN IF NOT EXISTS shift_end TIME DEFAULT '20:00:00',
ADD COLUMN IF NOT EXISTS is_on_duty BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS duty_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS max_range_km NUMERIC DEFAULT 10;

-- Create responder_schedules table for weekly scheduling
CREATE TABLE IF NOT EXISTS public.responder_schedules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    responder_id UUID NOT NULL REFERENCES public.responders(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    shift_start TIME NOT NULL,
    shift_end TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(responder_id, day_of_week)
);

-- Enable RLS on responder_schedules
ALTER TABLE public.responder_schedules ENABLE ROW LEVEL SECURITY;

-- RLS policies for responder_schedules
CREATE POLICY "Responders can view their schedules" 
ON public.responder_schedules 
FOR SELECT 
USING (true);

CREATE POLICY "Responders can manage their schedules" 
ON public.responder_schedules 
FOR ALL 
USING (true);

-- Create reassignment_logs table for tracking reassignments
CREATE TABLE IF NOT EXISTS public.reassignment_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    emergency_id UUID NOT NULL REFERENCES public.emergencies(id) ON DELETE CASCADE,
    from_responder_id UUID REFERENCES public.responders(id),
    to_responder_id UUID REFERENCES public.responders(id),
    reason TEXT NOT NULL,
    reassigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    details JSONB
);

-- Enable RLS on reassignment_logs
ALTER TABLE public.reassignment_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for reassignment_logs
CREATE POLICY "Reassignment logs viewable by authenticated" 
ON public.reassignment_logs 
FOR SELECT 
USING (true);

CREATE POLICY "System can create reassignment logs" 
ON public.reassignment_logs 
FOR INSERT 
WITH CHECK (true);

-- Add timeout tracking to dispatch_broadcasts
ALTER TABLE public.dispatch_broadcasts 
ADD COLUMN IF NOT EXISTS timeout_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_timed_out BOOLEAN DEFAULT false;

-- Add realtime support for reassignment_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.reassignment_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.responder_schedules;