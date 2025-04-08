
import React, { useState, useEffect } from "react";
import { Clock, Calendar, DollarSign, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Capsule } from "@/services/capsuleService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PlaceBidModal from "../bidding/PlaceBidModal";

interface Bid {
  id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
  bidder?: {
    username?: string;
    avatar_url?: string;
  };
}

interface AuctionCardProps {
  capsule: Capsule;
  index: number;
  currentSlide: number;
  isCreator: boolean;
}

const AuctionCard = ({ capsule, index, currentSlide, isCreator }: AuctionCardProps) => {
  const [recentBids, setRecentBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Calculate time remaining
  const timeLeft = () => {
    const now = new Date();
    const openDate = new Date(capsule.open_date);
    const diffTime = Math.abs(openDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  const fetchRecentBids = async () => {
    try {
      // First, get the bids for this capsule
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select('id, bidder_id, amount, created_at')
        .eq('capsule_id', capsule.id)
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (bidsError) {
        console.error('Error fetching bids:', bidsError);
        return;
      }
      
      if (!bidsData || bidsData.length === 0) {
        setRecentBids([]);
        return;
      }
      
      // Then, fetch bidder profiles separately for each bid
      const bidsWithProfiles = await Promise.all(
        bidsData.map(async (bid) => {
          const { data: bidderData } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', bid.bidder_id)
            .single();
          
          return {
            ...bid,
            bidder: bidderData || { username: 'Anonymous', avatar_url: undefined }
          };
        })
      );
      
      setRecentBids(bidsWithProfiles);
    } catch (error) {
      console.error('Failed to fetch recent bids:', error);
    }
  };

  // Fetch recent bids
  useEffect(() => {
    fetchRecentBids();
  }, [capsule.id]);

  // Handle accepting bid
  const handleAcceptBid = async (bidId: string) => {
    if (!isCreator) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bids')
        .update({ is_accepted: true })
        .eq('id', bidId);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Bid accepted!",
        description: "The capsule will be unlocked for the winner.",
      });
      
      // Refresh bids list
      fetchRecentBids();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept bid",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
            {isCreator && (
              <span className="ml-2 bg-neon-pink/20 text-neon-pink text-xs px-2 py-0.5 rounded-full">
                Your capsule
              </span>
            )}
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
            
            {/* Recent bids section */}
            <div className="mt-4 border-t border-white/10 pt-3">
              <h4 className="text-white/80 text-sm mb-2">Last bids:</h4>
              {recentBids.length > 0 ? (
                <div className="space-y-2">
                  {recentBids.map((bid) => (
                    <div key={bid.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={bid.bidder?.avatar_url || undefined} />
                          <AvatarFallback className="bg-[#302b63] text-[#00ffe0] text-xs">
                            {bid.bidder?.username?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-white/70 text-xs">
                          @{bid.bidder?.username || "Anonymous"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-[#00ffe0] text-xs font-medium">
                          Ξ{bid.amount}
                        </span>
                        {isCreator && (
                          <Button 
                            size="sm" 
                            className="h-6 px-2 text-xs bg-neon-pink hover:bg-neon-pink/80"
                            onClick={() => handleAcceptBid(bid.id)}
                            disabled={loading}
                          >
                            <Check className="h-3 w-3 mr-1" /> Accept
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-xs text-center py-2">No bids yet</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-gradient-to-r from-[#00ffe0] to-[#ff00ff] hover:opacity-90 transition-all transform hover:scale-105 text-black font-bold"
            onClick={() => setIsBidModalOpen(true)}
            disabled={isCreator}
          >
            PLACE BID
          </Button>
        </CardFooter>
      </Card>

      {/* Bid Modal */}
      {isBidModalOpen && (
        <PlaceBidModal
          isOpen={isBidModalOpen}
          onClose={() => setIsBidModalOpen(false)}
          capsule={capsule}
          onBidPlaced={fetchRecentBids}
        />
      )}
    </div>
  );
};

export default AuctionCard;
