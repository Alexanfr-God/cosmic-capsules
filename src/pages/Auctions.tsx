
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Loader2, AlertCircle } from "lucide-react";
import AuctionCard from "@/components/home/AuctionCard";
import { useAuth } from "@/contexts/AuthContext";
import { Helmet } from "react-helmet-async";
import { Capsule } from "@/services/capsuleService";

const Auctions = () => {
  const [auctions, setAuctions] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const response = await supabase.from('capsules').select(`
          *,
          creator:creator_id(username, avatar_url)
        `).order('created_at', { ascending: false });
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        const auctionCapsules = response.data?.filter(capsule => capsule.auction_enabled) || [];
        
        const transformedCapsules = auctionCapsules.map(item => {
          // Safely handle creator which might be null
          const creator = item.creator && typeof item.creator === 'object' ? {
            id: item.creator_id,
            // Use optional chaining and provide fallback values
            username: item.creator?.username ?? "Anonymous",
            avatar_url: item.creator?.avatar_url ?? null
          } : null;
          
          return {
            ...item,
            creator
          };
        });
        
        setAuctions(transformedCapsules);
      } catch (err: any) {
        console.error("Error fetching auctions:", err);
        setError(err.message || "Failed to load auctions");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuctions();
  }, []);
  
  const filteredAuctions = filter === "all"
    ? auctions
    : auctions.filter(auction => auction.status === filter);
    
  return (
    <>
      <Helmet>
        <title>Auctions - Cosmic Capsules</title>
      </Helmet>
      
      <div className="min-h-screen bg-space-gradient text-white">
        <Header />
        
        <section className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-center mb-8 text-gradient">
            LIVE AUCTIONS
          </h1>
          
          {/* Filter Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            <Button 
              onClick={() => setFilter("all")}
              variant={filter === "all" ? "default" : "outline"}
            >
              All
            </Button>
            <Button
              onClick={() => setFilter("open")}
              variant={filter === "open" ? "default" : "outline"}
            >
              Open
            </Button>
            <Button
              onClick={() => setFilter("closed")}
              variant={filter === "closed" ? "default" : "outline"}
            >
              Closed
            </Button>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading auctions...</span>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="text-center text-red-500 py-8">
              <AlertCircle className="w-6 h-6 inline-block mr-2" />
              {error}
            </div>
          )}
          
          {/* Auction Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAuctions.map((capsule, index) => (
                <AuctionCard key={capsule.id} capsule={capsule} index={index} currentSlide={0} />
              ))}
            </div>
          )}
          
          {/* Empty State */}
          {!loading && !error && filteredAuctions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/60">No auctions found with the current filter.</p>
            </div>
          )}
        </section>
        
        <Footer />
      </div>
    </>
  );
};

export default Auctions;
