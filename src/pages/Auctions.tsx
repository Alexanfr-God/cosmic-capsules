
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Capsule } from "@/services/capsuleService";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, Clock, Loader2, AlertCircle } from "lucide-react";
import AuctionCard from "@/components/home/AuctionCard";
import { useAuth } from "@/contexts/AuthContext";
import { Helmet } from "react-helmet";
import { Badge } from "@/components/ui/badge";

const Auctions = () => {
  const [auctions, setAuctions] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "closed">("all");
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        
        // This is a placeholder for future Supabase integration
        // In a real implementation, we would fetch data from Supabase like this:
        // const { data, error } = await supabase.from('capsules').select('*').eq('auction_enabled', true);
        
        // For now, we'll use the capsuleService to get all capsules
        const response = await supabase
          .from('capsules')
          .select(`
            *,
            creator:creator_id(username, avatar_url)
          `)
          .order('created_at', { ascending: false });
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        // Filter only auction_enabled capsules
        const auctionCapsules = response.data?.filter(capsule => capsule.auction_enabled) || [];
        setAuctions(auctionCapsules);
      } catch (err: any) {
        console.error("Error fetching auctions:", err);
        setError(err.message || "Failed to load auctions");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuctions();
  }, []);

  const filteredAuctions = React.useMemo(() => {
    if (filter === "all") return auctions;
    if (filter === "active") return auctions.filter(auction => auction.status === "closed");
    if (filter === "closed") return auctions.filter(auction => auction.status === "opened");
    return auctions;
  }, [auctions, filter]);
  
  return (
    <div className="min-h-screen bg-space-gradient text-white">
      <Helmet>
        <title>All Auctions — Cosmic Capsules</title>
        <meta name="description" content="Browse all available time capsule auctions" />
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <section className="mb-12 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2">ALL AUCTIONS</h1>
              <p className="text-white/60">
                Discover and bid on time capsules from our community
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={filter === "all" ? "default" : "outline"}
                className={filter === "all" ? "bg-neon-blue text-white" : ""}
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button 
                variant={filter === "active" ? "default" : "outline"}
                className={filter === "active" ? "bg-neon-blue text-white" : ""}
                onClick={() => setFilter("active")}
              >
                Active
              </Button>
              <Button 
                variant={filter === "closed" ? "default" : "outline"}
                className={filter === "closed" ? "bg-neon-blue text-white" : ""}
                onClick={() => setFilter("closed")}
              >
                Completed
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-12 h-12 text-neon-blue animate-spin mb-4" />
              <p className="text-white/60">Loading auctions...</p>
            </div>
          ) : error ? (
            <Card className="bg-red-900/20 border-red-500/50 p-6 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <p className="text-white mb-2">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Try Again
              </Button>
            </Card>
          ) : filteredAuctions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Clock className="w-16 h-16 text-white/30 animate-pulse mb-4" />
              <p className="text-xl text-white/60">No auctions available at the moment</p>
              <p className="text-white/40 mt-2">Check back later for new opportunities</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAuctions.map((auction, index) => (
                <AuctionCard 
                  key={auction.id}
                  capsule={auction}
                  index={index}
                  currentSlide={0}
                  isCreator={user?.id === auction.creator_id}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auctions;
