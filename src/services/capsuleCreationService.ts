
import { createCapsule, Capsule } from "@/services/capsuleService";
import { uploadFileToBucket } from "@/utils/storageUtils";
import { createProfileIfNotExists } from "@/services/profileService";
import { supabase } from "@/integrations/supabase/client";

export interface CapsuleCreationData {
  capsuleName: string;
  message: string;
  selectedDate: Date | undefined;
  selectedImage: File | null;
  auctionEnabled: boolean;
  userId: string;
  txHash?: string;
}

export const createCapsuleInDatabase = async ({
  capsuleName,
  message,
  selectedDate,
  selectedImage,
  auctionEnabled,
  userId,
  txHash
}: CapsuleCreationData): Promise<Capsule> => {
  console.log("Creating capsule in database...");
  
  if (!userId) {
    console.error("No user ID available");
    throw new Error("User not authenticated. Please log in again.");
  }
  
  console.log("Selected image:", selectedImage);
  
  let imageUrl: string | null = null;
  if (selectedImage) {
    try {
      const bucketName = "capsule_images";
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      console.log("Uploading image to path:", filePath);
      imageUrl = await uploadFileToBucket(bucketName, filePath, selectedImage);
      
      if (!imageUrl) {
        console.error("Failed to get image URL after upload");
      } else {
        console.log("Image URL:", imageUrl);
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      // Continue without image if upload fails
    }
  }
  
  console.log("Creating capsule with user ID:", userId);
  const capsuleData = {
    name: capsuleName,
    creator_id: userId,
    image_url: imageUrl,
    message: message,
    open_date: selectedDate?.toISOString(),
    unlock_date: selectedDate?.toISOString(),
    auction_enabled: auctionEnabled,
    status: 'closed' as 'closed',
    tx_hash: txHash
  };
  
  console.log("Capsule data before creation:", capsuleData);
  
  try {
    const createdCapsule = await createCapsule(capsuleData);
    console.log("Capsule created successfully:", createdCapsule);
    return createdCapsule;
  } catch (error) {
    console.error("Error creating capsule:", error);
    throw error;
  }
};

export const ensureUserProfile = async (userId: string, email?: string | null): Promise<void> => {
  try {
    await createProfileIfNotExists(userId, email);
  } catch (error) {
    console.error("Error ensuring user profile exists:", error);
    
    // Create a default profile if needed
    const { data: profile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (checkError || !profile) {
      console.log("Creating default profile for user:", userId);
      
      const { error: insertError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username: `user_${Date.now().toString().slice(-4)}`,
          full_name: email?.split('@')[0] || 'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error("Error creating default profile:", insertError);
      }
    }
  }
};
