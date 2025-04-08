
import React from "react";
import { Clock, Calendar, DollarSign } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Capsule } from "@/services/capsuleService";

interface AuctionCardProps {
  capsule: Capsule;
  index: number;
  currentSlide: number;
}

const AuctionCard = ({ capsule, index, currentSlide }: AuctionCardProps) => {
  // Calculate time remaining
  const timeLeft = () => {
    const now = new Date();
    const openDate = new Date(capsule.open_date);
    const diffTime = Math.abs(openDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  return (
    <div
      className={`transition-all duration-500 transform ${
        Math.abs(index - currentSlide) <= 2
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 hidden lg:block"
      }`}
    >
      <Card className="bg-[linear-gradient(145deg,_#0f0c29,_#302b63,_#24243e)] backdrop-blur-xl border-2 border-[#00ffe0]/20 hover:border-[#00ffe0]/90 rounded-xl transition-all duration-300 h-full transform hover:scale-105 hover:translate-y-[-5px] hover:shadow-[0_0_15px_rgba(0,255,224,0.5)]">
        <CardHeader className="relative">
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
              <span>⏳ Time Left: {timeLeft()}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-white/70">
              <Calendar className="h-4 w-4" />
              <span>🗓 Opens on: {new Date(capsule.open_date).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-white/80">Current Bid:</span>
              <span className="text-[#00ffe0] font-bold animate-pulse">
                Ξ{capsule.current_bid || (capsule.initial_bid ?? 0.1)}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-gradient-to-r from-[#00ffe0] to-[#ff00ff] hover:opacity-90 transition-all transform hover:scale-105 text-black font-bold">
            PLACE BID
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuctionCard;
