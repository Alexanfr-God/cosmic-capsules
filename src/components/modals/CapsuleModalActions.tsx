
import React, { useState } from "react";
import { useCapsuleModal } from "./CapsuleModalContext";
import CreateCapsuleButton from "../capsule/CreateCapsuleButton";
import { useCapsuleCreation } from "../capsule/CapsuleCreationHandler";
import { useAuth } from "@/contexts/AuthContext";

interface CapsuleModalActionsProps {
  onCapsuleCreated?: (capsule: any) => void;
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
  
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { validateCapsuleData, handlePaymentComplete, userProfile, isConnected } = useCapsuleCreation();

  const getPaymentAmountDisplay = () => {
    return paymentMethod === 0 ? "0.01 BNB" : "0.005 ETH";
  };

  const onPaymentCompleteHandler = async (success: boolean, txHash?: string) => {
    console.log("Payment completed handler called with success:", success, "Transaction hash:", txHash);
    
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
    } finally {
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
