
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAccount } from "wagmi";
import { getAllCapsules, Capsule } from "@/services/capsuleService";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import FeatureSection from "@/components/home/FeatureSection";
import AuctionCarousel from "@/components/home/AuctionCarousel";
import UpcomingCapsules from "@/components/home/UpcomingCapsules";
import Testimonials from "@/components/home/Testimonials";
import CreateCapsuleModal from "@/components/CreateCapsuleModal";
import { Button } from "@/components/ui/button";
import { Rocket, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ensureStorageBucketExists } from "@/utils/storageUtils";

const Index = () => {
  const { user } = useAuth();
  const { isConnected, address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auctionCapsules, setAuctionCapsules] = useState<Capsule[]>([]);
  const [upcomingCapsules, setUpcomingCapsules] = useState<Capsule[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchCapsules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAllCapsules();
      
      if (data && data.length) {
        console.log("Fetched capsules:", data);
        
        const auctionEnabled = data.filter(capsule => capsule.auction_enabled);
        setAuctionCapsules(auctionEnabled.slice(0, 6));
        
        const now = new Date();
        const oneWeekFromNow = new Date(now);
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
        
        const upcoming = data.filter(capsule => {
          const openDate = new Date(capsule.open_date);
          return openDate > now && openDate <= oneWeekFromNow;
        });
        setUpcomingCapsules(upcoming.slice(0, 4));
        
        setCapsules(data);
      } else {
        console.log("No capsules found");
        setCapsules([]);
        setAuctionCapsules([]);
        setUpcomingCapsules([]);
      }
    } catch (error: any) {
      console.error("Error fetching capsules:", error);
      setError(error.message || "Failed to load capsules. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchCapsules();
    
    // Check if the storage bucket exists when the component mounts
    const checkStorageBucket = async () => {
      await ensureStorageBucketExists('capsule_images');
    };
    
    checkStorageBucket();
  }, [fetchCapsules]);

  const handleCreateCapsuleClose = () => {
    setIsCreateModalOpen(false);
    // Refresh the capsule list when the modal closes
    fetchCapsules();
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-space-gradient text-white overflow-x-hidden">
      <Header />
      <Hero />
      
      {/* Error message if capsules failed to load */}
      {error && (
        <div className="container mx-auto px-4 py-4">
          <Alert variant="destructive" className="bg-red-900/50 border-red-500 text-white">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Floating Create Capsule Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-full px-6 py-6 bg-gradient-to-r from-neon-pink to-neon-blue hover:opacity-90 transition-all shadow-lg hover:scale-105"
        >
          <Rocket className="w-6 h-6 mr-2" />
          CREATE CAPSULE
        </Button>
      </div>
      
      <FeatureSection />
      <AuctionCarousel auctionCapsules={auctionCapsules} />
      <UpcomingCapsules upcomingCapsules={upcomingCapsules} />
      <Testimonials />
      <Footer />
      
      <CreateCapsuleModal 
        isOpen={isCreateModalOpen} 
        onClose={handleCreateCapsuleClose} 
      />
    </div>
  );
};

export default Index;
