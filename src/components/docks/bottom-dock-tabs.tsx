import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitorIcon, TerminalIcon, ChevronDownIcon } from '../icons/hand-drawn-icons';

interface BottomDockTabsProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

type TabType = 'preview' | 'terminal';

export const BottomDockTabs: React.FC<BottomDockTabsProps> = ({ 
  className = "",
  isCollapsed = true 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('preview');

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
        
        <button className="p-1 hover:bg-surface-secondary rounded-md transition-colors">
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
        
        <button className="p-2 mr-2 hover:bg-surface-secondary rounded-md transition-colors">
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
              <iframe
                src="data:text/html;charset=utf-8,%3C!DOCTYPE%20html%3E%3Chtml%3E%3Chead%3E%3Cstyle%3Ebody%7Bfont-family%3A%27Work%20Sans%27%2Csans-serif%3Bmargin%3A0%3Bpadding%3A2rem%3Bbackground%3A%23f8f9fa%3B%7D.container%7Bmax-width%3A600px%3Bmargin%3A0%20auto%3Btext-align%3Acenter%3B%7Dh1%7Bcolor%3A%23333%3Bmargin-bottom%3A1rem%3B%7Dp%7Bcolor%3A%23666%3Bmargin-bottom%3A2rem%3B%7D.preview-note%7Bbackground%3A%23e3f2fd%3Bborder-left%3A4px%20solid%20%232196f3%3Bpadding%3A1rem%3Bmargin%3A2rem%200%3Bborder-radius%3A4px%3B%7D%3C%2Fstyle%3E%3C%2Fhead%3E%3Cbody%3E%3Cdiv%20class%3D%22container%22%3E%3Ch1%3EPreview%20Mode%3C%2Fh1%3E%3Cp%3EYour%20code%20output%20will%20appear%20here%3C%2Fp%3E%3Cdiv%20class%3D%22preview-note%22%3E%3Cstrong%3ENote%3A%3C%2Fstrong%3E%20Live%20preview%20functionality%20is%20coming%20soon.%20When%20ready%2C%20your%20HTML%2FCSS%2FJS%20will%20render%20here%20in%20real-time.%3C%2Fdiv%3E%3C%2Fdiv%3E%3C%2Fbody%3E%3C%2Fhtml%3E"
                className="w-full h-full border-0"
                title="Code Preview"
              />
            </motion.div>
          )}

          {activeTab === 'terminal' && (
            <motion.div
              key="terminal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full bg-black text-green-400 p-4 font-mono text-sm overflow-y-auto relative"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">$</span>
                  <span className="text-white">Welcome to Inkwell Code Terminal</span>
                </div>
                <div className="text-gray-400">
                  Terminal functionality is being developed...
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <span className="text-green-500">$</span>
                  <span className="text-white animate-pulse">|</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};