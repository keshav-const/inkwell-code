import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SettingsIcon } from '../icons/hand-drawn-icons';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface RoomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: {
    id: string;
    name: string;
    code: string;
    admin_id: string;
  };
  isAdmin: boolean;
  onRoomUpdated: (updatedRoom: any) => void;
}

export const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({
  isOpen,
  onClose,
  room,
  isAdmin,
  onRoomUpdated
}) => {
  const [roomName, setRoomName] = useState(room.name);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!roomName.trim() || !isAdmin) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update({ name: roomName.trim() })
        .eq('id', room.id)
        .select()
        .single();

      if (error) throw error;

      onRoomUpdated(data);
      onClose();
      
      toast({
        title: 'Room updated',
        description: 'Room name has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Failed to update room:', error);
      toast({
        title: 'Failed to update room',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin || !confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      // Delete all files first
      await supabase
        .from('files')
        .delete()
        .eq('room_id', room.id);

      // Delete all messages
      await supabase
        .from('messages')
        .delete()
        .eq('room_id', room.id);

      // Delete all room members
      await supabase
        .from('room_members')
        .delete()
        .eq('room_id', room.id);

      // Finally delete the room
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', room.id);

      if (error) throw error;

      toast({
        title: 'Room deleted',
        description: 'The room has been deleted successfully.',
      });

      // Redirect to home page
      window.location.href = '/';
    } catch (error: any) {
      console.error('Failed to delete room:', error);
      toast({
        title: 'Failed to delete room',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <SettingsIcon size={20} />
            <span>Room Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Room Information */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              <strong>Room Code:</strong> {room.code}
            </div>
          </div>

          {/* Room Name */}
          <div className="space-y-2">
            <Label htmlFor="roomName">Room Name</Label>
            <Input
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              disabled={!isAdmin}
              placeholder="Enter room name"
            />
            {!isAdmin && (
              <p className="text-xs text-muted-foreground">
                Only room admins can modify settings
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-4">
            {isAdmin && (
              <>
                <PrimaryButton
                  onClick={handleSave}
                  disabled={saving || roomName.trim() === room.name}
                  variant="primary"
                  className="flex-1"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </PrimaryButton>
                
                <PrimaryButton
                  onClick={handleDelete}
                  disabled={deleting}
                  variant="secondary"
                  className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? 'Deleting...' : 'Delete Room'}
                </PrimaryButton>
              </>
            )}
            
            <PrimaryButton
              onClick={onClose}
              variant="secondary"
              className={isAdmin ? 'flex-none' : 'flex-1'}
            >
              {isAdmin ? 'Cancel' : 'Close'}
            </PrimaryButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};