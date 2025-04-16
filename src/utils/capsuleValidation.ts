
// Remove the useToast import as it can't be used in a regular function
// import { useToast } from "@/hooks/use-toast";

export const validateCapsuleData = (
  userProfile: any, 
  isConnected: boolean, 
  capsuleName: string, 
  selectedDate?: Date
): boolean => {
  // Validate required fields
  if (!capsuleName) {
    console.error("Please enter a name for your time capsule");
    return false;
  }

  if (!selectedDate) {
    console.error("Please select an unlock date for your time capsule");
    return false;
  }

  // Validate date is in the future
  if (selectedDate < new Date()) {
    console.error("Unlock date must be in the future");
    return false;
  }

  // Check if wallet is connected when needed for payment
  if (!isConnected) {
    console.error("Wallet must be connected to create a capsule");
    return false;
  }

  // Make sure user has a profile
  if (!userProfile) {
    console.error("User profile not found");
    return false;
  }

  return true;
};
