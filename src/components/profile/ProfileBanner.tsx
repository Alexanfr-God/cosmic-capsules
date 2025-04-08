
import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';

interface ProfileBannerProps {
  bannerUrl?: string | null;
  isOwnProfile: boolean;
  onBannerChange?: (file: File) => Promise<void>;
}

const ProfileBanner = ({ bannerUrl, isOwnProfile, onBannerChange }: ProfileBannerProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultBannerUrl = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&h=400&q=80";
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onBannerChange) {
      await onBannerChange(file);
    }
  };

  return (
    <div 
      className="relative w-full h-48 md:h-64 lg:h-80 rounded-xl overflow-hidden mb-4"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ 
          backgroundImage: `url(${bannerUrl || defaultBannerUrl})`,
        }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-space-dark to-transparent opacity-50" />
      
      {/* Edit button for own profile */}
      {isOwnProfile && (
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-space-dark/70 backdrop-blur-sm p-4 rounded-full cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Camera className="w-6 h-6 text-white" />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>
      )}
    </div>
  );
};

export default ProfileBanner;
