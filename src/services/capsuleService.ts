
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';

export type Capsule = {
  id: string;
  name: string;
  message?: string;
  open_date: string;
  status: string;
  creator_id: string;
  creator?: UserProfile | null;
  current_bid?: number;
  image_url?: string;
  auction_enabled?: boolean;
  initial_bid?: number;
  created_at?: string;
  updated_at?: string;
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
    
    // Transform the data to ensure it matches the Capsule type
    const capsules = data?.map(item => ({
      ...item,
      creator: item.creator && typeof item.creator !== 'string' ? item.creator as unknown as UserProfile : null
    })) || [];
    
    return capsules;
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
    
    // Transform the data to ensure it matches the Capsule type
    const capsules = data?.map(item => ({
      ...item,
      creator: item.creator && typeof item.creator !== 'string' ? item.creator as unknown as UserProfile : null
    })) || [];
    
    return capsules;
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
    
    // Transform the data to ensure it matches the Capsule type
    const capsules = data?.map(item => ({
      ...item,
      creator: item.creator && typeof item.creator !== 'string' ? item.creator as unknown as UserProfile : null
    })) || [];
    
    return capsules;
  } catch (error) {
    console.error('Error in getAuctionCapsules:', error);
    return [];
  }
};

export const getAllCapsules = async (): Promise<Capsule[]> => {
  try {
    const { data, error } = await supabase
      .from('capsules')
      .select(`
        *,
        creator:creator_id(id, username, avatar_url)
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching all capsules:', error);
      throw error;
    }
    
    // Transform the data to ensure it matches the Capsule type
    const capsules = data?.map(item => ({
      ...item,
      creator: item.creator && typeof item.creator !== 'string' ? item.creator as unknown as UserProfile : null
    })) || [];
    
    return capsules;
  } catch (error) {
    console.error('Error in getAllCapsules:', error);
    return [];
  }
};

// Define a more specific type for capsule creation data
type CapsuleCreationData = {
  name: string;
  creator_id: string;
  open_date: string;
  message?: string;
  image_url?: string | null;
  auction_enabled?: boolean;
  status?: string;
  initial_bid?: number;
  [key: string]: any; // Allow for additional properties
};

export const createCapsule = async (capsuleData: CapsuleCreationData): Promise<Capsule> => {
  try {
    if (!capsuleData.creator_id) {
      throw new Error('creator_id is required for capsule creation');
    }
    
    const { data, error } = await supabase
      .from('capsules')
      .insert(capsuleData)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating capsule:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned from capsule creation');
    }
    
    return data;
  } catch (error) {
    console.error('Error in createCapsule:', error);
    throw error;
  }
};
