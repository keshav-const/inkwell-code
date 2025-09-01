import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/main-layout';
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
  const { user, loading: authLoading } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [files, setFiles] = useState<FileModel[]>([]);
  const [fileManager, setFileManager] = useState<FileManager | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const collaboration = useRealtimeCollaboration({
    roomId: roomId || '',
    userId: user?.id,
    userName: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Anonymous'
  });

  // Debug user info for presence
  useEffect(() => {
    if (user) {
      console.log('User info for collaboration:', {
        id: user.id,
        fullName: user.user_metadata?.full_name,
        name: user.user_metadata?.name,
        email: user.email,
        finalName: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Anonymous'
      });
    }
  }, [user]);

  // Load room data
  useEffect(() => {
    if (!roomId || !user) return;

    const loadRoomData = async () => {
      try {
        // Fetch room details
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (roomError) {
          if (roomError.code === 'PGRST116') {
            setError('Room not found or you do not have access to this room.');
          } else {
            throw roomError;
          }
          return;
        }

        setRoom(roomData);

        // Fetch room members (simpler query without problematic join)
        const { data: membersData, error: membersError } = await supabase
          .from('room_members')
          .select('*')
          .eq('room_id', roomId);

        if (membersError) throw membersError;
        
        // Fetch profiles separately to avoid join issues
        const memberIds = (membersData || []).map(m => m.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', memberIds);
        
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
        const { data: filesData, error: filesError } = await supabase
          .from('files')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });

        if (filesError) throw filesError;

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

      } catch (error: any) {
        console.error('Failed to load room data:', error);
        setError(error.message || 'Failed to load room data');
      } finally {
        setLoading(false);
      }
    };

    loadRoomData();
  }, [roomId, user]);

  // Set up real-time subscriptions for file changes
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room_files_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'files',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          console.log('File change detected:', payload);
          
          // Reload files when changes occur
          const { data: filesData } = await supabase
            .from('files')
            .select('*')
            .eq('room_id', roomId)
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
  }, [roomId, fileManager]);

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
    return <Navigate to="/" replace />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">{error}</p>
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