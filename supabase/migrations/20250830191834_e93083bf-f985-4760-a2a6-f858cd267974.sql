-- COMPLETE REBUILD OF ROOM CREATION SYSTEM
-- Drop all existing policies, triggers, and functions related to rooms

-- 1. Drop all existing RLS policies for rooms
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Room admins can delete rooms" ON public.rooms;
DROP POLICY IF EXISTS "Room admins can update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Room members can view rooms" ON public.rooms;

-- 2. Drop all existing triggers
DROP TRIGGER IF EXISTS set_room_admin_trigger ON public.rooms;
DROP TRIGGER IF EXISTS assign_room_admin_trigger ON public.rooms;

-- 3. Drop helper functions if they exist
DROP FUNCTION IF EXISTS public.set_room_admin() CASCADE;
DROP FUNCTION IF EXISTS public.assign_room_admin() CASCADE;

-- 4. Recreate the room creation system from scratch
-- Simple RLS policies that work reliably

-- Allow authenticated users to create rooms (they must set themselves as admin)
CREATE POLICY "Users can create rooms as admin" 
ON public.rooms 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND admin_id = auth.uid()
);

-- Allow room admins to view and manage their rooms
CREATE POLICY "Room admins can manage their rooms" 
ON public.rooms 
FOR ALL 
TO authenticated 
USING (admin_id = auth.uid());

-- Allow room members to view rooms they're part of
CREATE POLICY "Room members can view rooms" 
ON public.rooms 
FOR SELECT 
TO authenticated 
USING (
  admin_id = auth.uid() 
  OR is_room_member(id, auth.uid())
);

-- 5. Create a simple trigger to auto-add admin to room_members after room creation
CREATE OR REPLACE FUNCTION public.add_room_admin_to_members()
RETURNS TRIGGER AS $$
BEGIN
  -- Add the room creator as an admin member
  INSERT INTO public.room_members (room_id, user_id, role)
  VALUES (NEW.id, NEW.admin_id, 'admin');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER add_admin_member_trigger
  AFTER INSERT ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.add_room_admin_to_members();