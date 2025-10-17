import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { PrimaryButton } from '../ui/primary-button';
import { CodeIcon, SettingsIcon, ShareIcon, ChevronDownIcon, UsersIcon } from '../icons/hand-drawn-icons';
import { LogOut, ArrowLeft, Sun, Moon, User, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AuthModal } from '@/components/auth/auth-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProjectManager } from '@/components/projects/project-manager';
import type { FileModel } from '@/types/collaboration';

interface TopBarProps {
  roomId?: string;
  branchName?: string;
  currentFile?: FileModel;
  onShareClick?: () => void;
  onSettingsClick?: () => void;
  onLoadProject?: (code: string, language: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  roomId = "main",
  branchName = "main",
  currentFile,
  onShareClick,
  onSettingsClick,
  onLoadProject
}) => {
  const { user, isAuthenticated, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    // Try to get from user_metadata first, fallback to profile
    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.email?.split('@')[0] || 
           'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserAvatar = () => {
    // Try to get from user_metadata first (GitHub/Google OAuth)
    return user?.user_metadata?.avatar_url || '';
  };
  return (
    <motion.header 
      className="h-14 bg-surface-primary border-b border-border flex items-center justify-between px-4 z-fixed"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left: Back Button + App Name */}
      <div className="flex items-center space-x-3">
        <PrimaryButton
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center space-x-1"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </PrimaryButton>
        <div className="h-6 w-px bg-border" />
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
        {/* Theme Toggle */}
        <PrimaryButton
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center"
        >
          {theme === 'dark' ? (
            <Sun size={18} className="text-primary" />
          ) : (
            <Moon size={18} className="text-primary" />
          )}
        </PrimaryButton>

        {isAuthenticated ? (
          <>
            <ProjectManager 
              currentFile={currentFile}
              onLoadProject={onLoadProject}
            />
            
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

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-surface-secondary transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getUserAvatar()} />
                    <AvatarFallback className="text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-sm font-medium text-foreground truncate max-w-24">
                      {getUserDisplayName()}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-24">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronDownIcon size={14} className="text-muted-foreground flex-shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex items-center space-x-2">
                  <UsersIcon size={16} />
                  <div className="flex flex-col">
                    <span className="font-medium">{getUserDisplayName()}</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')} className="flex items-center space-x-2">
                  <User size={16} />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="flex items-center space-x-2">
                  <Settings size={16} />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center space-x-2 text-red-600 hover:text-red-700">
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <PrimaryButton
            variant="primary"
            size="sm"
            onClick={() => setShowAuthModal(true)}
            className="flex items-center space-x-2"
          >
            <UsersIcon size={16} />
            <span>Sign In</span>
          </PrimaryButton>
        )}
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </motion.header>
  );
};