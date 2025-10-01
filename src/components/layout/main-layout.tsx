import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TopBar } from './top-bar';
import { CollaborativeEditor } from '../editor/collaborative-editor';
import { RightDockTabs } from '../docks/right-dock-tabs';
import { BottomDockTabs } from '../docks/bottom-dock-tabs';
import { ShareModal } from '../room/share-modal';
import { RoomSettingsModal } from '../room/room-settings-modal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { FileModel } from '@/types/collaboration';
import { FileManager } from '@/utils/file-manager';
import { useAuth } from '@/hooks/use-auth';

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
  onRoomUpdated?: (room: Room) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  room, 
  members, 
  files, 
  fileManager, 
  collaboration,
  onRoomUpdated
}) => {
  const { user } = useAuth();
  const [rightDockCollapsed, setRightDockCollapsed] = useState(false);
  const [bottomDockCollapsed, setBottomDockCollapsed] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const isAdmin = user?.id === room.admin_id;

  // Function to open terminal panel
  const openTerminal = () => {
    setBottomDockCollapsed(false);
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const handleSettings = () => {
    setSettingsModalOpen(true);
  };

  const handleUpdateFile = async (fileId: string, newContent: string, newLanguage?: string) => {
    try {
      const updateData: any = { 
        content: newContent,
        updated_at: new Date().toISOString()
      };
      
      if (newLanguage) {
        updateData.language = newLanguage;
      }

      const { error } = await supabase
        .from('files')
        .update(updateData)
        .eq('id', fileId);

      if (error) throw error;

      toast({
        title: 'Project loaded',
        description: 'Your code has been loaded from the saved project.',
      });
    } catch (error: any) {
      console.error('Failed to update file:', error);
      toast({
        title: 'Failed to load project',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Command Bar */}
      <TopBar 
        roomId={room?.code || room?.id?.substring(0, 8)}
        branchName="main"
        currentFile={files.find(f => f.id === collaboration?.activeFileId) || files[0]}
        onShareClick={handleShare}
        onSettingsClick={handleSettings}
        onLoadProject={(code, language) => {
          // Find active file or first file and update it
          const activeFile = files.find(f => f.id === collaboration?.activeFileId) || files[0];
          if (activeFile) {
            handleUpdateFile(activeFile.id, code, language);
          }
        }}
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
            <CollaborativeEditor 
              roomId={room.id}
              files={files}
              collaboration={collaboration}
              onOpenTerminal={openTerminal}
            />
          </div>

          {/* Bottom Dock - Collapsible */}
          <BottomDockTabs 
            isCollapsed={bottomDockCollapsed}
            onToggleCollapse={() => setBottomDockCollapsed(!bottomDockCollapsed)}
            roomId={room.id}
            files={files}
          />
        </motion.div>

        {/* Right Dock - Participants & Chat */}
        <RightDockTabs 
          isCollapsed={rightDockCollapsed}
          onToggleCollapse={() => setRightDockCollapsed(!rightDockCollapsed)}
          roomId={room.id}
          members={members}
          collaboration={collaboration}
        />
      </div>
      
      {/* Modals */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        roomCode={room.code}
        roomName={room.name}
      />
      
      <RoomSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        room={room}
        isAdmin={isAdmin}
        onRoomUpdated={onRoomUpdated || (() => {})}
      />
    </div>
  );
};