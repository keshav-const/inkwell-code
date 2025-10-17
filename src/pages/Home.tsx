import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { PrimaryButton } from '@/components/ui/primary-button';
import { AuthModal } from '@/components/auth/auth-modal';
import { RoomCreationModal } from '@/components/room/room-creation-modal';
import { RoomJoinModal } from '@/components/room/room-join-modal';
import { RoomHistory } from '@/components/room/room-history';
import { Footer } from '@/components/layout/footer';
import { useAuth } from '@/hooks/use-auth';
import { HandDrawnCodeIcon, HandDrawnUsersIcon } from '@/components/icons/hand-drawn-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User, History, Sun, Moon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const Home = () => {
  const { user, profile, loading, signOut, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [redirectToRoom, setRedirectToRoom] = useState<string | null>(null);

  // Check for pending room redirect after login
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const pendingRoomId = sessionStorage.getItem('pendingRoomId');
      if (pendingRoomId) {
        sessionStorage.removeItem('pendingRoomId');
        setRedirectToRoom(pendingRoomId);
      }
    }
  }, [isAuthenticated, loading]);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HandDrawnCodeIcon className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">CodeCollabs</h1>
          </div>

          <div className="flex items-center gap-3">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 hover:bg-accent/10 rounded-lg px-3 py-2 transition-colors">
                    <Avatar className="w-8 h-8 ring-2 ring-primary/20">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {profile?.display_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {profile?.display_name || profile?.email}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-panel">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/profile" className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/settings" className="flex items-center w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <PrimaryButton onClick={() => setShowAuthModal(true)} glow>
                Sign In
              </PrimaryButton>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-20">
        {isAuthenticated ? (
          <div className="space-y-12">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="inline-block p-6 glass-card mb-6"
                >
                  <HandDrawnCodeIcon className="w-20 h-20 text-primary" />
                </motion.div>

                <h1 className="text-6xl font-bold text-foreground leading-tight">
                  Collaborate & Code
                  <br />
                  <span className="text-primary">In Real-Time</span>
                </h1>

                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Create a room and start coding with your team instantly
                </p>
              </div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <PrimaryButton
                  size="lg"
                  onClick={() => setShowCreateRoom(true)}
                  className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl"
                  glow
                >
                  <HandDrawnCodeIcon className="w-6 h-6 mr-2" />
                  Create New Room
                </PrimaryButton>

                <PrimaryButton
                  variant="outline"
                  size="lg"
                  onClick={() => setShowJoinRoom(true)}
                  className="text-lg px-8 py-6"
                >
                  <HandDrawnUsersIcon className="w-6 h-6 mr-2" />
                  Join Room
                </PrimaryButton>
              </motion.div>
            </motion.div>

            {/* Room History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-8"
            >
              <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid w-full grid-cols-1 mb-6">
                  <TabsTrigger value="history" className="text-base">
                    <History className="w-5 h-5 mr-2" />
                    Recent Rooms
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="history">
                  <RoomHistory />
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="glass-card p-6 space-y-3 text-center hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto ring-2 ring-primary/20">
                  <HandDrawnCodeIcon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Real-time Editing</h3>
                <p className="text-sm text-muted-foreground">
                  See changes instantly as your team codes together with live cursors and updates.
                </p>
              </div>

              <div className="glass-card p-6 space-y-3 text-center hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mx-auto ring-2 ring-accent/20">
                  <HandDrawnUsersIcon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-lg font-bold">Team Collaboration</h3>
                <p className="text-sm text-muted-foreground">
                  Invite unlimited team members with secure room codes and permissions.
                </p>
              </div>

              <div className="glass-card p-6 space-y-3 text-center hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-secondary/30 rounded-xl flex items-center justify-center mx-auto ring-2 ring-border">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded"></div>
                </div>
                <h3 className="text-lg font-bold">Live Preview</h3>
                <p className="text-sm text-muted-foreground">
                  See your code come to life with instant preview and built-in compiler support.
                </p>
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-10"
          >
            {/* Hero Section */}
            <div className="space-y-6">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-block p-6 glass-card mb-8"
              >
                <HandDrawnCodeIcon className="w-24 h-24 text-primary" />
              </motion.div>

              <h1 className="text-6xl font-bold text-foreground leading-tight">
                Code Together,
                <br />
                <span className="text-primary">Create Together</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                A real-time collaborative code editor where teams can write, edit, 
                and debug code together. Perfect for pair programming, code reviews, 
                and remote collaboration.
              </p>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <PrimaryButton
                size="lg"
                onClick={() => setShowAuthModal(true)}
                className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl"
                glow
              >
                Get Started Free
              </PrimaryButton>
              <p className="text-sm text-muted-foreground">
                Sign in to create or join collaborative coding rooms
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
            >
              <div className="glass-card p-6 space-y-3 text-center hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto ring-2 ring-primary/20">
                  <HandDrawnCodeIcon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Real-time Editing</h3>
                <p className="text-sm text-muted-foreground">
                  See changes instantly as your team codes together with live cursors and updates.
                </p>
              </div>

              <div className="glass-card p-6 space-y-3 text-center hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mx-auto ring-2 ring-accent/20">
                  <HandDrawnUsersIcon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-lg font-bold">Team Collaboration</h3>
                <p className="text-sm text-muted-foreground">
                  Invite unlimited team members with secure room codes and permissions.
                </p>
              </div>

              <div className="glass-card p-6 space-y-3 text-center hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-secondary/30 rounded-xl flex items-center justify-center mx-auto ring-2 ring-border">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded"></div>
                </div>
                <h3 className="text-lg font-bold">Live Preview</h3>
                <p className="text-sm text-muted-foreground">
                  See your code come to life with instant preview and built-in compiler support.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
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

      {/* Footer */}
      <Footer />
    </div>
  );
};