
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';
import { toast as toastFunction } from '@/hooks/use-toast';

// Fetch user profile
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId) {
    console.error('fetchUserProfile called with empty userId');
    return null;
  }
  
  try {
    console.log(`Fetching user profile for ID: ${userId}`);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
    
    console.log('Profile fetch result:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Upload avatar
export const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
  try {
    if (!file) {
      toastFunction({
        title: "No file selected",
        description: "Please choose an image to upload",
        variant: "destructive"
      });
      return null;
    }

    if (!userId) {
      toastFunction({
        title: "Authentication Error",
        description: "You must be logged in to upload an avatar",
        variant: "destructive"
      });
      return null;
    }

    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    // Update profile with new avatar URL
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (profileUpdateError) throw profileUpdateError;

    toastFunction({
      title: "Avatar Updated",
      description: "Your profile picture has been successfully updated"
    });

    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    toastFunction({
      title: "Upload Failed",
      description: "There was an error uploading your avatar",
      variant: "destructive"
    });
    return null;
  }
};

// Update wallet address
export const updateWalletAddress = async (userId: string, address: string): Promise<void> => {
  try {
    if (!userId || !address) {
      console.error('Missing userId or address in updateWalletAddress');
      return;
    }

    console.log(`Updating wallet address for user ${userId} to ${address}`);
    
    const { error } = await supabase
      .from('profiles')
      .update({ wallet_address: address })
      .eq('id', userId);
    
    if (error) throw error;
    
    console.log('Wallet address updated successfully');
  } catch (error) {
    console.error('Error updating wallet address:', error);
    throw error;
  }
};

// Create profile if it doesn't exist
export const createProfileIfNotExists = async (userId: string, email?: string): Promise<UserProfile | null> => {
  try {
    // First check if profile exists
    const existingProfile = await fetchUserProfile(userId);
    if (existingProfile) return existingProfile;
    
    // Create new profile if it doesn't exist
    const username = email ? email.split('@')[0] : `user_${Date.now().toString().slice(-4)}`;
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error('Error in createProfileIfNotExists:', error);
    return null;
  }
};
