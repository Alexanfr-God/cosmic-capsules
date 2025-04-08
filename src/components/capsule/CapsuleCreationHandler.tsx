
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAccount } from "wagmi";
import { createCapsule } from "@/services/capsuleService";
import { uploadFileToBucket } from "@/utils/storageUtils";

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
  const { userProfile } = useAuth();
  const { isConnected } = useAccount();

  const validateCapsuleData = (
    userProfile: any, 
    isConnected: boolean, 
    capsuleName: string, 
    selectedDate?: Date
  ) => {
    if (!userProfile) {
      const errMsg = "You must be logged in to create a time capsule";
      console.error(errMsg);
      toast({
        title: "Error",
        description: errMsg,
        variant: "destructive",
      });
      return false;
    }

    console.log("User profile:", userProfile);

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
    
    if (!userProfile || !userProfile.id) {
      console.error("User profile not available");
      throw new Error("User profile not available. Please log in again.");
    }
    
    console.log("Creating capsule with user ID:", userProfile.id);
    const capsuleData = {
      name: capsuleName,
      creator_id: userProfile.id,
      image_url: imageUrl,
      message: message,
      open_date: selectedDate?.toISOString(),
      unlock_date: selectedDate?.toISOString(),
      auction_enabled: auctionEnabled,
      status: 'closed' as 'closed',
      tx_hash: txHash
    };
    
    console.log("Capsule data before creation:", capsuleData);
    const createdCapsule = await createCapsule(capsuleData);
    console.log("Capsule created successfully:", createdCapsule);
    
    return createdCapsule;
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
