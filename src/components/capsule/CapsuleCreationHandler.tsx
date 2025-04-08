
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAccount } from "wagmi";
import { createCapsule } from "@/services/capsuleService";
import { uploadFileToBucket } from "@/utils/storageUtils";
import { createProfileIfNotExists } from "@/services/profileService";

interface CapsuleCreationHandlerProps {
  capsuleName: string;
  message: string;
  selectedDate: Date | undefined;
  selectedImage: File | null;
  auctionEnabled: boolean;
  paymentMethod: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const useCapsuleCreation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { isConnected } = useAccount();

  const validateCapsuleData = (
    userProfile: any, 
    isConnected: boolean, 
    capsuleName: string, 
    selectedDate?: Date
  ) => {
    if (!user) {
      const errMsg = "You must be logged in to create a time capsule";
      console.error(errMsg);
      toast({
        title: "Error",
        description: errMsg,
        variant: "destructive",
      });
      return false;
    }

    console.log("User:", user.id);
    console.log("User profile:", userProfile);

    // For development, we'll skip wallet connection check
    /* 
    if (!isConnected) {
      const errMsg = "Please connect your wallet to pay for the capsule creation";
      console.error(errMsg);
      toast({
        title: "Error",
        description: errMsg,
        variant: "destructive",
      });
      return false;
    }
    */

    if (!capsuleName) {
      const errMsg = "Please enter a name for your time capsule";
      console.error(errMsg);
      toast({
        title: "Error",
        description: errMsg,
        variant: "destructive",
      });
      return false;
    }

    if (!selectedDate) {
      const errMsg = "Please select an unlock date for your time capsule";
      console.error(errMsg);
      toast({
        title: "Error",
        description: errMsg,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const createCapsuleInDatabase = async (
    capsuleName: string,
    message: string,
    selectedDate: Date | undefined,
    selectedImage: File | null,
    auctionEnabled: boolean,
    txHash?: string
  ) => {
    console.log("Creating capsule in database...");
    
    if (!user?.id) {
      console.error("No user ID available");
      throw new Error("User not authenticated. Please log in again.");
    }
    
    // Ensure user has a profile
    if (!userProfile) {
      console.log("No user profile found, attempting to create one");
      await createProfileIfNotExists(user.id, user.email);
      await refreshUserProfile();
      
      if (!userProfile) {
        throw new Error("Could not create user profile. Please try again.");
      }
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
    
    console.log("Creating capsule with user ID:", user.id);
    const capsuleData = {
      name: capsuleName,
      creator_id: user.id,
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

  const handlePaymentComplete = async (
    success: boolean, 
    capsuleName: string,
    message: string,
    selectedDate: Date | undefined,
    selectedImage: File | null,
    auctionEnabled: boolean,
    onSuccess: () => void,
    onError: (error: string) => void,
    txHash?: string
  ) => {
    console.log("Payment completed with success:", success, "Transaction hash:", txHash);
    
    if (!success) {
      setIsLoading(false);
      onError("Payment failed. Please try again.");
      return;
    }
    
    try {
      // Create the capsule in the database after successful payment
      await createCapsuleInDatabase(
        capsuleName,
        message,
        selectedDate,
        selectedImage,
        auctionEnabled,
        txHash
      );
      
      toast({
        title: "Success",
        description: "Your time capsule has been created successfully.",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error creating capsule:", error);
      onError(error.message || "Capsule creation failed");
      toast({
        title: "Error",
        description: error.message || "Capsule creation failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    setIsLoading,
    validateCapsuleData,
    handlePaymentComplete,
    userProfile,
    isConnected
  };
};
