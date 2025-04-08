
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAuctionNotifications = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Only set up listeners if we have a logged-in user
    if (!user) return;

    // Listen for bid accepted events on user's bids
    const channel = supabase
      .channel('auction-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bids',
          filter: `bidder_id=eq.${user.id} AND is_accepted=eq.true`
        },
        (payload) => {
          // Get capsule info
          const getCapsuleInfo = async () => {
            const { data } = await supabase
              .from('capsules')
              .select('name')
              .eq('id', payload.new.capsule_id)
              .single();
            
            toast({
              title: "Bid Accepted! 🎉",
              description: `Your bid on "${data?.name || 'a capsule'}" has been accepted!`,
            });
          };
          
          getCapsuleInfo();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `bidder_id=neq.${user.id}`
        },
        async (payload) => {
          // Check if this is on a capsule created by the current user
          const { data } = await supabase
            .from('capsules')
            .select('name, creator_id')
            .eq('id', payload.new.capsule_id)
            .eq('creator_id', user.id)
            .single();
          
          if (data) {
            // Get bidder name
            const { data: bidderProfile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', payload.new.bidder_id)
              .single();
              
            toast({
              title: "New Bid!",
              description: `${bidderProfile?.username || 'Someone'} placed a bid of Ξ${payload.new.amount} on your "${data.name}" capsule.`,
            });
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return null;
};

const AuctionNotifications = () => {
  useAuctionNotifications();
  return null; // Render nothing
};

export default AuctionNotifications;
