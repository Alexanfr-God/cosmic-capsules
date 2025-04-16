
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  console.log("Payment completed with success:", success, "Transaction hash:", txHash);
  
  if (!success) {
    onError("Payment failed. Please try again.");
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
    
    toast({
      title: "Success",
      description: "Your time capsule has been created successfully.",
    });

    // Pass the new capsule to the success callback
    onSuccess(newCapsule);
  } catch (error: any) {
    console.error("Error creating capsule:", error);
    onError(error.message || "Capsule creation failed");
    toast({
      title: "Error",
      description: error.message || "Capsule creation failed",
      variant: "destructive",
    });
  }
};
