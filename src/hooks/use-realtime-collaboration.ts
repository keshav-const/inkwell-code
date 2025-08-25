import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface CollaborationState {
  participants: Participant[];
  isConnected: boolean;
  roomId: string | null;
}

interface Participant {
  id: string;
  name: string;
  status: 'online' | 'away';
  cursor?: {
    line: number;
    column: number;
  };
  color?: string;
}

interface UseRealtimeCollaborationProps {
  roomId: string;
  userId?: string;
  userName?: string;
}

interface PresenceState {
  name: string;
  online_at: string;
  cursor?: {
    line: number;
    column: number;
  };
  color: string;
}

export const useRealtimeCollaboration = ({ 
  roomId, 
  userId = 'anonymous', 
  userName = 'Anonymous User' 
}: UseRealtimeCollaborationProps) => {
  const [state, setState] = useState<CollaborationState>({
    participants: [],
    isConnected: false,
    roomId: null
  });
  
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Join room function
  const joinRoom = useCallback(async (room: string) => {
    if (channel) {
      await channel.unsubscribe();
    }

    const newChannel = supabase.channel(`room_${room}`, {
      config: {
        presence: {
          key: userId
        }
      }
    });

    // Listen for presence changes (participants joining/leaving)
    newChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = newChannel.presenceState();
        const participants = Object.entries(presenceState).map(([key, presences]) => {
          // presences is an array, get the first one
          const presence = Array.isArray(presences) ? presences[0] : presences;
          // Safely extract presence data with fallbacks
          const presenceData = presence as any;
          
          return {
            id: key,
            name: presenceData?.name || 'Anonymous',
            status: 'online' as const,
            cursor: presenceData?.cursor || undefined,
            color: presenceData?.color || '#2CA6A4'
          };
        });
        
        setState(prev => ({...prev, participants, isConnected: true, roomId: room}));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .on('broadcast', { event: 'cursor-move' }, (payload) => {
        console.log('Cursor moved:', payload);
        // Handle cursor position updates
      })
      .on('broadcast', { event: 'code-change' }, (payload) => {
        console.log('Code changed:', payload);
        // Handle code changes from other users
      });

    // Subscribe to the channel
    const status = await newChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track this user's presence
        await newChannel.track({
          name: userName,
          online_at: new Date().toISOString(),
          cursor: null,
          color: generateUserColor(userId)
        });
      }
    });

    setChannel(newChannel);
  }, [userId, userName, channel]);

  // Leave room function
  const leaveRoom = useCallback(async () => {
    if (channel) {
      await channel.unsubscribe();
      setChannel(null);
      setState(prev => ({...prev, isConnected: false, roomId: null, participants: []}));
    }
  }, [channel]);

  // Update cursor position
  const updateCursor = useCallback(async (line: number, column: number) => {
    if (channel) {
      await channel.track({
        name: userName,
        online_at: new Date().toISOString(),
        cursor: { line, column },
        color: generateUserColor(userId)
      });
    }
  }, [channel, userName, userId]);

  // Broadcast code changes
  const broadcastCodeChange = useCallback(async (fileId: string, content: string, operation: any) => {
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'code-change',
        payload: {
          fileId,
          content,
          operation,
          userId,
          timestamp: Date.now()
        }
      });
    }
  }, [channel, userId]);

  // Auto-join room on mount
  useEffect(() => {
    if (roomId) {
      joinRoom(roomId);
    }

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [roomId, joinRoom]);

  return {
    ...state,
    joinRoom,
    leaveRoom,
    updateCursor,
    broadcastCodeChange,
    channel
  };
};

// Helper function to generate consistent colors for users
const generateUserColor = (userId: string): string => {
  const colors = [
    '#2CA6A4', // Teal
    '#C86E5A', // Terracotta
    '#6366f1', // Indigo
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#8b5cf6', // Violet
    '#f97316', // Orange
    '#06b6d4', // Cyan
  ];
  
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return colors[Math.abs(hash) % colors.length];
};