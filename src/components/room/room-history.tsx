import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { HandDrawnCodeIcon } from '@/components/icons/hand-drawn-icons';
import { Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface RoomHistoryItem {
  id: string;
  room_code: string;
  room_id: string | null;
  joined_at: string;
  last_visited: string;
  rooms?: {
    name: string;
    code: string;
  } | null;
}

export const RoomHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<RoomHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadHistory = async () => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabase
          .from('room_history')
          .select(`
            id,
            room_code,
            room_id,
            joined_at,
            last_visited,
            rooms:room_id (
              name,
              code
            )
          `)
          .eq('user_id', user.id)
          .gte('joined_at', thirtyDaysAgo.toISOString())
          .order('last_visited', { ascending: false });

        if (error) throw error;
        setHistory(data || []);
      } catch (error: any) {
        console.error('Failed to load room history:', error);
        toast({
          title: 'Failed to load history',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user]);

  const handleRoomClick = async (item: RoomHistoryItem) => {
    if (!item.room_id) {
      toast({
        title: 'Room no longer exists',
        description: 'This room has been deleted.',
        variant: 'destructive'
      });
      return;
    }

    // Update last_visited
    await supabase
      .from('room_history')
      .update({ last_visited: new Date().toISOString() })
      .eq('id', item.id);

    navigate(`/room/${item.room_id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <HandDrawnCodeIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No recent rooms</p>
        <p className="text-sm text-muted-foreground mt-2">
          Rooms you join will appear here for the last 30 days
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-foreground">Recent Rooms</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={`glass-panel p-5 cursor-pointer transition-all hover:shadow-xl hover:ring-2 hover:ring-primary/30 ${
                item.room_id ? '' : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => handleRoomClick(item)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center ring-2 ring-primary/20">
                      <HandDrawnCodeIcon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground">
                      {item.rooms?.name || item.room_code}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      Last visited {formatDistanceToNow(new Date(item.last_visited), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="mt-3 px-3 py-1.5 bg-muted/50 rounded-md inline-block">
                    <span className="text-xs font-mono font-bold text-foreground">
                      {item.room_code}
                    </span>
                  </div>
                </div>
                {!item.room_id && (
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
