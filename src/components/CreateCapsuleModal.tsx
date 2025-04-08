
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { createCapsule } from "@/services/capsuleService";
import { useAccount } from "wagmi";

// Import sub-components
import CapsuleNameInput from "./capsule/CapsuleNameInput";
import CapsuleMessageInput from "./capsule/CapsuleMessageInput";
import CapsuleImageUpload from "./capsule/CapsuleImageUpload";
import CapsuleDatePicker from "./capsule/CapsuleDatePicker";
import CapsulePaymentMethod from "./capsule/CapsulePaymentMethod";
import CapsuleAuctionToggle from "./capsule/CapsuleAuctionToggle";
import CreateCapsuleButton from "./capsule/CreateCapsuleButton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface CreateCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCapsuleModal = ({ isOpen, onClose }: CreateCapsuleModalProps) => {
  const [capsuleName, setCapsuleName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [auctionEnabled, setAuctionEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(0); // 0 = BNB, 1 = ETH
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const { isConnected } = useAccount();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const resetForm = () => {
    setCapsuleName("");
    setMessage("");
    setSelectedDate(undefined);
    setSelectedImage(null);
    setPreviewUrl(null);
    setAuctionEnabled(false);
    setPaymentMethod(0);
    setError(null);
  };

  const getPaymentAmountDisplay = () => {
    return paymentMethod === 0 ? "0.01 BNB" : "0.005 ETH";
  };

  const validateCapsuleData = () => {
    if (!userProfile) {
      const errMsg = "You must be logged in to create a time capsule";
      console.error(errMsg);
      setError(errMsg);
      toast({
        title: "Error",
        description: errMsg,
        variant: "destructive",
      });
      return false;
    }

    console.log("User profile:", userProfile);

    if (!isConnected) {
      const errMsg = "Please connect your wallet to pay for the capsule creation";
      console.error(errMsg);
      setError(errMsg);
      toast({
        title: "Error",
        description: errMsg,
        variant: "destructive",
      });
      return false;
    }

    if (!capsuleName) {
      const errMsg = "Please enter a name for your time capsule";
      console.error(errMsg);
      setError(errMsg);
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
      setError(errMsg);
      toast({
        title: "Error",
        description: errMsg,
        variant: "destructive",
      });
      return false;
    }

    setError(null);
    return true;
  };

  const handlePaymentComplete = async (success: boolean, txHash?: string) => {
    console.log("Payment completed with success:", success, "Transaction hash:", txHash);
    
    if (!success) {
      setIsLoading(false);
      setError("Payment failed. Please try again.");
      return;
    }
    
    try {
      // Create the capsule in the database after successful payment
      await createCapsuleInDatabase(txHash);
      
      toast({
        title: "Success",
        description: "Your time capsule has been created successfully.",
      });

      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Error creating capsule:", error);
      setError(error.message || "Capsule creation failed");
      toast({
        title: "Error",
        description: error.message || "Capsule creation failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCapsuleInDatabase = async (txHash?: string) => {
    console.log("Creating capsule in database...");
    console.log("Selected image:", selectedImage);
    
    let imageUrl: string | null = null;
    if (selectedImage) {
      try {
        // Check if storage bucket exists
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          console.error("Error checking storage buckets:", bucketsError);
          throw bucketsError;
        }
        
        const capsuleImagesBucketExists = buckets.some(bucket => bucket.name === 'capsule_images');
        
        if (!capsuleImagesBucketExists) {
          console.error("Storage bucket 'capsule_images' does not exist");
          throw new Error("Storage bucket 'capsule_images' does not exist. Please create it in Supabase.");
        }
        
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        console.log("Uploading image to path:", filePath);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('capsule_images')
          .upload(filePath, selectedImage);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw uploadError;
        }

        console.log("Image upload successful:", uploadData);
        imageUrl = supabase.storage.from('capsule_images').getPublicUrl(filePath).data.publicUrl;
        console.log("Image URL:", imageUrl);
      } catch (error) {
        console.error("Image upload failed:", error);
        // Continue without image if upload fails
      }
    }
    
    if (!userProfile || !userProfile.id) {
      console.error("User profile not available");
      throw new Error("User profile not available. Please log in again.");
    }
    
    console.log("Creating capsule with user ID:", userProfile.id);
    const capsuleData = {
      name: capsuleName,
      creator_id: userProfile.id,
      image_url: imageUrl,
      message: message,
      open_date: selectedDate?.toISOString(),
      unlock_date: selectedDate?.toISOString(),
      auction_enabled: auctionEnabled,
      status: 'closed' as 'closed',
      tx_hash: txHash
    };
    
    console.log("Capsule data before creation:", capsuleData);
    const createdCapsule = await createCapsule(capsuleData);
    console.log("Capsule created successfully:", createdCapsule);
    
    return createdCapsule;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-space-dark/95 backdrop-blur-xl border border-neon-blue/20 rounded-xl w-full max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white">
            CREATE NEW TIME CAPSULE
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="bg-red-900/50 border-red-500 text-white">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 py-4">
          <CapsuleNameInput capsuleName={capsuleName} setCapsuleName={setCapsuleName} />
          <CapsuleMessageInput message={message} setMessage={setMessage} />
          <CapsuleImageUpload 
            previewUrl={previewUrl} 
            handleImageUpload={handleImageUpload} 
            resetImage={resetImage}
          />
          <CapsuleDatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

          <div className="space-y-4 pt-4 border-t border-neon-blue/20">
            <CapsulePaymentMethod paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
            <CapsuleAuctionToggle auctionEnabled={auctionEnabled} setAuctionEnabled={setAuctionEnabled} />
          </div>
        </div>

        <CreateCapsuleButton 
          isLoading={isLoading} 
          onClick={handlePaymentComplete} 
          paymentAmount={getPaymentAmountDisplay()}
          paymentMethod={paymentMethod}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateCapsuleModal;
