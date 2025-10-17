-- Fix room creation issues by updating triggers and RLS policies

-- First, let's fix the set_room_admin trigger function to properly set admin_id
CREATE OR REPLACE FUNCTION public.set_room_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Auto-assign current authenticated user as admin if not set
  IF NEW.admin_id IS NULL THEN
    NEW.admin_id := auth.uid();
  END IF;
  
  -- Ensure we have a valid user ID
  IF NEW.admin_id IS NULL THEN
    RAISE EXCEPTION 'Cannot create room: no authenticated user found';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger for rooms table to auto-set admin_id
DROP TRIGGER IF EXISTS set_room_admin_trigger ON public.rooms;
CREATE TRIGGER set_room_admin_trigger
  BEFORE INSERT ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.set_room_admin();

-- Update the assign_room_admin function to handle the room_members insertion
CREATE OR REPLACE FUNCTION public.assign_room_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert the creator as an admin into room_members
  -- Use NEW.admin_id which should be set by the set_room_admin trigger
  INSERT INTO public.room_members (room_id, user_id, role)
  VALUES (NEW.id, NEW.admin_id, 'admin');
  
  RETURN NEW;
END;
$function$;

-- Create the trigger for room_members insertion after room creation
DROP TRIGGER IF EXISTS assign_room_admin_trigger ON public.rooms;
CREATE TRIGGER assign_room_admin_trigger
  AFTER INSERT ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_room_admin();

-- Update RLS policies to be more explicit about room creation
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON public.rooms;
CREATE POLICY "Authenticated users can create rooms"
ON public.rooms
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (admin_id = auth.uid() OR admin_id IS NULL)
);

-- Ensure the room_members table has proper RLS for the auto-insertion
DROP POLICY IF EXISTS "System can insert admin members" ON public.room_members;
CREATE POLICY "System can insert admin members"
ON public.room_members
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow insertion when user is creating a room (admin role)
  (role = 'admin' AND user_id = auth.uid()) OR
  -- Allow regular member insertion when user joins
  (role = 'member' AND user_id = auth.uid()) OR
  -- Allow room admins to add members
  is_room_admin(room_id, auth.uid())
);

-- Update the existing "Users can join rooms" policy to be more specific
DROP POLICY IF EXISTS "Users can join rooms" ON public.room_members;
CREATE POLICY "Users can join rooms"
ON public.room_members
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND role = 'member'
);