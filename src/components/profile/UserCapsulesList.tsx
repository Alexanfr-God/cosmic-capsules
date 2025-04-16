
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Timer, DollarSign } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getUserCapsules, Capsule } from "@/services/capsuleService";

interface UserCapsulesListProps {
  userId: string;
  isOwnProfile: boolean;
  newCapsule?: Capsule | null;
}

const UserCapsulesList = ({ userId, isOwnProfile, newCapsule }: UserCapsulesListProps) => {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [justAddedCapsuleId, setJustAddedCapsuleId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCapsules = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        const fetchedCapsules = await getUserCapsules(userId);
        setCapsules(fetchedCapsules);
      } catch (error) {
        console.error("Error fetching capsules:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCapsules();
  }, [userId]);
  
  // Handle new capsule being added
  useEffect(() => {
    if (newCapsule && newCapsule.creator_id === userId) {
      // Check if the capsule is already in the list
      if (!capsules.some(c => c.id === newCapsule.id)) {
        setCapsules(prev => [newCapsule, ...prev]);
        setJustAddedCapsuleId(newCapsule.id);
        
        // Clear the highlight after animation completes
        setTimeout(() => {
          setJustAddedCapsuleId(null);
        }, 3000);
      }
    }
  }, [newCapsule, userId, capsules]);

  const getTimeRemaining = (openDate: string) => {
    const now = new Date();
    const target = new Date(openDate);
    const diff = target.getTime() - now.getTime();
    
    if (diff <= 0) {
      return "Now available";
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h remaining`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className="h-60 rounded-xl bg-space-light/20 animate-pulse border border-neon-blue/10"
          />
        ))}
      </div>
    );
  }

  if (capsules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl border border-dashed border-neon-blue/30 bg-space-dark/50">
        <Timer className="w-12 h-12 text-neon-blue/50 mb-4" />
        <h3 className="text-xl font-medium mb-2">No Capsules Yet</h3>
        <p className="text-white/60 max-w-md mb-6">
          {isOwnProfile ? 
            "Create your first time capsule to store memories or offer them for auction." : 
            "This user hasn't created any time capsules yet."}
        </p>
        {isOwnProfile && (
          <Link to="/">
            <Button className="bg-gradient-to-r from-neon-blue to-neon-pink hover:opacity-90 transition-opacity">
              Create Your First Capsule
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {capsules.map((capsule) => (
        <div
          key={capsule.id}
          className={`relative min-h-[280px] group perspective-1000 ${
            justAddedCapsuleId === capsule.id ? 'animate-scale-in' : ''
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-b from-neon-blue/10 to-transparent rounded-[20px] backdrop-blur-md border border-neon-blue/20 overflow-hidden transition-all duration-300 hover:border-neon-blue/40 ${
            justAddedCapsuleId === capsule.id ? 'border-neon-green shadow-lg shadow-neon-green/20' : ''
          }`}>
            <div className="absolute inset-0 bg-gradient-to-t from-neon-green/10 to-transparent opacity-50" />
            
            <div className="absolute inset-x-0 top-1/4 h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
            <div className="absolute inset-x-0 top-2/4 h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
            <div className="absolute inset-x-0 top-3/4 h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
          </div>

          <div className="relative h-full flex flex-col items-center justify-center gap-4 p-6">
            {!isOwnProfile && capsule.creator && (
              <div className="absolute top-3 right-3">
                <Avatar className="w-8 h-8 border border-neon-blue/30">
                  <AvatarImage src={capsule.creator.avatar_url || ''} />
                  <AvatarFallback className="bg-space-dark text-neon-blue text-xs">
                    {capsule.creator.username?.slice(0, 2).toUpperCase() || 'UN'}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            
            {justAddedCapsuleId === capsule.id && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-neon-green text-space-dark text-xs px-2 py-0.5 rounded-full animate-bounce">
                New!
              </div>
            )}
            
            <Timer className="w-10 h-10 text-neon-blue" />
            <div className="text-center z-10">
              <h3 className="text-xl font-bold mb-1">{capsule.name}</h3>
              <p className="text-neon-blue text-sm">
                {getTimeRemaining(capsule.open_date)}
              </p>
            </div>

            <div className="mt-2 px-4 py-1.5 bg-space-dark/50 rounded-full border border-neon-blue/30">
              <span className="text-neon-blue text-sm flex items-center">
                <DollarSign className="w-3.5 h-3.5 mr-1" />
                {capsule.current_bid ? `${capsule.current_bid} BNB` : 'No bids yet'}
              </span>
            </div>

            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <div className="px-3 py-1.5 bg-space-dark/50 rounded-full border border-neon-blue/30">
                <span className="text-neon-blue text-xs">#{capsule.id.toString().slice(-6)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserCapsulesList;
