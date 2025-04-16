
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Import sub-components
import CapsuleNameInput from "./capsule/CapsuleNameInput";
import CapsuleMessageInput from "./capsule/CapsuleMessageInput";
import CapsuleImageUpload from "./capsule/CapsuleImageUpload";
import CapsuleDatePicker from "./capsule/CapsuleDatePicker";
import CapsulePaymentMethod from "./capsule/CapsulePaymentMethod";
import CapsuleAuctionToggle from "./capsule/CapsuleAuctionToggle";
import CreateCapsuleButton from "./capsule/CreateCapsuleButton";
import { useCapsuleCreation } from "./capsule/CapsuleCreationHandler";
import { ensureStorageBucketExists } from "@/utils/storageUtils";
import { supabase } from "@/integrations/supabase/client";

interface CreateCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapsuleCreated?: (capsule: any) => void; // New callback prop for when capsule is created
}

const CreateCapsuleModal = ({ isOpen, onClose, onCapsuleCreated }: CreateCapsuleModalProps) => {
  const { user, refreshUserProfile } = useAuth();
  const [capsuleName, setCapsuleName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [auctionEnabled, setAuctionEnabled] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(0); // 0 = BNB, 1 = ETH
  const [error, setError] = useState<string | null>(null);
  
  const {
    isLoading,
    setIsLoading,
    validateCapsuleData,
    handlePaymentComplete,
    userProfile,
    isConnected
  } = useCapsuleCreation();

  // Initialize storage and refresh user profile when the modal opens
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        await ensureStorageBucketExists('capsule_images');
        console.log("Storage bucket initialized");
      } catch (error) {
        console.error("Error initializing storage bucket:", error);
      }
    };
    
    if (isOpen) {
      console.log("Modal opened, initializing...");
      initializeStorage();
      
      // Refresh user profile when modal opens
      if (user) {
        console.log("Refreshing user profile...");
        refreshUserProfile().catch(err => {
          console.error("Error refreshing user profile:", err);
        });

        // Ensure user profile exists
        const checkProfile = async () => {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            
            if (error || !data) {
              console.log("Profile not found, creating default profile");
              const { error: insertError } = await supabase
                .from('profiles')
                .upsert({
                  id: user.id,
                  username: `user_${Date.now().toString().slice(-4)}`,
                  full_name: user.email?.split('@')[0] || 'User',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              
              if (insertError) {
                console.error("Error creating profile:", insertError);
              } else {
                console.log("Default profile created");
                refreshUserProfile();
              }
            } else {
              console.log("User profile exists:", data);
            }
          } catch (err) {
            console.error("Error checking profile:", err);
          }
        };
        
        checkProfile();
      }
    }
  }, [isOpen, user, refreshUserProfile]);

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

  const onPaymentCompleteHandler = async (success: boolean, txHash?: string) => {
    console.log("Payment completed handler called with success:", success);
    
    if (!validateCapsuleData(userProfile, isConnected, capsuleName, selectedDate)) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Updated to receive the newly created capsule
      await handlePaymentComplete(
        success, 
        capsuleName, 
        message, 
        selectedDate, 
        selectedImage, 
        auctionEnabled,
        (newCapsule) => {
          console.log("Capsule creation succeeded, resetting form and closing modal");
          resetForm();
          // Call onCapsuleCreated with the new capsule if provided
          if (onCapsuleCreated && newCapsule) {
            onCapsuleCreated(newCapsule);
          }
          onClose();
        },
        (errorMessage: string) => {
          console.error("Capsule creation failed with error:", errorMessage);
          setError(errorMessage);
        },
        txHash
      );
    } catch (err: any) {
      console.error("Unexpected error in payment completion handler:", err);
      setError(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
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
          onClick={onPaymentCompleteHandler} 
          paymentAmount={getPaymentAmountDisplay()}
          paymentMethod={paymentMethod}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateCapsuleModal;
