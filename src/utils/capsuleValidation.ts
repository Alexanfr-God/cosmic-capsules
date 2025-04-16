
// Remove the useToast import as it can't be used in a regular function
// import { useToast } from "@/hooks/use-toast";

export const validateCapsuleData = (
  userProfile: any, 
  isConnected: boolean, 
  capsuleName: string, 
  selectedDate?: Date
): boolean => {
  // Instead of using toast here, we'll just return validation results
  // and let the component handle displaying toasts

  if (!capsuleName) {
    console.error("Please enter a name for your time capsule");
    return false;
  }

  if (!selectedDate) {
    console.error("Please select an unlock date for your time capsule");
    return false;
  }

  return true;
};
