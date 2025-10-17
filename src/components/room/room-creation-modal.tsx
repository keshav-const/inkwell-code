import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';
import { getDefaultTemplate } from '@/utils/default-templates';

interface RoomCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (roomId: string, roomCode: string) => void;
}

export const RoomCreationModal = ({ isOpen, onClose, onRoomCreated }: RoomCreationModalProps) => {
  const [loading, setLoading] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [createdRoom, setCreatedRoom] = useState<{ id: string; code: string; name: string } | null>(null);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setLoading(true);

    try {
      console.log('🔍 Starting room creation process...');
      
      // Get current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      console.log('🔍 Current authentication status:', {
        hasUser: !!user,
        userId: user?.id,
        userError: userError?.message
      });
      
      if (userError || !user) {
        console.error('❌ Authentication error:', userError);
        throw new Error('You must be logged in to create a room. Please sign in and try again.');
      }

      // Generate unique room code
      const { data: codeData, error: codeError } = await supabase.rpc('generate_room_code');
      
      if (codeError) {
        console.error('❌ Code generation error:', codeError);
        throw new Error(`Failed to generate room code: ${codeError.message}`);
      }
      
      if (!codeData) {
        throw new Error('Failed to generate room code');
      }

      // Create room with explicit admin_id
      const roomData = {
        name: roomName.trim(),
        code: codeData,
        admin_id: user.id, // Explicit admin_id for RLS policy
      };

      console.log('🏠 Creating room with data:', roomData);

      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert(roomData)
        .select()
        .single();

      if (roomError) {
        console.error('❌ Room creation error:', roomError);
        // More specific error handling
        if (roomError.message.includes('violates row-level security')) {
          throw new Error('Room creation failed: Please make sure you are properly signed in and try again.');
        }
        throw new Error(`Failed to create room: ${roomError.message}`);
      }

      console.log('✅ Room created successfully:', room);

      // Create default files
      const defaultFiles = [
        {
          room_id: room.id,
          name: 'index.html',
          type: 'file' as const,
          language: 'html',
          content: getDefaultTemplate('html')
        },
        {
          room_id: room.id,
          name: 'styles.css',
          type: 'file' as const,
          language: 'css',
          content: `/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    text-align: center;
    max-width: 500px;
}

h1 {
    color: #333;
    margin-bottom: 1rem;
}

p {
    color: #666;
    margin-bottom: 2rem;
}

button {
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s ease;
}

button:hover {
    background: #5a6fd8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}`
        },
        {
          room_id: room.id,
          name: 'main.js',
          type: 'file' as const,
          language: 'javascript',
          content: `// Welcome to your collaborative coding environment!

function greet() {
    const messages = [
        "Hello, coder! 👋",
        "Welcome to real-time collaboration! 🚀",
        "Start building something amazing! ✨",
        "Happy coding! 💻",
        "Let's create together! 🤝"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    alert(randomMessage);
}

// Add some interactive behavior
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 Your project is ready!');
    
    // Add hover effects to the button
    const button = document.querySelector('button');
    if (button) {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.05)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
    }
});`
        }
      ];

      const { error: filesError } = await supabase
        .from('files')
        .insert(defaultFiles);

      if (filesError) throw filesError;

      setCreatedRoom({
        id: room.id,
        code: room.code,
        name: room.name
      });

      toast({
        title: 'Room created!',
        description: `Room "${room.name}" has been created successfully.`,
      });

    } catch (error: any) {
      console.error('Failed to create room:', error);
      toast({
        title: 'Failed to create room',
        description: error.message || 'An error occurred while creating the room.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (createdRoom) {
      navigator.clipboard.writeText(createdRoom.code);
      toast({
        title: 'Copied!',
        description: 'Room code copied to clipboard.',
      });
    }
  };

  const handleJoinRoom = () => {
    if (createdRoom) {
      onRoomCreated(createdRoom.id, createdRoom.code);
      onClose();
      setCreatedRoom(null);
      setRoomName('');
    }
  };

  const handleClose = () => {
    onClose();
    setCreatedRoom(null);
    setRoomName('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {createdRoom ? 'Room Created!' : 'Create New Room'}
          </DialogTitle>
        </DialogHeader>

        {!createdRoom ? (
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roomName">Room Name</Label>
              <Input
                id="roomName"
                type="text"
                placeholder="My Awesome Project"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
              />
            </div>

            <PrimaryButton
              type="submit"
              className="w-full"
              disabled={loading || !roomName.trim()}
            >
              {loading ? 'Creating room...' : 'Create Room'}
            </PrimaryButton>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Your room "{createdRoom.name}" is ready!
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Room Code:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-background px-3 py-1 rounded text-lg font-mono font-bold">
                      {createdRoom.code}
                    </code>
                    <PrimaryButton
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyCode}
                    >
                      <Copy className="w-4 h-4" />
                    </PrimaryButton>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Share this code with others to invite them to your room.
                </p>
              </div>
            </div>

            <PrimaryButton
              onClick={handleJoinRoom}
              className="w-full"
            >
              Enter Room
            </PrimaryButton>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};