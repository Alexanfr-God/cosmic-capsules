
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";

interface CreateCapsuleButtonProps {
  isLoading: boolean;
  onClick: (success: boolean, txHash?: string) => void;
  paymentAmount: string;
  paymentMethod: number; // 0 = BNB, 1 = ETH
}

// Recipient address for the payment
const RECIPIENT_ADDRESS = "0x0AbD5b7B6DE3ceA8702dAB2827D31CDA46c6e750";

const CreateCapsuleButton = ({ isLoading, onClick, paymentAmount, paymentMethod }: CreateCapsuleButtonProps) => {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const [processingPayment, setProcessingPayment] = useState(false);

  const handlePayment = async () => {
    if (isLoading || processingPayment) {
      console.log("Payment already in progress, ignoring click");
      return;
    }
    
    const currency = paymentMethod === 0 ? "BNB" : "ETH";
    const amount = paymentMethod === 0 ? "0.01" : "0.005";
    
    console.log(`Payment button clicked with method: ${currency}, amount: ${amount}`);
    setProcessingPayment(true);
    
    try {
      // Always simulate a successful payment (skip wallet interaction)
      console.log("Simulating successful payment transaction");
      
      // Wait a short time to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Payment Simulation",
        description: `Your payment of ${amount} ${currency} has been simulated successfully`,
      });
      
      // Simulate transaction hash
      const mockTxHash = "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      console.log("Mock transaction hash:", mockTxHash);
      
      // Call the onClick callback to continue with capsule creation
      // Set a short timeout to ensure UI updates before continuing
      setTimeout(() => {
        onClick(true, mockTxHash);
      }, 100);
    } catch (error: any) {
      console.error("Simulated error:", error);
      toast({
        title: "Simulation Error",
        description: "Simulated payment error",
        variant: "destructive",
      });
      onClick(false);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Combined loading state from props and local state
  const buttonIsLoading = isLoading || processingPayment;

  return (
    <Button
      className="w-full bg-gradient-to-r from-neon-blue to-neon-pink text-white hover:opacity-90 transition-opacity"
      onClick={handlePayment}
      disabled={buttonIsLoading}
      type="button"
    >
      {buttonIsLoading ? (
        <span className="flex items-center">
          <span className="animate-spin mr-2">⟳</span> PROCESSING PAYMENT...
        </span>
      ) : (
        <span className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" /> PAY {paymentAmount} AND CREATE CAPSULE
        </span>
      )}
    </Button>
  );
};

export default CreateCapsuleButton;
