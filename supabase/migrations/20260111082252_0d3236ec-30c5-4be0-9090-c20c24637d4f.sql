-- Priority enum for emergency types
CREATE TYPE public.emergency_priority AS ENUM ('critical', 'high', 'medium', 'low');

-- Emergency status enum
CREATE TYPE public.emergency_status AS ENUM ('pending', 'dispatching', 'accepted', 'in_progress', 'completed', 'cancelled', 'expired');

-- Responder status enum
CREATE TYPE public.responder_status AS ENUM ('available', 'busy', 'offline');

-- Responders table
CREATE TABLE public.responders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    responder_type TEXT DEFAULT 'volunteer',
    current_lat DECIMAL(10, 8),
    current_lng DECIMAL(11, 8),
    status responder_status DEFAULT 'offline',
    rating DECIMAL(3, 2) DEFAULT 5.0,
    total_rescues INTEGER DEFAULT 0,
    last_location_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Emergencies table (main dispatch queue)
CREATE TABLE public.emergencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_name TEXT,
    patient_phone TEXT,
    patient_lat DECIMAL(10, 8) NOT NULL,
    patient_lng DECIMAL(11, 8) NOT NULL,
    emergency_type TEXT NOT NULL,
    priority emergency_priority NOT NULL DEFAULT 'medium',
    description TEXT,
    status emergency_status DEFAULT 'pending',
    sla_deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Dispatch broadcasts (multi-responder broadcast)
CREATE TABLE public.dispatch_broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emergency_id UUID REFERENCES public.emergencies(id) ON DELETE CASCADE NOT NULL,
    responder_id UUID REFERENCES public.responders(id) ON DELETE CASCADE NOT NULL,
    distance_km DECIMAL(10, 3),
    eta_minutes INTEGER,
    broadcast_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    response_status TEXT DEFAULT 'pending', -- pending, accepted, rejected, expired
    responded_at TIMESTAMP WITH TIME ZONE,
    locked_at TIMESTAMP WITH TIME ZONE, -- for lock-on accept
    UNIQUE(emergency_id, responder_id)
);

-- Emergency assignments (after lock-on accept)
CREATE TABLE public.emergency_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emergency_id UUID REFERENCES public.emergencies(id) ON DELETE CASCADE NOT NULL UNIQUE,
    responder_id UUID REFERENCES public.responders(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    eta_minutes INTEGER,
    current_distance_km DECIMAL(10, 3),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- SLA tracking table
CREATE TABLE public.sla_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emergency_id UUID REFERENCES public.emergencies(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL, -- created, dispatched, accepted, completed, sla_breached
    event_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    details JSONB
);

-- Enable RLS
ALTER TABLE public.responders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for responders
CREATE POLICY "Responders can view their own profile"
ON public.responders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Responders can update their own profile"
ON public.responders FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view available responders"
ON public.responders FOR SELECT
USING (status = 'available');

-- RLS Policies for emergencies (anyone can create, responders can view)
CREATE POLICY "Anyone can create emergencies"
ON public.emergencies FOR INSERT
WITH CHECK (true);

CREATE POLICY "Emergencies are viewable by all authenticated"
ON public.emergencies FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Emergencies can be updated"
ON public.emergencies FOR UPDATE
TO authenticated
USING (true);

-- RLS Policies for dispatch broadcasts
CREATE POLICY "Responders can view their broadcasts"
ON public.dispatch_broadcasts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can create broadcasts"
ON public.dispatch_broadcasts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Responders can update their broadcast response"
ON public.dispatch_broadcasts FOR UPDATE
TO authenticated
USING (true);

-- RLS Policies for assignments
CREATE POLICY "Assignments viewable by authenticated"
ON public.emergency_assignments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can create assignments"
ON public.emergency_assignments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Assignments can be updated"
ON public.emergency_assignments FOR UPDATE
TO authenticated
USING (true);

-- RLS Policies for SLA logs
CREATE POLICY "SLA logs viewable by authenticated"
ON public.sla_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can create SLA logs"
ON public.sla_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable realtime for emergencies and broadcasts
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergencies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dispatch_broadcasts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_assignments;

-- Function to get SLA deadline based on priority
CREATE OR REPLACE FUNCTION public.get_sla_deadline(p_priority emergency_priority)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN CASE p_priority
        WHEN 'critical' THEN now() + INTERVAL '3 minutes'
        WHEN 'high' THEN now() + INTERVAL '5 minutes'
        WHEN 'medium' THEN now() + INTERVAL '10 minutes'
        WHEN 'low' THEN now() + INTERVAL '15 minutes'
    END;
END;
$$;

-- Trigger to auto-set SLA deadline on emergency creation
CREATE OR REPLACE FUNCTION public.set_emergency_sla()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.sla_deadline := public.get_sla_deadline(NEW.priority);
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_emergency_sla
BEFORE INSERT ON public.emergencies
FOR EACH ROW
EXECUTE FUNCTION public.set_emergency_sla();