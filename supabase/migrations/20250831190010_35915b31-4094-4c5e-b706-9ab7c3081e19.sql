-- Fix room access for joining by code - users need to find rooms by code even if not members yet
DROP POLICY IF EXISTS "Room members can view rooms" ON public.rooms;
DROP POLICY IF EXISTS "Users can view rooms by code" ON public.rooms;

-- Allow users to view rooms they admin or are members of, OR find rooms by code for joining
CREATE POLICY "Room members can view rooms" 
ON public.rooms 
FOR SELECT 
TO authenticated
USING ((admin_id = auth.uid()) OR is_room_member(id, auth.uid()));

-- Allow any authenticated user to find rooms by code (for joining purposes)
CREATE POLICY "Users can view rooms by code" 
ON public.rooms 
FOR SELECT 
TO authenticated
USING (code IS NOT NULL);

-- Enable realtime for real-time collaboration
ALTER TABLE public.files REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.room_members REPLICA IDENTITY FULL;

-- Add files and messages to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.files;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;