import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PrimaryButton } from '@/components/ui/primary-button';
import { AuthModal } from '@/components/auth/auth-modal';
import { RoomCreationModal } from '@/components/room/room-creation-modal';
import { RoomJoinModal } from '@/components/room/room-join-modal';
import { useAuth } from '@/hooks/use-auth';
import { HandDrawnCodeIcon, HandDrawnUsersIcon } from '@/components/icons/hand-drawn-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const Home = () => {
  const { user, profile, loading, signOut, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [redirectToRoom, setRedirectToRoom] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
    } catch (error: any) {
      toast({
        title: 'Sign out failed',
        description: error.message || 'An error occurred while signing out.',
        variant: 'destructive',
      });
    }
  };

  const handleRoomCreated = (roomId: string) => {
    setRedirectToRoom(roomId);
  };

  const handleRoomJoined = (roomId: string) => {
    setRedirectToRoom(roomId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (redirectToRoom) {
    return <Navigate to={`/room/${redirectToRoom}`} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HandDrawnCodeIcon className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">CodeCollabs</h1>
          </div>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-accent/50 rounded-lg px-3 py-2 transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback>
                      {profile?.display_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {profile?.display_name || profile?.email}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <PrimaryButton onClick={() => setShowAuthModal(true)}>
              Sign In
            </PrimaryButton>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8"
        >
          {/* Hero Section */}
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-block p-4 bg-primary/10 rounded-full mb-6"
            >
              <HandDrawnCodeIcon className="w-16 h-16 text-primary" />
            </motion.div>

            <h1 className="text-5xl font-bold text-foreground leading-tight">
              Code Together,
              <br />
              <span className="text-primary">Create Together</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A real-time collaborative code editor where teams can write, edit, 
              and debug code together. Perfect for pair programming, code reviews, 
              and remote collaboration.
            </p>
          </div>

          {/* Actions */}
          {isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto"
            >
              <PrimaryButton
                size="lg"
                onClick={() => setShowCreateRoom(true)}
                className="w-full sm:w-auto"
              >
                <HandDrawnCodeIcon className="w-5 h-5 mr-2" />
                Create Room
              </PrimaryButton>

              <PrimaryButton
                variant="outline"
                size="lg"
                onClick={() => setShowJoinRoom(true)}
                className="w-full sm:w-auto"
              >
                <HandDrawnUsersIcon className="w-5 h-5 mr-2" />
                Join Room
              </PrimaryButton>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <PrimaryButton
                size="lg"
                onClick={() => setShowAuthModal(true)}
                className="px-8"
              >
                Get Started
              </PrimaryButton>
              <p className="text-sm text-muted-foreground">
                Sign in to create or join collaborative coding rooms
              </p>
            </motion.div>
          )}

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-border"
          >
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <HandDrawnCodeIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Real-time Editing</h3>
              <p className="text-sm text-muted-foreground">
                See changes instantly as your team codes together with live cursors and updates.
              </p>
            </div>

            <div className="space-y-3 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                <HandDrawnUsersIcon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">Team Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Invite unlimited team members with secure room codes and permissions.
              </p>
            </div>

            <div className="space-y-3 text-center">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto">
                <div className="w-6 h-6 bg-secondary rounded-sm"></div>
              </div>
              <h3 className="text-lg font-semibold">Live Preview</h3>
              <p className="text-sm text-muted-foreground">
                See your code come to life with instant preview and built-in compiler support.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <RoomCreationModal
        isOpen={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
        onRoomCreated={handleRoomCreated}
      />

      <RoomJoinModal
        isOpen={showJoinRoom}
        onClose={() => setShowJoinRoom(false)}
        onRoomJoined={handleRoomJoined}
      />
    </div>
  );
};