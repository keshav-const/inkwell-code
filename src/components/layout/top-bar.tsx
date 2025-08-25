import React from 'react';
import { motion } from 'framer-motion';
import { PrimaryButton } from '../ui/primary-button';
import { CodeIcon, SettingsIcon, ShareIcon, ChevronDownIcon } from '../icons/hand-drawn-icons';

interface TopBarProps {
  roomId?: string;
  branchName?: string;
  onShareClick?: () => void;
  onSettingsClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  roomId = "main",
  branchName = "main",
  onShareClick,
  onSettingsClick
}) => {
  return (
    <motion.header 
      className="h-14 bg-surface-primary border-b border-border flex items-center justify-between px-4 z-fixed"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left: App Name */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <CodeIcon size={24} className="text-primary" />
          <h1 className="text-lg font-semibold text-foreground">
            Inkwell Code
          </h1>
        </div>
      </div>

      {/* Center: Room and Branch Info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-surface-secondary rounded-md border border-border">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">Room:</span>
          <span className="text-sm font-medium text-foreground">{roomId}</span>
        </div>
        
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-surface-secondary rounded-md border border-border">
          <span className="text-sm text-muted-foreground">Branch:</span>
          <span className="text-sm font-medium text-foreground">{branchName}</span>
          <ChevronDownIcon size={16} className="text-muted-foreground" />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2">
        <PrimaryButton
          variant="ghost"
          size="sm"
          glow
          onClick={onShareClick}
          className="flex items-center space-x-2"
        >
          <ShareIcon size={16} />
          <span>Share</span>
        </PrimaryButton>
        
        <PrimaryButton
          variant="ghost"
          size="sm"
          onClick={onSettingsClick}
        >
          <SettingsIcon size={16} />
        </PrimaryButton>
      </div>
    </motion.header>
  );
};