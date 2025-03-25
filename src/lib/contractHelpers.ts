
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import { toast } from 'sonner';
import { Buffer } from 'buffer';

// IPFS configuration
// Using Infura IPFS public gateway
const projectId = 'your-infura-project-id'; // Replace with actual project ID if needed
const projectSecret = 'your-infura-project-secret'; // Replace with actual secret if needed
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth
  }
});

// Contract information
const CONTRACT_ADDRESS = "0x123456789abcdef..."; // Replace with your actual contract address
const CONTRACT_ABI = [
  // ... Include the ABI for your smart contract here
  "function createCapsule(string memory _name, string memory _ipfsHash, uint256 _unlockTime) public payable",
  "function placeBid(uint256 capsuleId) public payable",
  "function acceptBid(uint256 capsuleId) external",
  "function isCapsuleOpen(uint256 capsuleId) public view returns (bool)",
  "function getCapsuleContent(uint256 capsuleId) public view returns (string memory)"
];

// Helper function to get contract instance
const getContract = async () => {
  try {
    // Check if window.ethereum is available
    if (typeof window !== 'undefined' && !window.ethereum) {
      throw new Error("Ethereum provider not found. Please install a wallet like MetaMask.");
    }

    // Connect to the provider
    if (typeof window !== 'undefined' && window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Create contract instance
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
    
    return null;
  } catch (error) {
    console.error("Error getting contract:", error);
    toast.error("Failed to connect to blockchain. Please check your wallet connection.");
    return null;
  }
};

// Upload content to IPFS
export const uploadToIPFS = async (content: string | File): Promise<string> => {
  try {
    let result;

    if (typeof content === 'string') {
      // Upload text content
      result = await ipfs.add(content);
    } else {
      // Upload file content
      const fileData = await content.arrayBuffer();
      result = await ipfs.add(new Uint8Array(fileData));
    }

    // Return the IPFS hash (CID)
    console.log("Uploaded to IPFS, hash:", result.path);
    return result.path;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    toast.error("Failed to upload content to IPFS. Please try again.");
    throw error;
  }
};

// Create a new capsule with payment
export const createCapsuleWithPayment = async (
  name: string,
  content: string | File,
  unlockTime: number
): Promise<boolean> => {
  try {
    // Upload content to IPFS first
    const ipfsHash = await uploadToIPFS(content);
    
    // Get contract instance
    const contract = await getContract();
    if (!contract) return false;

    // Create transaction with payment (0.01 BNB)
    const tx = await contract.createCapsule(
      name,
      ipfsHash,
      unlockTime,
      { value: ethers.utils.parseEther("0.01") }
    );

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    console.log("Capsule created successfully:", receipt);
    toast.success("Time capsule created successfully!");
    return true;
  } catch (error) {
    console.error("Error creating capsule:", error);
    toast.error("Failed to create time capsule. Please try again.");
    return false;
  }
};

// Place a bid on a capsule
export const placeBidOnChain = async (capsuleId: string, bidAmount: number): Promise<boolean> => {
  try {
    // Get contract instance
    const contract = await getContract();
    if (!contract) return false;

    // Convert bid amount to wei (BNB)
    const bidAmountWei = ethers.utils.parseEther(bidAmount.toString());

    // Place bid
    const tx = await contract.placeBid(capsuleId, { value: bidAmountWei });
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    console.log("Bid placed successfully:", receipt);
    toast.success("Bid placed successfully!");
    return true;
  } catch (error) {
    console.error("Error placing bid:", error);
    toast.error("Failed to place bid. Please try again.");
    return false;
  }
};

// Accept a bid
export const acceptBidOnChain = async (capsuleId: string): Promise<boolean> => {
  try {
    // Get contract instance
    const contract = await getContract();
    if (!contract) return false;

    // Accept bid
    const tx = await contract.acceptBid(capsuleId);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    console.log("Bid accepted successfully:", receipt);
    toast.success("Bid accepted! Capsule is now open to everyone.");
    return true;
  } catch (error) {
    console.error("Error accepting bid:", error);
    toast.error("Failed to accept bid. Please try again.");
    return false;
  }
};

// Check if a capsule is open
export const isCapsuleOpenOnChain = async (capsuleId: string): Promise<boolean> => {
  try {
    // Get contract instance
    const contract = await getContract();
    if (!contract) return false;

    // Check if capsule is open
    const isOpen = await contract.isCapsuleOpen(capsuleId);
    return isOpen;
  } catch (error) {
    console.error("Error checking if capsule is open:", error);
    return false;
  }
};

// Get capsule content from chain
export const getCapsuleContentFromChain = async (capsuleId: string): Promise<string> => {
  try {
    // Get contract instance
    const contract = await getContract();
    if (!contract) return "";

    // Get capsule content (IPFS hash)
    const content = await contract.getCapsuleContent(capsuleId);
    return content;
  } catch (error) {
    console.error("Error getting capsule content:", error);
    return "";
  }
};
