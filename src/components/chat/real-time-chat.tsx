import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon } from '../icons/hand-drawn-icons';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  text: string;
  author_id: string;
  room_id: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
    email: string;
  };
}

interface RealTimeChatProps {
  roomId: string;
  className?: string;
}

export const RealTimeChat: React.FC<RealTimeChatProps> = ({
  roomId,
  className = ""
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Load initial messages
  useEffect(() => {
    if (!roomId) return;

    const loadMessages = async () => {
      try {
        // Fetch messages first
        const { data: messagesData, error } = await supabase
          .from('messages')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });

        if (messagesData && messagesData.length > 0) {
          // Get unique author IDs
          const authorIds = [...new Set(messagesData.map(m => m.author_id))];
          
          // Fetch profiles separately
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, display_name, email')
            .in('id', authorIds);

          // Combine messages with profiles
          const messagesWithProfiles = messagesData.map(message => ({
            ...message,
            profiles: profilesData?.find(p => p.id === message.author_id) || null
          }));

          setMessages(messagesWithProfiles);
        } else {
          setMessages([]);
        }
      } catch (error: any) {
        console.error('Failed to load messages:', error);
        toast({
          title: 'Failed to load messages',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [roomId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room_chat_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Fetch the message
          const { data: messageData } = await supabase
            .from('messages')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (messageData) {
            // Fetch profile data separately
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, display_name, email')
              .eq('id', messageData.author_id)
              .single();

            const messageWithProfile = {
              ...messageData,
              profiles: profileData
            };

            setMessages(prev => [...prev, messageWithProfile]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          text: newMessage.trim(),
          author_id: user.id,
          room_id: roomId
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserDisplayName = (message: ChatMessage) => {
    if (message.author_id === user?.id) return 'You';
    return message.profiles?.display_name || message.profiles?.email || 'Unknown User';
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-1"
            >
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${
                  message.author_id === user?.id ? 'text-primary' : 'text-foreground'
                }`}>
                  {getUserDisplayName(message)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(message.created_at)}
                </span>
              </div>
              <p className={`text-sm p-2 rounded-md max-w-xs ${
                message.author_id === user?.id
                  ? 'bg-primary text-primary-foreground ml-auto text-right'
                  : 'bg-surface-secondary text-foreground'
              }`}>
                {message.text}
              </p>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border">
        <form onSubmit={sendMessage} className="flex space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            className="flex-1 bg-surface-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PlayIcon size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};