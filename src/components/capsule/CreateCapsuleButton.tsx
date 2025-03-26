
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { checkWalletConnection, switchToBscNetwork, openWalletModal } from "@/utils/walletUtils";
import { handleCapsuleCreationTransaction } from "@/utils/transactionUtils";
import { ethers } from "ethers";

interface CreateCapsuleButtonProps {
  isLoading: boolean;
  onClick: () => void;
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
    console.log("Payment button clicked with method:", paymentMethod === 0 ? "BNB" : "ETH");
    setProcessingPayment(true);
    
    try {
      // Check if wallet is connected
      if (!isConnected || !address) {
        console.log("Wallet not connected");
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet to proceed with payment",
          variant: "destructive",
        });
        
        // Trigger wallet connection via Web3Modal
        openWalletModal();
        setProcessingPayment(false);
        return;
      }

      // Make sure ethereum provider exists in window
      if (typeof window === 'undefined' || !window.ethereum) {
        console.log("Ethereum provider not found");
        toast({
          title: "Wallet Error",
          description: "No Ethereum provider found. Please install MetaMask or another compatible wallet",
          variant: "destructive",
        });
        setProcessingPayment(false);
        return;
      }

      // Check if wallet is installed and request access
      const isWalletReady = await checkWalletConnection();
      if (!isWalletReady) {
        setProcessingPayment(false);
        return;
      }
      
      // Determine payment amount based on selected method
      const amount = paymentMethod === 0 ? "0.01" : "0.005";
      const currency = paymentMethod === 0 ? "BNB" : "ETH";
      
      // For BNB, we need to switch to BSC network
      if (paymentMethod === 0) {
        // Check and switch to BSC network if needed
        const isNetworkReady = await switchToBscNetwork();
        if (!isNetworkReady) {
          setProcessingPayment(false);
          return;
        }
      }

      console.log(`Proceeding with ${currency} transaction (${amount} ${currency}) to address:`, RECIPIENT_ADDRESS);
      
      try {
        // Get the provider and signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        // Create transaction
        const tx = {
          to: RECIPIENT_ADDRESS,
          value: ethers.utils.parseEther(amount),
          gasLimit: ethers.utils.hexlify(100000), // Increased gas limit for transfers
        };
        
        console.log("Sending transaction:", tx);
        
        // Send transaction directly
        const transaction = await signer.sendTransaction(tx);
        console.log("Transaction sent:", transaction.hash);
        
        toast({
          title: "Transaction Sent",
          description: `Your payment of ${amount} ${currency} is being processed...`,
        });
        
        // Wait for confirmation
        const receipt = await transaction.wait();
        console.log("Transaction confirmed:", receipt);
        
        if (receipt.status === 1) {
          toast({
            title: "Payment Successful",
            description: `Your payment of ${amount} ${currency} has been processed`,
          });
          
          // Call the onClick callback to continue with capsule creation
          onClick();
          return true;
        } else {
          throw new Error(`Transaction was not successful. Status: ${receipt.status}`);
        }
      } catch (txError: any) {
        console.error("Transaction execution error:", txError);
        throw new Error(txError.message || "Failed to execute transaction");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "An error occurred processing the payment",
        variant: "destructive",
      });
      return false;
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
