
import { useToast } from "@/hooks/use-toast";

export const validateCapsuleData = (
  userProfile: any, 
  isConnected: boolean, 
  capsuleName: string, 
  selectedDate?: Date
): boolean => {
  const { toast } = useToast();

  if (!capsuleName) {
    const errMsg = "Please enter a name for your time capsule";
    console.error(errMsg);
    toast({
      title: "Error",
      description: errMsg,
      variant: "destructive",
    });
    return false;
  }

  if (!selectedDate) {
    const errMsg = "Please select an unlock date for your time capsule";
    console.error(errMsg);
    toast({
      title: "Error",
      description: errMsg,
      variant: "destructive",
    });
    return false;
  }

  return true;
};
