-- Add avatar_url and provider columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS provider text DEFAULT 'email';

-- Update handle_new_user function to store avatar and provider
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url, provider)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'user_name',
      'User'
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
  )
  ON CONFLICT (id) DO UPDATE SET
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    provider = COALESCE(EXCLUDED.provider, public.profiles.provider),
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name);
  RETURN NEW;
END;
$function$;

-- Create room_history table
CREATE TABLE IF NOT EXISTS public.room_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_code text NOT NULL,
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  joined_at timestamp with time zone DEFAULT now() NOT NULL,
  last_visited timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on room_history
ALTER TABLE public.room_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own room history
CREATE POLICY "Users can view own room history"
ON public.room_history
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own room history
CREATE POLICY "Users can insert own room history"
ON public.room_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own room history
CREATE POLICY "Users can update own room history"
ON public.room_history
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_room_history_user_id ON public.room_history(user_id);
CREATE INDEX IF NOT EXISTS idx_room_history_joined_at ON public.room_history(joined_at DESC);