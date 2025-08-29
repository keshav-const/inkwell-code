-- Fix the RLS policy for room creation to be more permissive
-- The current policy is too restrictive and conflicts with triggers

DROP POLICY IF EXISTS "Authenticated users can create rooms" ON public.rooms;

-- Create a simpler policy that just checks if user is authenticated
-- The triggers will handle setting the correct admin_id
CREATE POLICY "Authenticated users can create rooms" 
ON public.rooms 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    admin_id = auth.uid() OR admin_id IS NULL
  )
);

-- Also update the trigger order to ensure admin_id is set before RLS check
-- Drop existing triggers and recreate them in the correct order
DROP TRIGGER IF EXISTS set_room_admin_trigger ON public.rooms;
DROP TRIGGER IF EXISTS assign_room_admin_trigger ON public.rooms;

-- Recreate the set_room_admin trigger as BEFORE INSERT with higher priority
CREATE TRIGGER set_room_admin_trigger
  BEFORE INSERT ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.set_room_admin();

-- Recreate the assign_room_admin trigger as AFTER INSERT
CREATE TRIGGER assign_room_admin_trigger
  AFTER INSERT ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_room_admin();