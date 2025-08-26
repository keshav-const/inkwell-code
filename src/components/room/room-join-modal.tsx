import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface RoomJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomJoined: (roomId: string) => void;
}

export const RoomJoinModal = ({ isOpen, onClose, onRoomJoined }: RoomJoinModalProps) => {
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    setLoading(true);

    try {
      // Find room by code
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id, name, code')
        .eq('code', roomCode.trim().toUpperCase())
        .single();

      if (roomError || !room) {
        throw new Error('Room not found. Please check the code and try again.');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to join a room.');
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('room_members')
        .select('id')
        .eq('room_id', room.id)
        .eq('user_id', user.id)
        .single();

      if (!existingMember) {
        // Add user as member
        const { error: memberError } = await supabase
          .from('room_members')
          .insert({
            room_id: room.id,
            user_id: user.id,
            role: 'member'
          });

        if (memberError) throw memberError;
      }

      toast({
        title: 'Joined room!',
        description: `Welcome to "${room.name}".`,
      });

      onRoomJoined(room.id);
      onClose();
      setRoomCode('');

    } catch (error: any) {
      console.error('Failed to join room:', error);
      toast({
        title: 'Failed to join room',
        description: error.message || 'An error occurred while joining the room.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Join Room</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleJoinRoom} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomCode">Room Code</Label>
            <Input
              id="roomCode"
              type="text"
              placeholder="ABC123"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              required
              maxLength={8}
              className="font-mono text-center text-lg tracking-wider"
            />
            <p className="text-xs text-muted-foreground">
              Enter the 6-character room code provided by the room creator.
            </p>
          </div>

          <PrimaryButton
            type="submit"
            className="w-full"
            disabled={loading || roomCode.trim().length < 6}
          >
            {loading ? 'Joining room...' : 'Join Room'}
          </PrimaryButton>
        </form>
      </DialogContent>
    </Dialog>
  );
};