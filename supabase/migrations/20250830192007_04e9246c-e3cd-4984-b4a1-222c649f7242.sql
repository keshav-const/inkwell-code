-- Fix the security warning for the function search path
DROP FUNCTION IF EXISTS public.add_room_admin_to_members() CASCADE;

-- Recreate the function with proper search_path for security
CREATE OR REPLACE FUNCTION public.add_room_admin_to_members()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
BEGIN
  -- Add the room creator as an admin member
  INSERT INTO public.room_members (room_id, user_id, role)
  VALUES (NEW.id, NEW.admin_id, 'admin');
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS add_admin_member_trigger ON public.rooms;
CREATE TRIGGER add_admin_member_trigger
  AFTER INSERT ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.add_room_admin_to_members();