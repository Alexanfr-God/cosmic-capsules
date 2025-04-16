
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import CapsuleNameInput from "../capsule/CapsuleNameInput";
import CapsuleMessageInput from "../capsule/CapsuleMessageInput";
import CapsuleImageUpload from "../capsule/CapsuleImageUpload";
import CapsuleDatePicker from "../capsule/CapsuleDatePicker";
import CapsulePaymentMethod from "../capsule/CapsulePaymentMethod";
import CapsuleAuctionToggle from "../capsule/CapsuleAuctionToggle";
import { useCapsuleModal } from "./CapsuleModalContext";
import { useCapsuleModalImage } from "./CapsuleModalImageHandler";

export const CapsuleModalContent: React.FC = () => {
  const { 
    capsuleName, 
    setCapsuleName,
    message,
    setMessage,
    selectedDate,
    setSelectedDate,
    previewUrl,
    auctionEnabled,
    setAuctionEnabled,
    paymentMethod,
    setPaymentMethod,
    error
  } = useCapsuleModal();
  
  const { handleImageUpload, resetImage } = useCapsuleModalImage();

  return (
    <>
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
    </>
  );
};
