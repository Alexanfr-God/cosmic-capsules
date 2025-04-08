
import React from "react";
import { Circle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Capsule } from "@/services/capsuleService";

interface AuctionCardProps {
  capsule: Capsule;
  index: number;
  currentSlide: number;
}

const AuctionCard = ({ capsule, index, currentSlide }: AuctionCardProps) => {
  return (
    <div
      className={`transition-all duration-500 transform ${
        Math.abs(index - currentSlide) <= 2
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 hidden lg:block"
      }`}
    >
      <Card className="bg-space-dark/80 backdrop-blur-xl border border-neon-blue/20 hover:border-neon-blue/60 transition-all duration-300 h-full transform hover:scale-105 hover:translate-y-[-5px]">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="text-gradient">{capsule.name}</span>
            <Circle className="w-5 h-5 text-neon-blue animate-pulse" />
          </CardTitle>
          <CardDescription className="text-white/60">
            Opens: {new Date(capsule.open_date).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Current Bid:</span>
              <span className="text-neon-pink font-bold animate-pulse">
                {capsule.current_bid || (capsule.initial_bid ?? 0.1)} BNB
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Time Left:</span>
              <span className="text-neon-green">
                {(() => {
                  const now = new Date();
                  const openDate = new Date(capsule.open_date);
                  const diffTime = Math.abs(openDate.getTime() - now.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return `${diffDays} days`;
                })()}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-gradient-to-r from-neon-blue to-neon-pink hover:opacity-90 transition-all transform hover:scale-105">
            PLACE BID
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuctionCard;
