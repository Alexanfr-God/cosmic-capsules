
import React, { createContext, useContext, useState } from "react";
import { Capsule } from "@/services/capsuleService";

interface CapsuleModalContextProps {
  capsuleName: string;
  setCapsuleName: (name: string) => void;
  message: string;
  setMessage: (message: string) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedImage: File | null;
  setSelectedImage: (image: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  auctionEnabled: boolean;
  setAuctionEnabled: (enabled: boolean) => void;
  paymentMethod: number;
  setPaymentMethod: (method: number) => void;
  error: string | null;
  setError: (error: string | null) => void;
  resetForm: () => void;
}

const CapsuleModalContext = createContext<CapsuleModalContextProps | undefined>(undefined);

export const useCapsuleModal = () => {
  const context = useContext(CapsuleModalContext);
  if (!context) {
    throw new Error("useCapsuleModal must be used within a CapsuleModalProvider");
  }
  return context;
};

interface CapsuleModalProviderProps {
  children: React.ReactNode;
  onCapsuleCreated?: (capsule: Capsule) => void;
  onClose: () => void;
}

export const CapsuleModalProvider: React.FC<CapsuleModalProviderProps> = ({ 
  children,
  onCapsuleCreated,
  onClose
}) => {
  const [capsuleName, setCapsuleName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [auctionEnabled, setAuctionEnabled] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(0); // 0 = BNB, 1 = ETH
  const [error, setError] = useState<string | null>(null);

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

  const value = {
    capsuleName,
    setCapsuleName,
    message,
    setMessage,
    selectedDate,
    setSelectedDate,
    selectedImage,
    setSelectedImage,
    previewUrl,
    setPreviewUrl,
    auctionEnabled,
    setAuctionEnabled,
    paymentMethod,
    setPaymentMethod,
    error,
    setError,
    resetForm
  };

  return (
    <CapsuleModalContext.Provider value={value}>
      {children}
    </CapsuleModalContext.Provider>
  );
};
