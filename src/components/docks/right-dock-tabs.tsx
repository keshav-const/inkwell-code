import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UsersIcon, MessageSquareIcon } from '../icons/hand-drawn-icons';

interface RightDockTabsProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

type TabType = 'participants' | 'chat';

const mockParticipants = [
  { id: '1', name: 'You', status: 'online', cursor: { line: 12, column: 5 } },
  { id: '2', name: 'Alice Chen', status: 'online', cursor: { line: 28, column: 12 } },
  { id: '3', name: 'Bob Smith', status: 'away', cursor: null },
];

const mockMessages = [
  { id: '1', user: 'Alice Chen', message: 'Hey everyone! Just joined the session.', timestamp: '2:34 PM' },
  { id: '2', user: 'You', message: 'Welcome Alice! Working on the main component.', timestamp: '2:35 PM' },
  { id: '3', user: 'Alice Chen', message: 'Looks great! I\'ll help with the CSS.', timestamp: '2:36 PM' },
];

export const RightDockTabs: React.FC<RightDockTabsProps> = ({ 
  className = "",
  isCollapsed = false 
}) => {
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
              {mockParticipants.length}
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
              <div className="space-y-3">
                {mockParticipants.map((participant) => (
                  <div 
                    key={participant.id}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-surface-secondary hover:bg-surface-tertiary transition-colors"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-foreground">
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-surface-secondary ${
                        participant.status === 'online' ? 'bg-success' : 'bg-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {participant.name}
                      </p>
                      {participant.cursor && (
                        <p className="text-xs text-muted-foreground">
                          Line {participant.cursor.line}:{participant.cursor.column}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {mockMessages.map((message) => (
                  <div key={message.id} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-foreground">
                        {message.user}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground bg-surface-secondary p-2 rounded-md">
                      {message.message}
                    </p>
                  </div>
                ))}
              </div>

              {/* Message Input Placeholder */}
              <div className="p-4 border-t border-border">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 bg-surface-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled
                  />
                  <button 
                    disabled
                    className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium opacity-50 cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Chat functionality coming soon
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};