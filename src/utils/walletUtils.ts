
import { ethers } from "ethers";
import { toast } from "@/hooks/use-toast";

/**
 * Checks if wallet is installed and connected
 */
export const checkWalletConnection = async (): Promise<boolean> => {
  try {
    // Check if MetaMask or other wallet is installed
    if (typeof window === "undefined" || typeof window.ethereum === "undefined") {
      console.log("Wallet not detected");
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or another compatible wallet",
        variant: "destructive",
      });
      return false;
    }

    // Check if already connected
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    
    if (accounts && accounts.length > 0) {
      console.log("Wallet already connected with accounts:", accounts);
      return true;
    }
    
    // Request account access - this will prompt the wallet UI if not already connected
    console.log("Requesting account access");
    const requestedAccounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    
    if (requestedAccounts && requestedAccounts.length > 0) {
      console.log("Account access granted:", requestedAccounts);
      return true;
    } else {
      console.log("No accounts available after connection request");
      toast({
        title: "Wallet Connection Error",
        description: "No accounts available. Please unlock your wallet and try again.",
        variant: "destructive",
      });
      return false;
    }
  } catch (error: any) {
    // Handle user rejection of connection request
    if (error.code === 4001) {
      console.log("User rejected wallet connection request");
      toast({
        title: "Connection Cancelled",
        description: "You cancelled the wallet connection request",
        variant: "default",
      });
    } else {
      console.error("Error connecting to wallet:", error);
      toast({
        title: "Wallet Connection Error",
        description: error.message || "Failed to connect to your wallet",
        variant: "destructive",
      });
    }
    return false;
  }
};

/**
 * Switches to BSC network or adds it if not present
 */
export const switchToBscNetwork = async (): Promise<boolean> => {
  try {
    console.log("Checking network...");
    
    // Check if ethereum is available
    if (typeof window === "undefined" || typeof window.ethereum === "undefined") {
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or another compatible wallet",
        variant: "destructive",
      });
      return false;
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    console.log("Current network:", network);
    
    // Already on BSC network
    if (network.chainId === 56 || network.chainId === 97) {
      console.log("Already on BSC network");
      return true;
    }
    
    console.log("User not on BSC network. Attempting to switch...");
    // Try to switch to BSC network
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }], // 0x38 is 56 in hex (BSC Mainnet)
      });
      console.log("Successfully switched to BSC network");
      return true;
    } catch (switchError: any) {
      console.log("Error while switching networks:", switchError);
      // If BSC network isn't added to MetaMask, prompt user to add it
      if (switchError.code === 4902) {
        console.log("BSC network not found in wallet, trying to add it");
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x38',
                chainName: 'Binance Smart Chain',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18,
                },
                rpcUrls: ['https://bsc-dataseed.binance.org/'],
                blockExplorerUrls: ['https://bscscan.com/'],
              },
            ],
          });
          console.log("Successfully added BSC network");
          return true;
        } catch (addError: any) {
          console.error("Error adding BSC network:", addError);
          toast({
            title: "Network Error",
            description: "Failed to add BSC network to your wallet",
            variant: "destructive",
          });
          return false;
        }
      } else {
        console.error("Error switching to BSC network:", switchError);
        toast({
          title: "Network Error",
          description: "Please switch to Binance Smart Chain network manually",
          variant: "destructive",
        });
        return false;
      }
    }
  } catch (error: any) {
    console.error("Error checking/switching network:", error);
    toast({
      title: "Network Error",
      description: error.message || "Failed to check or switch network",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Opens wallet connection modal
 */
export const openWalletModal = () => {
  try {
    // Dispatch event to open Web3Modal
    const w3mEvent = new Event('w3m-open-modal');
    document.dispatchEvent(w3mEvent);
    console.log("Wallet connection modal opened");
  } catch (error) {
    console.error("Error opening wallet modal:", error);
  }
};
