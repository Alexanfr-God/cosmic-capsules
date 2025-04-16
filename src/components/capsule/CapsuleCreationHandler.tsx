
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAccount } from "wagmi";
import { Capsule } from "@/services/capsuleService";
import { validateCapsuleData } from "@/utils/capsuleValidation";
import { handlePaymentComplete } from "@/services/capsulePaymentService";
import { ensureUserProfile } from "@/services/capsuleCreationService";

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
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { isConnected } = useAccount();

  const handlePaymentCompleteWrapper = async (
    success: boolean, 
    capsuleName: string,
    message: string,
    selectedDate: Date | undefined,
    selectedImage: File | null,
    auctionEnabled: boolean,
    onSuccess: (capsule?: Capsule) => void,
    onError: (error: string) => void,
    txHash?: string
  ) => {
    if (!user?.id) {
      onError("User not authenticated");
      return;
    }

    try {
      setIsLoading(true);
      
      // Ensure user has a profile
      await ensureUserProfile(user.id, user.email);
      await refreshUserProfile();
      
      // Process payment and create capsule
      await handlePaymentComplete({
        success,
        capsuleName,
        message,
        selectedDate,
        selectedImage,
        auctionEnabled,
        userId: user.id,
        onSuccess,
        onError,
        txHash
      });
    } catch (error: any) {
      console.error("Error in payment completion wrapper:", error);
      onError(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    setIsLoading,
    validateCapsuleData,
    handlePaymentComplete: handlePaymentCompleteWrapper,
    userProfile,
    isConnected
  };
};
