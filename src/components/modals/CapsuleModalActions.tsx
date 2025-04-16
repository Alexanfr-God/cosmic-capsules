import React, { useState } from "react";
import { useCapsuleModal } from "./CapsuleModalContext";
import CreateCapsuleButton from "../capsule/CreateCapsuleButton";
import { useCapsuleCreation } from "../capsule/CapsuleCreationHandler";
import { useAuth } from "@/contexts/AuthContext";
import { Capsule } from "@/services/capsuleService";
import { ensureStorageBucketExists } from "@/utils/storageUtils";
import { validateCapsuleData } from "@/utils/capsuleValidation";

interface CapsuleModalActionsProps {
  onCapsuleCreated?: (capsule: Capsule) => void;
  onClose: () => void;
}

export const CapsuleModalActions: React.FC<CapsuleModalActionsProps> = ({
  onCapsuleCreated,
  onClose
}) => {
  const { 
    capsuleName, 
    message, 
    selectedDate, 
    selectedImage, 
    auctionEnabled, 
    paymentMethod, 
    setError,
    resetForm
  } = useCapsuleModal();
  
  const { user, refreshUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { validateCapsuleData, handlePaymentComplete, userProfile, isConnected } = useCapsuleCreation();

  const getPaymentAmountDisplay = () => {
    return paymentMethod === 0 ? "0.01 BNB" : "0.005 ETH";
  };

  const onPaymentCompleteHandler = async (success: boolean, txHash?: string) => {
    console.log("Payment completed handler called with success:", success);
    
    if (!validateCapsuleData(userProfile, isConnected, capsuleName, selectedDate)) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await handlePaymentComplete(
        success, 
        capsuleName, 
        message, 
        selectedDate, 
        selectedImage, 
        auctionEnabled,
        (newCapsule) => {
          console.log("Capsule creation succeeded, resetting form and closing modal");
          resetForm();
          if (onCapsuleCreated && newCapsule) {
            onCapsuleCreated(newCapsule);
          }
          onClose();
        },
        (errorMessage: string) => {
          console.error("Capsule creation failed with error:", errorMessage);
          setError(errorMessage);
        },
        txHash
      );
    } catch (err: any) {
      console.error("Unexpected error in payment completion handler:", err);
      setError(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <CreateCapsuleButton 
      isLoading={isLoading} 
      onClick={onPaymentCompleteHandler} 
      paymentAmount={getPaymentAmountDisplay()}
      paymentMethod={paymentMethod}
    />
  );
};
