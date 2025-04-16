
import { useCapsuleModal } from "./CapsuleModalContext";

interface CapsuleModalImageHandlerProps {
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  resetImage: () => void;
}

export const useCapsuleModalImage = (): CapsuleModalImageHandlerProps => {
  const { setSelectedImage, setPreviewUrl } = useCapsuleModal();

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

  return { handleImageUpload, resetImage };
};
