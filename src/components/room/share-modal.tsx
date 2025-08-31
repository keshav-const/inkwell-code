import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShareIcon } from '../icons/hand-drawn-icons';
import { toast } from '@/hooks/use-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  roomName: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  roomName
}) => {
  const [copied, setCopied] = useState(false);

  const roomUrl = `${window.location.origin}/room/${roomCode}`;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: 'Copied to clipboard',
        description: `${label} has been copied to your clipboard.`,
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: 'Failed to copy',
        description: 'Please copy the text manually.',
        variant: 'destructive'
      });
    }
  };

  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${roomName} on Inkwell Code`,
          text: `You're invited to collaborate on "${roomName}". Use code: ${roomCode}`,
          url: roomUrl
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // Fallback to copying URL
      copyToClipboard(roomUrl, 'Room URL');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShareIcon size={20} />
            <span>Share Room</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h3 className="font-medium text-foreground">{roomName}</h3>
            <p className="text-sm text-muted-foreground">
              Invite others to collaborate on this room
            </p>
          </div>

          {/* Room Code */}
          <div className="space-y-2">
            <Label htmlFor="roomCode">Room Code</Label>
            <div className="flex space-x-2">
              <Input
                id="roomCode"
                value={roomCode}
                readOnly
                className="font-mono text-center text-lg tracking-wider"
              />
              <PrimaryButton
                onClick={() => copyToClipboard(roomCode, 'Room code')}
                size="sm"
                variant={copied ? 'secondary' : 'primary'}
              >
                {copied ? 'Copied!' : 'Copy'}
              </PrimaryButton>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this 6-character code with others
            </p>
          </div>

          {/* Room URL */}
          <div className="space-y-2">
            <Label htmlFor="roomUrl">Room URL</Label>
            <div className="flex space-x-2">
              <Input
                id="roomUrl"
                value={roomUrl}
                readOnly
                className="text-sm"
              />
              <PrimaryButton
                onClick={() => copyToClipboard(roomUrl, 'Room URL')}
                size="sm"
                variant={copied ? 'secondary' : 'primary'}
              >
                {copied ? 'Copied!' : 'Copy'}
              </PrimaryButton>
            </div>
          </div>

          {/* Share Actions */}
          <div className="flex space-x-2 pt-2">
            <PrimaryButton
              onClick={shareViaWebAPI}
              variant="primary"
              className="flex-1"
            >
              <ShareIcon size={16} />
              <span>Share</span>
            </PrimaryButton>
            <PrimaryButton
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Done
            </PrimaryButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};