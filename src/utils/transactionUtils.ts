
import { ethers } from "ethers";
import { toast } from "@/hooks/use-toast";

/**
 * Sends a payment transaction
 * @param recipientAddress Address to send the payment to
 * @param amount Amount to send in BNB or ETH
 * @returns Transaction receipt if successful, null otherwise
 */
export const sendPaymentTransaction = async (
  recipientAddress: string,
  amount: string
): Promise<ethers.providers.TransactionReceipt | null> => {
  try {
    // Make sure ethereum is available
    if (typeof window === "undefined" || typeof window.ethereum === "undefined") {
      throw new Error("Ethereum provider not found. Please install a wallet like MetaMask.");
    }

    // Get the provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    console.log("Sending payment from address:", userAddress);

    // Check network to determine currency
    const network = await provider.getNetwork();
    const currency = network.chainId === 56 || network.chainId === 97 ? "BNB" : "ETH";

    // Create transaction
    const tx = {
      to: recipientAddress,
      value: ethers.utils.parseEther(amount),
      gasLimit: ethers.utils.hexlify(100000), // Increased gas limit for transfers
    };

    console.log(`Preparing transaction of ${amount} ${currency}:`, tx);
    
    // Send transaction
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
      return receipt;
    } else {
      toast({
        title: "Payment Error",
        description: "Transaction was not successful",
        variant: "destructive",
      });
      return null;
    }
  } catch (error: any) {
    console.error("Transaction error:", error);
    
    // User rejected transaction
    if (error.code === 4001) {
      toast({
        title: "Transaction Cancelled",
        description: "You cancelled the transaction",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Transaction Error",
        description: error.message || "An error occurred processing the transaction",
        variant: "destructive",
      });
    }
    
    return null;
  }
};

/**
 * Handles the capsule creation transaction process
 * @param recipientAddress Address to send the payment to
 * @param amount Amount to send in BNB or ETH
 * @param onSuccess Callback function to execute on successful payment
 * @returns boolean indicating success or failure
 */
export const handleCapsuleCreationTransaction = async (
  recipientAddress: string,
  amount: string,
  onSuccess: (txHash: string) => void
): Promise<boolean> => {
  try {
    console.log("Starting capsule creation transaction process");
    // Send payment transaction
    const receipt = await sendPaymentTransaction(recipientAddress, amount);
    
    // If payment was successful, call the success callback with transaction hash
    if (receipt && receipt.transactionHash) {
      console.log("Payment successful, creating capsule...");
      onSuccess(receipt.transactionHash);
      return true;
    }
    
    console.log("Payment failed or was not confirmed");
    toast({
      title: "Payment Not Completed",
      description: "The payment transaction wasn't confirmed. Please try again.",
      variant: "destructive",
    });
    return false;
  } catch (error: any) {
    console.error("Capsule creation transaction error:", error);
    toast({
      title: "Capsule Creation Error",
      description: error.message || "An error occurred processing the capsule creation",
      variant: "destructive",
    });
    return false;
  }
};
