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
  userId, 
  userName 
}: UseRealtimeCollaborationProps) => {
  const [state, setState] = useState<CollaborationState>({
    participants: [],
    isConnected: false,
    roomId: null
  });
  
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Join room function
  const joinRoom = useCallback(async (room: string) => {
    console.log('Attempting to join room:', room, { userId, userName });
    
    if (channel) {
      console.log('Unsubscribing from existing channel');
      await channel.unsubscribe();
    }

    if (!userId || !userName) {
      console.warn('Cannot join room without userId and userName', { userId, userName });
      return;
    }

    const channelName = `room_${room}`;
    console.log('Creating new channel:', channelName);
    
    const newChannel = supabase.channel(channelName, {
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
        console.log('Presence sync received:', presenceState);
        
        const participants = Object.entries(presenceState).map(([key, presences]) => {
          // presences is an array, get the first one
          const presence = Array.isArray(presences) ? presences[0] : presences;
          // Safely extract presence data with fallbacks
          const presenceData = presence as any;
          
          const participant = {
            id: key,
            name: presenceData?.name || 'Anonymous',
            status: 'online' as const,
            cursor: presenceData?.cursor || undefined,
            color: presenceData?.color || '#2CA6A4'
          };
          
          console.log('[CURSOR RECV] Processing participant:', participant);
          if (participant.cursor) {
            console.log('[CURSOR RECV] Participant has cursor at:', participant.cursor);
          }
          return participant;
        });
        
        console.log('All participants processed:', participants);
        setState(prev => ({
          ...prev, 
          participants, 
          isConnected: true, 
          roomId: room
        }));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .on('broadcast', { event: 'cursor-move' }, (payload) => {
        console.log('Cursor moved:', payload);
        // Handle cursor position updates - this will be handled via presence tracking
      })
      .on('broadcast', { event: 'code-change' }, (payload) => {
        console.log('Code changed:', payload);
        // Handle code changes from other users
      });

    // Subscribe to the channel
    console.log('Subscribing to channel...');
    const subscriptionResult = await newChannel.subscribe(async (status) => {
      console.log('Channel subscription status changed:', status);
      
      if (status === 'SUBSCRIBED') {
        const presenceData = {
          name: userName,
          online_at: new Date().toISOString(),
          cursor: null,
          color: generateUserColor(userId || '')
        };
        
        console.log('Tracking user presence with data:', presenceData);
        
        const trackResult = await newChannel.track(presenceData);
        console.log('Track result:', trackResult);
      }
    });
    
    console.log('Subscription result:', subscriptionResult);
    setChannel(newChannel);
  }, [userId, userName]);

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
    if (channel && userId && userName) {
      console.log('[CURSOR EMIT] Updating cursor position:', { line, column, userId, userName });
      
      const result = await channel.track({
        name: userName,
        online_at: new Date().toISOString(),
        cursor: { line, column },
        color: generateUserColor(userId)
      });
      
      console.log('[CURSOR EMIT] Track result:', result);
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
    if (roomId && userId && userName) {
      joinRoom(roomId);
    }

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [roomId, userId, userName, joinRoom]);

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