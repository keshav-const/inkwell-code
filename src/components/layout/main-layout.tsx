import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TopBar } from './top-bar';
import { EditorPane } from '../editor/editor-pane';
import { RightDockTabs } from '../docks/right-dock-tabs';
import { BottomDockTabs } from '../docks/bottom-dock-tabs';
import type { FileModel } from '@/types/collaboration';
import { FileManager } from '@/utils/file-manager';

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

interface MainLayoutProps {
  room: Room;
  members: RoomMember[];
  files: FileModel[];
  fileManager: FileManager | null;
  collaboration: any;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  room, 
  members, 
  files, 
  fileManager, 
  collaboration 
}) => {
  const [rightDockCollapsed, setRightDockCollapsed] = useState(false);
  const [bottomDockCollapsed, setBottomDockCollapsed] = useState(true);

  const handleShare = () => {
    // Placeholder for share functionality
    console.log('Share functionality coming soon...');
  };

  const handleSettings = () => {
    // Placeholder for settings functionality
    console.log('Settings functionality coming soon...');
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Command Bar */}
      <TopBar 
        roomId={room.id}
        branchName="main"
        onShareClick={handleShare}
        onSettingsClick={handleSettings}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor Section - Asymmetrical, slightly off-center */}
        <motion.div 
          className="flex-1 flex flex-col min-w-0"
          layout
          transition={{ duration: 0.3 }}
        >
          {/* Editor Pane - Dominant column */}
          <div className="flex-1 overflow-hidden">
            <EditorPane />
          </div>

          {/* Bottom Dock - Collapsible */}
          <BottomDockTabs 
            isCollapsed={bottomDockCollapsed}
            onToggleCollapse={() => setBottomDockCollapsed(!bottomDockCollapsed)}
          />
        </motion.div>

        {/* Right Dock - Participants & Chat */}
        <RightDockTabs 
          isCollapsed={rightDockCollapsed}
          onToggleCollapse={() => setRightDockCollapsed(!rightDockCollapsed)}
        />
      </div>
    </div>
  );
};