import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitorIcon, TerminalIcon, ChevronDownIcon } from '../icons/hand-drawn-icons';
import { CodeTerminal } from '../terminal/code-terminal';
import type { FileModel } from '@/types/collaboration';

interface BottomDockTabsProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  roomId: string;
  files: FileModel[];
}

type TabType = 'preview' | 'terminal';

export const BottomDockTabs: React.FC<BottomDockTabsProps> = ({ 
  className = "",
  isCollapsed = true,
  onToggleCollapse,
  roomId,
  files
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('preview');
  
  const activeFile = files.find(f => f.name.endsWith('.html')) || files[0];

  if (isCollapsed) {
    return (
      <motion.div 
        className={`h-12 bg-surface-primary border-t border-border flex items-center justify-between px-4 ${className}`}
        initial={{ height: 300 }}
        animate={{ height: 48 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-4">
          <div className="flex space-x-1">
            <button className="dock-tab active">
              <div className="flex items-center space-x-2">
                <MonitorIcon size={16} />
                <span>Preview</span>
              </div>
            </button>
            <button className="dock-tab">
              <div className="flex items-center space-x-2">
                <TerminalIcon size={16} />
                <span>Terminal</span>
              </div>
            </button>
          </div>
        </div>
        
        <button className="p-1 hover:bg-surface-secondary rounded-md transition-colors" onClick={onToggleCollapse}>
          <ChevronDownIcon size={16} className="text-muted-foreground rotate-180" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`h-80 bg-surface-primary border-t border-border flex flex-col ${className}`}
      initial={{ height: 48 }}
      animate={{ height: 320 }}
      transition={{ duration: 0.3 }}
    >
      {/* Tab Headers */}
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex">
          <button
            onClick={() => setActiveTab('preview')}
            className={`dock-tab ${activeTab === 'preview' ? 'active' : ''}`}
          >
            <div className="flex items-center space-x-2">
              <MonitorIcon size={16} />
              <span>Preview</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`dock-tab ${activeTab === 'terminal' ? 'active' : ''}`}
          >
            <div className="flex items-center space-x-2">
              <TerminalIcon size={16} />
              <span>Terminal</span>
            </div>
          </button>
        </div>
        
        <button className="p-2 mr-2 hover:bg-surface-secondary rounded-md transition-colors" onClick={onToggleCollapse}>
          <ChevronDownIcon size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full bg-white"
            >
              {activeFile ? (
                <iframe
                  srcDoc={activeFile.content}
                  className="w-full h-full border-0"
                  title="Code Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No HTML file to preview</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'terminal' && (
            <motion.div
              key="terminal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <CodeTerminal activeFile={activeFile} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};