
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DollarSign, Clock } from "lucide-react";

interface BiddingTabProps {
  allowBidding: boolean;
  setAllowBidding: (allow: boolean) => void;
  minimumBid: string;
  setMinimumBid: (bid: string) => void;
}

const BiddingTab = ({ 
  allowBidding, 
  setAllowBidding, 
  minimumBid, 
  setMinimumBid 
}: BiddingTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="allow-bidding" className="text-sm text-neon-blue font-medium">ALLOW BIDDING</Label>
          <p className="text-xs text-white/70">Let others bid to open your capsule early</p>
        </div>
        <Switch 
          id="allow-bidding" 
          checked={allowBidding} 
          onCheckedChange={setAllowBidding} 
        />
      </div>

      {allowBidding && (
        <div className="space-y-2">
          <label className="text-sm text-neon-blue font-medium">MINIMUM BID (BNB)</label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.1"
              value={minimumBid}
              onChange={(e) => setMinimumBid(e.target.value)}
              className="bg-space-light/30 border-neon-blue/20 text-white placeholder:text-white/50 focus:border-neon-blue pl-12"
            />
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-blue" />
          </div>
        </div>
      )}

      {allowBidding && (
        <div className="space-y-2">
          <label className="text-sm text-neon-blue font-medium">AUTO-ACCEPT THRESHOLD (OPTIONAL)</label>
          <div className="relative">
            <Input
              type="number"
              placeholder="Set amount to auto-accept bids"
              className="bg-space-light/30 border-neon-blue/20 text-white placeholder:text-white/50 focus:border-neon-blue pl-12"
            />
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-blue" />
          </div>
          <p className="text-xs text-white/70 italic">
            Bids above this amount will be automatically accepted
          </p>
        </div>
      )}

      {allowBidding && (
        <div className="space-y-2">
          <label className="text-sm text-neon-blue font-medium">BIDDING TIME WINDOW</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-neon-blue" />
              <span className="text-xs text-white">Starts:</span>
            </div>
            <Input
              type="number"
              placeholder="0"
              className="bg-space-light/30 border-neon-blue/20 text-white placeholder:text-white/50 focus:border-neon-blue w-20"
            />
            <span className="text-xs text-white">days after creation</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-neon-blue" />
              <span className="text-xs text-white">Ends:</span>
            </div>
            <Input
              type="number"
              placeholder="7"
              className="bg-space-light/30 border-neon-blue/20 text-white placeholder:text-white/50 focus:border-neon-blue w-20"
            />
            <span className="text-xs text-white">days before opening</span>
          </div>
        </div>
      )}

      {allowBidding && (
        <div className="p-4 rounded-lg border border-neon-blue/20 bg-space-light/20">
          <p className="text-xs text-white/70">
            <span className="text-neon-blue">NOTE:</span> Platform fee for accepted bids is 2%. You will receive 98% of the winning bid amount.
          </p>
        </div>
      )}
    </div>
  );
};

export default BiddingTab;
