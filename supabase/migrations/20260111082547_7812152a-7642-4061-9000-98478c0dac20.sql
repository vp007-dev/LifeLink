-- Function to increment responder rescues
CREATE OR REPLACE FUNCTION public.increment_responder_rescues(p_responder_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.responders 
    SET total_rescues = total_rescues + 1
    WHERE id = p_responder_id;
END;
$$;