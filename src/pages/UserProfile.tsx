
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAccount } from "wagmi";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile as UserProfileType } from "@/types/auth";
import UserSidebar from "@/components/profile/UserSidebar";
import UserCapsulesList from "@/components/profile/UserCapsulesList";
import ProfileBanner from "@/components/profile/ProfileBanner";
import UserDMPanel from "@/components/profile/UserDMPanel";
import { WalletConnect } from "@/components/WalletConnect";

const UserProfile = () => {
  const { userId } = useParams();
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfileType | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  
  const isOwnProfile = (!userId && user) || userId === user?.id;
  const displayedProfile = isOwnProfile ? userProfile : profileData;
  const profileId = userId || user?.id;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!profileId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        if (isOwnProfile && userProfile) {
          setProfileData(userProfile);
        } else {
          // Fetch the specified user's profile
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', profileId)
            .single();
          
          if (error) {
            console.error('Error fetching profile:', error);
            toast({
              title: "Error",
              description: "Could not load user profile",
              variant: "destructive",
            });
          } else if (data) {
            setProfileData(data);
          }
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [profileId, isOwnProfile, userProfile, toast]);

  const handleBannerUpload = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload a banner",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      setBannerUrl(publicUrl);

      // Update profile with new banner URL
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ banner_url: publicUrl })
        .eq('id', user.id);

      if (profileUpdateError) throw profileUpdateError;

      toast({
        title: "Banner Updated",
        description: "Your profile banner has been successfully updated",
      });
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your banner",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-space-gradient text-white">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center text-neon-blue hover:text-neon-pink transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>BACK TO HOME</span>
          </Link>
          <div className="flex items-center gap-4">
            <WalletConnect />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <UserSidebar 
              userProfile={displayedProfile} 
              isOwnProfile={isOwnProfile} 
            />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-6">
            <ProfileBanner 
              bannerUrl={bannerUrl || displayedProfile?.banner_url} 
              isOwnProfile={isOwnProfile}
              onBannerChange={handleBannerUpload}
            />
            
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Time Capsules</h2>
              <UserCapsulesList 
                userId={profileId || ''} 
                isOwnProfile={isOwnProfile}
              />
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <UserDMPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
