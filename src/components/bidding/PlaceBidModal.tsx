
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Capsule } from "@/services/capsuleService";

interface PlaceBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  capsule: Capsule;
  onBidPlaced?: () => void;
}

const PlaceBidModal = ({ isOpen, onClose, capsule, onBidPlaced }: PlaceBidModalProps) => {
  const [bidAmount, setBidAmount] = useState<string>((capsule.current_bid || capsule.initial_bid || 0.1) + 0.01 + "");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleBidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and one decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    const formatted = parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, 4) : '');
    setBidAmount(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to place a bid",
        variant: "destructive",
      });
      return;
    }

    // Validate bid amount
    const bidValue = parseFloat(bidAmount);
    const currentBid = capsule.current_bid || capsule.initial_bid || 0.1;
    
    if (isNaN(bidValue) || bidValue <= currentBid) {
      toast({
        title: "Invalid Bid",
        description: `Your bid must be higher than the current bid (Ξ${currentBid})`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create the bid in the database
      const { data: bidData, error: bidError } = await supabase
        .from('bids')
        .insert({
          capsule_id: capsule.id,
          bidder_id: user.id,
          amount: bidValue,
        })
        .select()
        .single();
      
      if (bidError) throw bidError;

      // Update the capsule's current_bid and highest_bidder_id
      const { error: updateError } = await supabase
        .from('capsules')
        .update({
          current_bid: bidValue,
          highest_bidder_id: user.id,
        })
        .eq('id', capsule.id);
      
      if (updateError) throw updateError;

      toast({
        title: "Bid Placed Successfully",
        description: `You bid Ξ${bidValue} on '${capsule.name}'`,
      });

      // Call the onBidPlaced callback if provided
      if (onBidPlaced) {
        onBidPlaced();
      }

      onClose();
    } catch (error: any) {
      console.error("Error placing bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to place bid",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-space-dark/95 backdrop-blur-xl border border-neon-blue/20 rounded-xl w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white">
            Place Bid on {capsule.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bidAmount" className="text-white">Bid Amount (ETH)</Label>
            <div className="relative">
              <Input
                id="bidAmount"
                type="text"
                value={bidAmount}
                onChange={handleBidAmountChange}
                className="pl-8 bg-space-light/20 border-neon-blue/30 text-white"
                placeholder="0.00"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-blue">Ξ</div>
            </div>
            <p className="text-xs text-white/60">
              Minimum bid: Ξ{(capsule.current_bid || capsule.initial_bid || 0.1) + 0.01}
            </p>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-neon-blue to-neon-pink text-white hover:opacity-90 transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Place Bid"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceBidModal;
