import React from 'react';
import { motion } from 'framer-motion';

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

interface ParticipantsListProps {
  members: RoomMember[];
  collaboration: {
    participants: Participant[];
    isConnected: boolean;
  };
  currentUserId?: string;
  className?: string;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  members,
  collaboration,
  currentUserId,
  className = ""
}) => {
  // Combine members with collaboration participants
  const activeParticipants = members.map(member => {
    const participant = collaboration.participants.find(p => p.id === member.user_id);
    const displayName = member.profiles.display_name || member.profiles.email.split('@')[0];
    
    return {
      ...member,
      displayName,
      isOnline: !!participant,
      cursor: participant?.cursor,
      color: participant?.color || '#2CA6A4',
      isCurrentUser: member.user_id === currentUserId
    };
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getBorderColor = (color?: string) => {
    return color ? { borderColor: color } : {};
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">
          Participants ({activeParticipants.length})
        </h3>
        <div className={`w-2 h-2 rounded-full ${
          collaboration.isConnected ? 'bg-success' : 'bg-destructive'
        }`} title={collaboration.isConnected ? 'Connected' : 'Disconnected'} />
      </div>

      {activeParticipants.map((participant) => (
        <motion.div
          key={participant.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center space-x-3 p-3 rounded-lg bg-surface-secondary hover:bg-surface-tertiary transition-colors"
        >
          <div className="relative">
            {participant.profiles.avatar_url ? (
              <img
                src={participant.profiles.avatar_url}
                alt={participant.displayName}
                className="w-8 h-8 rounded-full object-cover"
                style={getBorderColor(participant.color)}
              />
            ) : (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white border-2"
                style={{ 
                  backgroundColor: participant.color,
                  ...getBorderColor(participant.color)
                }}
              >
                {getInitials(participant.displayName)}
              </div>
            )}
            
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-surface-secondary ${
              participant.isOnline ? 'bg-success' : 'bg-muted-foreground'
            }`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-foreground truncate">
                {participant.isCurrentUser ? 'You' : participant.displayName}
              </p>
              {participant.role === 'admin' && (
                <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </div>
            
            {participant.cursor && participant.isOnline && (
              <p className="text-xs text-muted-foreground">
                Line {participant.cursor.line}:{participant.cursor.column}
              </p>
            )}
            
            {!participant.isOnline && (
              <p className="text-xs text-muted-foreground">
                Offline
              </p>
            )}
          </div>
        </motion.div>
      ))}

      {activeParticipants.length === 0 && (
        <div className="text-center text-muted-foreground py-4">
          <p className="text-sm">No participants yet</p>
        </div>
      )}
    </div>
  );
};