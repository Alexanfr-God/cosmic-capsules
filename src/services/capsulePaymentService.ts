
import { createCapsuleInDatabase, CapsuleCreationData } from "./capsuleCreationService";

export interface PaymentCompletionParams {
  success: boolean;
  capsuleName: string;
  message: string;
  selectedDate: Date | undefined;
  selectedImage: File | null;
  auctionEnabled: boolean;
  userId: string;
  onSuccess: (capsule?: any) => void;
  onError: (error: string) => void;
  txHash?: string;
}

export const handlePaymentComplete = async ({
  success,
  capsuleName,
  message,
  selectedDate,
  selectedImage,
  auctionEnabled,
  userId,
  onSuccess,
  onError,
  txHash
}: PaymentCompletionParams): Promise<void> => {
  console.log("Payment completed with success:", success, "Transaction hash:", txHash);
  
  if (!success) {
    onError("Payment failed. Please try again.");
    return;
  }
  
  // Validate that we have a transaction hash for successful payments
  if (!txHash) {
    console.error("Missing transaction hash for successful payment");
    onError("Payment verification failed. Missing transaction details.");
    return;
  }
  
  try {
    // Create the capsule in the database after successful payment
    const newCapsule = await createCapsuleInDatabase({
      capsuleName,
      message,
      selectedDate,
      selectedImage,
      auctionEnabled,
      userId,
      txHash
    });
    
    console.log("Capsule created successfully in database:", newCapsule);

    // Pass the new capsule to the success callback
    onSuccess(newCapsule);
  } catch (error: any) {
    console.error("Error creating capsule:", error);
    onError(error.message || "Capsule creation failed");
  }
};
