
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createCapsule } from "@/services/capsuleService";
import { supabase } from "@/integrations/supabase/client";

export const useCapsuleWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [allowBidding, setAllowBidding] = useState(false);
  const [minimumBid, setMinimumBid] = useState("0.1");
  const [encryptionLevel, setEncryptionLevel] = useState<"standard" | "enhanced" | "quantum">("standard");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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

  const resetForm = () => {
    setEventName("");
    setMessage("");
    setSelectedDate(undefined);
    setSelectedImage(null);
    setPreviewUrl(null);
    setAllowBidding(false);
  };

  const handleCreateCapsule = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a time capsule",
        variant: "destructive",
      });
      return;
    }

    if (!eventName) {
      toast({
        title: "Error",
        description: "Please enter a name for your time capsule",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select an opening date for your time capsule",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      let imageUrl: string | null = null;
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('capsule_images')
          .upload(filePath, selectedImage);

        if (uploadError) {
          throw uploadError;
        }

        imageUrl = supabase.storage.from('capsule_images').getPublicUrl(filePath).data.publicUrl;
      }
      
      await createCapsule({
        name: eventName,
        creator_id: user.id,
        image_url: imageUrl,
        message: message,
        open_date: selectedDate.toISOString(),
        auction_enabled: allowBidding,
      });

      toast({
        title: "Success",
        description: "Your time capsule has been created successfully!",
      });

      resetForm();
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error creating capsule:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create time capsule",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOpen,
    setIsOpen,
    eventName,
    setEventName,
    message,
    setMessage,
    selectedDate,
    setSelectedDate,
    selectedImage,
    setSelectedImage,
    previewUrl,
    setPreviewUrl,
    allowBidding,
    setAllowBidding,
    minimumBid,
    setMinimumBid,
    encryptionLevel,
    setEncryptionLevel,
    isLoading,
    handleImageUpload,
    handleCreateCapsule
  };
};
