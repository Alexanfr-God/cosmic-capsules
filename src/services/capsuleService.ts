
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';

export type Capsule = {
  id: string;
  name: string;
  message?: string;
  open_date: string;
  status: string;
  creator_id: string;
  creator?: UserProfile;
  current_bid?: number;
  image_url?: string;
  auction_enabled?: boolean;
}

export const getUserCapsules = async (userId: string): Promise<Capsule[]> => {
  try {
    console.log(`Fetching capsules for user ID: ${userId}`);
    
    const { data, error } = await supabase
      .from('capsules')
      .select(`
        *,
        creator:creator_id(id, username, avatar_url)
      `)
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching user capsules:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getUserCapsules:', error);
    return [];
  }
};

export const getUpcomingCapsules = async (limit: number = 6): Promise<Capsule[]> => {
  try {
    const { data, error } = await supabase
      .from('capsules')
      .select(`
        *,
        creator:creator_id(id, username, avatar_url)
      `)
      .gt('open_date', new Date().toISOString())
      .order('open_date', { ascending: true })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching upcoming capsules:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getUpcomingCapsules:', error);
    return [];
  }
};

export const getAuctionCapsules = async (limit: number = 10): Promise<Capsule[]> => {
  try {
    const { data, error } = await supabase
      .from('capsules')
      .select(`
        *,
        creator:creator_id(id, username, avatar_url)
      `)
      .eq('auction_enabled', true)
      .gt('open_date', new Date().toISOString())
      .order('current_bid', { ascending: false, nullsFirst: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching auction capsules:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAuctionCapsules:', error);
    return [];
  }
};
