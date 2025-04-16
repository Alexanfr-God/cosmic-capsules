
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { checkWalletConnection, switchToBscNetwork } from "@/utils/walletUtils";
import { sendPaymentTransaction } from "@/utils/transactionUtils";

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
      // Check if wallet is connected
      const walletConnected = await checkWalletConnection();
      if (!walletConnected) {
        setProcessingPayment(false);
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet to proceed with payment.",
          variant: "destructive",
        });
        return;
      }

      // Switch to correct network if needed (for BNB payments)
      if (paymentMethod === 0) {
        const networkSwitched = await switchToBscNetwork();
        if (!networkSwitched) {
          setProcessingPayment(false);
          toast({
            title: "Network Error",
            description: "Please switch to Binance Smart Chain to pay with BNB.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Send the transaction
      toast({
        title: "Payment Processing",
        description: `Please confirm the transaction in your wallet for ${amount} ${currency}.`,
      });
      
      const receipt = await sendPaymentTransaction(RECIPIENT_ADDRESS, amount);
      
      if (receipt) {
        console.log("Transaction successful, receipt:", receipt);
        toast({
          title: "Payment Successful",
          description: `Your payment of ${amount} ${currency} has been confirmed.`,
        });
        
        // Call the onClick callback with success and transaction hash
        onClick(true, receipt.transactionHash);
      } else {
        console.error("Transaction failed or was rejected");
        toast({
          title: "Payment Failed",
          description: "The transaction was not completed. Please try again.",
          variant: "destructive",
        });
        
        onClick(false);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "An error occurred during payment processing.",
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
