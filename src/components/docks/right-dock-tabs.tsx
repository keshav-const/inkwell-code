import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UsersIcon, MessageSquareIcon } from '../icons/hand-drawn-icons';
import { ParticipantsList } from '../participants/participants-list';
import { RealTimeChat } from '../chat/real-time-chat';
import { useAuth } from '@/hooks/use-auth';

interface RightDockTabsProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  roomId: string;
  members: RoomMember[];
  collaboration: {
    participants: Participant[];
    isConnected: boolean;
  };
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

type TabType = 'participants' | 'chat';

export const RightDockTabs: React.FC<RightDockTabsProps> = ({ 
  className = "",
  isCollapsed = false,
  roomId,
  members,
  collaboration
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('participants');

  if (isCollapsed) {
    return (
      <motion.div 
        className={`w-12 bg-surface-primary border-l border-border flex flex-col ${className}`}
        initial={{ width: 320 }}
        animate={{ width: 48 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-2 space-y-2">
          <button className="w-8 h-8 rounded-md bg-surface-secondary flex items-center justify-center hover:bg-surface-tertiary transition-colors">
            <UsersIcon size={16} className="text-muted-foreground" />
          </button>
          <button className="w-8 h-8 rounded-md bg-surface-secondary flex items-center justify-center hover:bg-surface-tertiary transition-colors">
            <MessageSquareIcon size={16} className="text-muted-foreground" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`w-80 bg-surface-primary border-l border-border flex flex-col ${className}`}
      initial={{ width: 48 }}
      animate={{ width: 320 }}
      transition={{ duration: 0.3 }}
    >
      {/* Tab Headers */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('participants')}
          className={`flex-1 dock-tab ${activeTab === 'participants' ? 'active' : ''}`}
        >
          <div className="flex items-center justify-center space-x-2">
            <UsersIcon size={16} />
            <span>Participants</span>
            <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
              {members.length}
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 dock-tab ${activeTab === 'chat' ? 'active' : ''}`}
        >
          <div className="flex items-center justify-center space-x-2">
            <MessageSquareIcon size={16} />
            <span>Chat</span>
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'participants' && (
            <motion.div
              key="participants"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full p-4"
            >
              <ParticipantsList 
                members={members}
                collaboration={collaboration}
                currentUserId={user?.id}
              />
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col"
            >
              <RealTimeChat roomId={roomId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};