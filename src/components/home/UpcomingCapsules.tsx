
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Capsule } from "@/services/capsuleService";
import { addDays, formatDistanceToNow } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Calendar, DollarSign } from "lucide-react";

interface UpcomingCapsulesProps {
  upcomingCapsules: Capsule[];
}

const UpcomingCapsules = ({ upcomingCapsules }: UpcomingCapsulesProps) => {
  const [displayCapsules, setDisplayCapsules] = useState<Capsule[]>(upcomingCapsules);
  const [timeRemaining, setTimeRemaining] = useState<{[key: string]: string}>({});
  
  // Create a demo capsule that opens tomorrow
  useEffect(() => {
    const tomorrow = addDays(new Date(), 1);
    const demoCapsule: Capsule = {
      id: "demo-capsule",
      name: "Demo Capsule (Opens Tomorrow)",
      message: "This is a demo capsule to show how it would appear",
      open_date: tomorrow.toISOString(),
      status: "closed",
      creator_id: "demo-user",
      creator: {
        id: "demo-user",
        username: "Demo User",
        avatar_url: null
      },
      initial_bid: 0.025,
      created_at: new Date().toISOString()
    };
    
    // Add the demo capsule to the display capsules
    if (upcomingCapsules.length === 0 || !upcomingCapsules.some(c => c.id === "demo-capsule")) {
      setDisplayCapsules([...upcomingCapsules, demoCapsule]);
    } else {
      setDisplayCapsules(upcomingCapsules);
    }
  }, [upcomingCapsules]);

  // Update countdown timer
  useEffect(() => {
    const updateTimers = () => {
      const newTimeRemaining: {[key: string]: string} = {};
      
      displayCapsules.forEach(capsule => {
        const openDate = new Date(capsule.open_date);
        const now = new Date();
        
        if (openDate > now) {
          const diff = openDate.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          newTimeRemaining[capsule.id] = `${hours}h ${minutes}m ${seconds}s`;
        } else {
          newTimeRemaining[capsule.id] = "Opened";
        }
      });
      
      setTimeRemaining(newTimeRemaining);
    };
    
    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    
    return () => clearInterval(interval);
  }, [displayCapsules]);

  return (
    <section className="py-24 bg-space-dark">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16 text-gradient">
          OPENING THIS WEEK
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayCapsules.length > 0 ? (
            displayCapsules.map((capsule) => (
              <Card 
                key={capsule.id}
                className="bg-[linear-gradient(145deg,_#0f0c29,_#302b63,_#24243e)] backdrop-blur-xl border-2 border-[#00ffe0]/20 hover:border-[#00ffe0]/90 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_15px_rgba(0,255,224,0.5)] overflow-hidden"
              >
                <CardHeader className="relative pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-[#00ffe0] font-['Syne',_sans-serif] text-xl">
                      🔮 {capsule.name}
                    </CardTitle>
                    <Avatar className="h-8 w-8 ring-2 ring-[#00ffe0]/30">
                      <AvatarImage src={capsule.creator?.avatar_url || undefined} />
                      <AvatarFallback className="bg-[#302b63] text-[#00ffe0]">
                        {capsule.creator?.username?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardDescription className="text-white/60 font-['Syne',_sans-serif]">
                    by @{capsule.creator?.username || "Anonymous"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-[#ff00ff] font-medium">
                      <Clock className="h-4 w-4" />
                      <span>⏳ Opens in: {timeRemaining[capsule.id] || "Loading..."}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-white/70">
                      <Calendar className="h-4 w-4" />
                      <span>🗓 Opens on: {new Date(capsule.open_date).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-[#00ffe0] font-medium mt-4">
                      <DollarSign className="h-4 w-4" />
                      <span>💰 Current bid: Ξ{capsule.current_bid || capsule.initial_bid || "No bids yet"}</span>
                    </div>
                    
                    <div className="w-full bg-space-dark/70 h-1 rounded-full overflow-hidden mt-4">
                      <div 
                        className="h-full bg-gradient-to-r from-[#00ffe0] to-[#ff00ff]"
                        style={{
                          width: (() => {
                            const now = new Date();
                            const created = new Date(capsule.created_at || Date.now());
                            const opens = new Date(capsule.open_date);
                            const total = opens.getTime() - created.getTime();
                            const elapsed = now.getTime() - created.getTime();
                            return `${Math.min(100, (elapsed / total) * 100)}%`;
                          })()
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center text-white/60 py-12 col-span-2">
              <p>No capsules opening this week.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UpcomingCapsules;
