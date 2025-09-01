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
  
  const getPreviewContent = () => {
    if (!activeFile) return '<div>No file selected</div>';
    
    if (activeFile.name.endsWith('.html')) {
      return activeFile.content;
    } else if (activeFile.name.endsWith('.js') || activeFile.name.endsWith('.ts')) {
      return `
        <html>
          <head>
            <title>JavaScript Preview</title>
          </head>
          <body>
            <div id="output"></div>
            <script>
              // Capture console.log output
              const originalLog = console.log;
              console.log = function(...args) {
                const output = document.getElementById('output');
                const div = document.createElement('div');
                div.textContent = args.join(' ');
                output.appendChild(div);
                originalLog.apply(console, args);
              };
              
              try {
                ${activeFile.content}
              } catch (error) {
                const output = document.getElementById('output');
                const div = document.createElement('div');
                div.style.color = 'red';
                div.textContent = 'Error: ' + error.message;
                output.appendChild(div);
              }
            </script>
          </body>
        </html>
      `;
    } else if (activeFile.name.endsWith('.css')) {
      return `
        <html>
          <head>
            <style>${activeFile.content}</style>
          </head>
          <body>
            <h1>CSS Preview</h1>
            <p>This is a preview of your CSS styles.</p>
            <div class="example">Example content with your styles applied.</div>
          </body>
        </html>
      `;
    } else {
      return `
        <html>
          <body>
            <pre style="padding: 16px; font-family: monospace; background: #f5f5f5; overflow: auto;">${activeFile.content}</pre>
          </body>
        </html>
      `;
    }
  };

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
                  srcDoc={getPreviewContent()}
                  className="w-full h-full border-0"
                  title="Code Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No file to preview</p>
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