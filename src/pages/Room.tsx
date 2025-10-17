import { useEffect, useState, useRef } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/main-layout';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeCollaboration } from '@/hooks/use-realtime-collaboration';
import { FileManager } from '@/utils/file-manager';
import type { FileModel } from '@/types/collaboration';
import { toast } from '@/hooks/use-toast';

interface Room {
  id: string;
  name: string;
  code: string;
  admin_id: string;
  created_at: string;
}

interface RoomMember {
  id: string;
  user_id: string;
  role: 'admin' | 'member';
  profiles: {
    display_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [files, setFiles] = useState<FileModel[]>([]);
  const [fileManager, setFileManager] = useState<FileManager | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const collaboration = useRealtimeCollaboration({
    roomId: roomId || '',
    userId: user?.id,
    userName: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Anonymous'
  });

  // Set loading timeout to prevent infinite loading
  useEffect(() => {
    console.log('🏠 Room component mounting, roomId:', roomId);
    
    loadingTimeoutRef.current = setTimeout(() => {
      console.log('⚠️ Room loading timeout reached, forcing loading to false');
      setLoading(false);
      setError('Room loading timed out. Please try refreshing the page.');
    }, 15000); // 15 second timeout

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [roomId]);

  // Debug user info for presence
  useEffect(() => {
    if (user) {
      const userName = user?.user_metadata?.full_name || 
                     user?.user_metadata?.name || 
                     user?.user_metadata?.display_name ||
                     user?.email?.split('@')[0] || 
                     'Anonymous';
      
      console.log('User info for collaboration:', {
        id: user.id,
        fullName: user.user_metadata?.full_name,
        name: user.user_metadata?.name,
        displayName: user.user_metadata?.display_name,
        email: user.email,
        finalName: userName,
        allMetadata: user.user_metadata
      });
    }
  }, [user]);

  // Load room data
  useEffect(() => {
    console.log('🔄 Room data loading effect triggered:', { roomId, userId: user?.id, hasUser: !!user });
    
    if (!roomId || !user) {
      console.log('❌ Missing roomId or user, skipping room data load');
      return;
    }

    const loadRoomData = async () => {
      try {
        console.log('🏠 Starting room data load for:', roomId);
        
        // Fetch room details - try by code first (user-friendly), then by ID
        let roomData: Room | null = null;
        let roomError: any = null;

        // First, try to fetch by room code
        const { data: roomByCode, error: codeError } = await supabase
          .from('rooms')
          .select('*')
          .eq('code', roomId)
          .maybeSingle();

        if (roomByCode) {
          roomData = roomByCode;
        } else {
          // If not found by code, try by ID (for backward compatibility)
          const { data: roomById, error: idError } = await supabase
            .from('rooms')
            .select('*')
            .eq('id', roomId)
            .maybeSingle();

          if (roomById) {
            roomData = roomById;
          } else {
            roomError = idError || codeError;
          }
        }

        if (!roomData) {
          console.error('❌ Room not found:', roomError);
          setError('Room no longer exists or has been deleted.');
          setLoading(false);
          return;
        }

        console.log('✅ Room data fetched:', roomData);
        setRoom(roomData);

        // Check if user is a member, if not, auto-join them
        const { data: existingMember } = await supabase
          .from('room_members')
          .select('id')
          .eq('room_id', roomData.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!existingMember) {
          console.log('👤 User not a member, auto-joining room...');
          const { error: memberError } = await supabase
            .from('room_members')
            .insert({
              room_id: roomData.id,
              user_id: user.id,
              role: 'member'
            });

          if (memberError) {
            console.error('❌ Failed to join room:', memberError);
            throw new Error('Failed to join room. Please try again.');
          }
          
          toast({
            title: 'Joined room!',
            description: `Welcome to "${roomData.name}".`,
          });
        }

        // Fetch room members (simpler query without problematic join)
        const { data: membersData, error: membersError } = await supabase
          .from('room_members')
          .select('*')
          .eq('room_id', roomData.id);

        if (membersError) {
          console.error('❌ Members fetch error:', membersError);
          throw membersError;
        }
        
        console.log('👥 Members data fetched:', membersData?.length || 0, 'members');
        
        // Fetch profiles separately to avoid join issues
        const memberIds = (membersData || []).map(m => m.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', memberIds);
        
        console.log('📋 Profiles data fetched:', profilesData?.length || 0, 'profiles');
        
        // Combine the data
        const typedMembers: RoomMember[] = (membersData || []).map(member => {
          const profile = (profilesData || []).find(p => p.id === member.user_id);
          return {
            ...member,
            role: member.role as 'admin' | 'member',
            profiles: profile ? {
              display_name: profile.display_name,
              email: profile.email,
              avatar_url: profile.avatar_url
            } : {
              display_name: null,
              email: '',
              avatar_url: null
            }
          };
        });
        
        setMembers(typedMembers);

        // Fetch room files
        console.log('📁 Fetching room files...');
        const { data: filesData, error: filesError } = await supabase
          .from('files')
          .select('*')
          .eq('room_id', roomData.id)
          .order('created_at', { ascending: true });

        if (filesError) {
          console.error('❌ Files fetch error:', filesError);
          throw filesError;
        }

        console.log('📄 Files data fetched:', filesData?.length || 0, 'files');

        // Convert files to FileModel format
        const fileModels: FileModel[] = (filesData || []).map(file => ({
          id: file.id,
          name: file.name,
          language: file.language || 'plaintext',
          content: file.content || '',
          lastModified: new Date(file.updated_at).getTime(),
          modifiedBy: file.id // We'll need to track this better
        }));

        setFiles(fileModels);

        // Initialize file manager
        const manager = new FileManager(fileModels);
        setFileManager(manager);
        
        console.log('✅ Room data loading completed successfully');

      } catch (error: any) {
        console.error('❌ Failed to load room data:', error);
        setError(error.message || 'Failed to load room data');
      } finally {
        console.log('🏁 Room data loading finished, setting loading to false');
        setLoading(false);
        
        // Clear the loading timeout since we finished loading
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
      }
    };

    loadRoomData();
  }, [roomId, user]);

  // Track room visit in history
  useEffect(() => {
    if (!user || !room) return;

    const trackRoomVisit = async () => {
      try {
        // Check if entry exists
        const { data: existing } = await supabase
          .from('room_history')
          .select('id')
          .eq('user_id', user.id)
          .eq('room_id', room.id)
          .maybeSingle();

        if (existing) {
          // Update last_visited
          await supabase
            .from('room_history')
            .update({ last_visited: new Date().toISOString() })
            .eq('id', existing.id);
        } else {
          // Insert new entry
          await supabase
            .from('room_history')
            .insert({
              user_id: user.id,
              room_id: room.id,
              room_code: room.code,
              joined_at: new Date().toISOString(),
              last_visited: new Date().toISOString()
            });
        }
      } catch (error) {
        console.error('Failed to track room visit:', error);
      }
    };

    trackRoomVisit();
  }, [user, room]);

  // Set up real-time subscriptions for file changes
  useEffect(() => {
    if (!room) return;

    const channel = supabase
      .channel(`room_files_${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'files',
          filter: `room_id=eq.${room.id}`
        },
        async (payload) => {
          console.log('File change detected:', payload);
          
          // Reload files when changes occur
          const { data: filesData } = await supabase
            .from('files')
            .select('*')
            .eq('room_id', room.id)
            .order('created_at', { ascending: true });

          if (filesData) {
            const fileModels: FileModel[] = filesData.map(file => ({
              id: file.id,
              name: file.name,
              language: file.language || 'plaintext',
              content: file.content || '',
              lastModified: new Date(file.updated_at).getTime(),
              modifiedBy: file.id
            }));

            setFiles(fileModels);
            
            if (fileManager) {
              fileManager.importFiles(JSON.stringify({
                files: fileModels,
                activeFileId: fileManager.getActiveFile()?.id || fileModels[0]?.id,
                exportedAt: new Date().toISOString()
              }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room, fileManager]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Store the room ID in session storage for redirect after login
    sessionStorage.setItem('pendingRoomId', roomId || '');
    return <Navigate to="/" replace />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-accent/5 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md px-6"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-4xl">🔒</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Unable to Access Room</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <PrimaryButton
            onClick={() => navigate('/')}
            className="w-full"
          >
            Back to Home
          </PrimaryButton>
        </motion.div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Room Not Found</h1>
          <p className="text-muted-foreground">The room you're looking for doesn't exist or you don't have access to it.</p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen bg-background"
    >
      <MainLayout 
        room={room}
        members={members}
        files={files}
        fileManager={fileManager}
        collaboration={collaboration}
        onRoomUpdated={(updatedRoom) => setRoom(updatedRoom)}
      />
    </motion.div>
  );
};