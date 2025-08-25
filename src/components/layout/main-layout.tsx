import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TopBar } from './top-bar';
import { EditorPane } from '../editor/editor-pane';
import { RightDockTabs } from '../docks/right-dock-tabs';
import { BottomDockTabs } from '../docks/bottom-dock-tabs';

export const MainLayout: React.FC = () => {
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
        roomId="collaborative-room"
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