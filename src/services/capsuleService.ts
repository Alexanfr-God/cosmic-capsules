
import { supabase } from "@/integrations/supabase/client";

export type Capsule = {
  id: string;
  name: string;
  creator_id: string;
  image_url?: string | null;
  message?: string | null;
  open_date: string;
  auction_enabled: boolean;
  status: 'open' | 'closed';
  current_bid: number;
  initial_bid: number;
  highest_bidder_id?: string | null;
  created_at: string;
  updated_at: string;
  creator?: {
    username?: string;
  };
  unlock_date?: string;
  tx_hash?: string;
};

export type CapsuleBid = {
  id: string;
  capsule_id: string;
  bidder_id: string;
  bid_amount: number;
  created_at: string;
  bidder?: {
    username?: string;
  };
};

export type CapsuleCreate = {
  name: string;
  creator_id: string;
  image_url?: string | null;
  message?: string | null;
  open_date?: string;
  unlock_date?: string;
  auction_enabled: boolean;
  status?: 'open' | 'closed';
  current_bid?: number;
  highest_bidder_id?: string | null;
  tx_hash?: string;
};

export const createCapsule = async (capsuleData: CapsuleCreate) => {
  try {
    console.log("Creating capsule with data:", capsuleData);
    
    // Validate required fields
    if (!capsuleData.name) {
      throw new Error("Capsule name is required");
    }
    
    if (!capsuleData.creator_id) {
      throw new Error("Creator ID is required");
    }
    
    if (!capsuleData.open_date && !capsuleData.unlock_date) {
      throw new Error("Open date is required");
    }

    // Check if the user exists in profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', capsuleData.creator_id)
      .single();

    if (profileError) {
      console.error("Error checking user profile:", profileError);
      if (profileError.code === 'PGRST116') {
        // Profile not found, create a default one
        console.log("User profile not found, creating a default profile");
        
        const { data: newProfile, error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: capsuleData.creator_id,
            username: `user_${Date.now().toString().slice(-4)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (createProfileError) {
          console.error("Error creating default profile:", createProfileError);
          throw new Error("Could not create user profile. Please try logging in again.");
        }
        
        console.log("Default profile created:", newProfile);
      } else {
        throw profileError;
      }
    } else {
      console.log("User profile exists:", profileData);
    }
    
    // Insert the capsule data
    const { data, error } = await supabase
      .from('capsules')
      .insert({
        name: capsuleData.name,
        creator_id: capsuleData.creator_id,
        image_url: capsuleData.image_url,
        message: capsuleData.message,
        open_date: capsuleData.open_date || capsuleData.unlock_date,
        auction_enabled: capsuleData.auction_enabled,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: capsuleData.status || 'closed',
        current_bid: 0,
        initial_bid: 0.1,
        highest_bidder_id: null,
        tx_hash: capsuleData.tx_hash
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating capsule:", error);
      throw error;
    }

    console.log("Capsule created successfully:", data);
    return data;
  } catch (error: any) {
    console.error("Unexpected error in createCapsule:", error);
    throw error;
  }
};

export const placeBid = async (capsuleId: string, bidAmount: number) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to place a bid');
    }

    const { data: bidData, error: bidError } = await supabase
      .from('capsule_bids')
      .insert({
        capsule_id: capsuleId,
        bidder_id: user.id,
        bid_amount: bidAmount,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (bidError) {
      console.error("Error inserting bid:", bidError);
      throw bidError;
    }

    const { data: capsuleData, error: capsuleError } = await supabase
      .from('capsules')
      .update({ 
        current_bid: bidAmount, 
        highest_bidder_id: user.id 
      })
      .eq('id', capsuleId)
      .select()
      .single();

    if (capsuleError) {
      console.error("Error updating capsule bid:", capsuleError);
      throw capsuleError;
    }

    return { bid: bidData, capsule: capsuleData };
  } catch (error) {
    console.error("Unexpected error in placeBid:", error);
    throw error;
  }
};

export const getAllCapsules = async (): Promise<Capsule[]> => {
  try {
    const { data, error } = await supabase
      .from('capsules')
      .select(`
        *,
        creator:creator_id (
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching capsules:", error);
      throw error;
    }

    return (data || []).map(capsule => ({
      ...capsule,
      status: capsule.status as 'open' | 'closed'
    })) as Capsule[];
  } catch (error) {
    console.error("Unexpected error in getAllCapsules:", error);
    throw error;
  }
};

export const getUserCapsules = async (userId: string): Promise<Capsule[]> => {
  try {
    const { data, error } = await supabase
      .from('capsules')
      .select(`
        *,
        creator:creator_id (
          username
        )
      `)
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching user capsules:", error);
      throw error;
    }

    return (data || []).map(capsule => ({
      ...capsule,
      status: capsule.status as 'open' | 'closed'
    })) as Capsule[];
  } catch (error) {
    console.error("Unexpected error in getUserCapsules:", error);
    throw error;
  }
};

export const getCapsuleBids = async (capsuleId: string): Promise<CapsuleBid[]> => {
  try {
    const { data, error } = await supabase
      .from('capsule_bids')
      .select(`
        *,
        bidder:bidder_id (
          username
        )
      `)
      .eq('capsule_id', capsuleId)
      .order('bid_amount', { ascending: false });

    if (error) {
      console.error("Error fetching capsule bids:", error);
      throw error;
    }

    return (data || []).map(bid => ({
      ...bid,
      bidder: bid.bidder as CapsuleBid['bidder']
    })) as CapsuleBid[];
  } catch (error) {
    console.error("Unexpected error in getCapsuleBids:", error);
    throw error;
  }
};

export const acceptBid = async (capsuleId: string, bidId: string) => {
  try {
    const { data: capsuleData, error: capsuleError } = await supabase
      .from('capsules')
      .update({ 
        status: 'closed',
        open_date: new Date().toISOString()
      })
      .eq('id', capsuleId)
      .select()
      .single();

    if (capsuleError) {
      console.error("Error updating capsule status:", capsuleError);
      throw capsuleError;
    }

    return capsuleData;
  } catch (error) {
    console.error("Unexpected error in acceptBid:", error);
    throw error;
  }
};
