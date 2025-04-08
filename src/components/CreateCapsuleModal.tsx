
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

interface CreateCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCapsuleModal = ({ isOpen, onClose }: CreateCapsuleModalProps) => {
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

  // Ensure the storage bucket exists when the component mounts
  useEffect(() => {
    const initializeStorage = async () => {
      await ensureStorageBucketExists('capsule_images');
    };
    
    if (isOpen) {
      initializeStorage();
      
      // Also refresh user profile when modal opens
      if (user) {
        refreshUserProfile();
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
    if (!validateCapsuleData(userProfile, isConnected, capsuleName, selectedDate)) {
      return;
    }

    setIsLoading(true);
    await handlePaymentComplete(
      success, 
      capsuleName, 
      message, 
      selectedDate, 
      selectedImage, 
      auctionEnabled,
      () => {
        resetForm();
        onClose();
      },
      (errorMessage: string) => {
        setError(errorMessage);
      },
      txHash
    );
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
