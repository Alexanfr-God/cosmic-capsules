
import { useState } from "react";
import { 
  Twitter, Instagram, Linkedin, MessageSquare, 
  ExternalLink, Edit, Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";
import { UserProfile } from "@/types/auth";
import { Card } from "@/components/ui/card";

interface UserSidebarProps {
  userProfile: UserProfile | null;
  isOwnProfile: boolean;
}

const UserSidebar = ({ userProfile, isOwnProfile }: UserSidebarProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const getAvatarText = () => {
    if (userProfile?.username) {
      return userProfile.username.slice(0, 2).toUpperCase();
    }
    return "UN";
  };

  return (
    <Card className="p-6 rounded-xl bg-space-dark/80 border border-neon-blue/20 backdrop-blur-md sticky top-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          {isOwnProfile ? (
            <ProfileImageUpload onImageUpdate={() => setIsEditing(!isEditing)} />
          ) : (
            <Avatar className="w-32 h-32 border-4 border-neon-blue/30">
              <AvatarImage src={userProfile?.avatar_url || ''} alt="Profile" />
              <AvatarFallback className="bg-space-light text-neon-blue text-2xl">
                {getAvatarText()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-bold">{userProfile?.username || "Anonymous User"}</h2>
          <p className="text-neon-blue/80 text-sm mt-1">
            {userProfile?.wallet_address ? 
              `${userProfile.wallet_address.slice(0, 6)}...${userProfile.wallet_address.slice(-4)}` : 
              "No wallet connected"}
          </p>
          <p className="text-white/70 text-sm mt-3">Crypto Enthusiast • Web3 Explorer</p>
          <p className="text-white/70 text-sm mt-1">Tokyo, Japan</p>
        </div>

        {isOwnProfile && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(true)}
            className="mt-4 border-neon-blue/30 hover:border-neon-blue text-neon-blue bg-transparent"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}

        <div className="flex justify-center space-x-3 mt-6 text-white/60">
          <a href="#" className="hover:text-neon-pink transition-colors">
            <Twitter size={20} />
          </a>
          <a href="#" className="hover:text-neon-pink transition-colors">
            <Instagram size={20} />
          </a>
          <a href="#" className="hover:text-neon-pink transition-colors">
            <Linkedin size={20} />
          </a>
          <a href="#" className="hover:text-neon-pink transition-colors">
            <ExternalLink size={20} />
          </a>
          <a href="#" className="hover:text-neon-pink transition-colors">
            <MessageSquare size={20} />
          </a>
        </div>

        <div className="w-full border-t border-white/10 pt-4 mt-4">
          <div className="flex justify-between text-sm text-white/60">
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" /> Followers
            </span>
            <span className="font-medium text-white">128</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserSidebar;
