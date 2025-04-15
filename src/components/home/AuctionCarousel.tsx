
import React, { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Capsule } from "@/services/capsuleService";
import AuctionCard from "./AuctionCard";
import { useNavigate } from "react-router-dom";

interface AuctionCarouselProps {
  auctionCapsules: Capsule[];
}

const AuctionCarousel = ({ auctionCapsules }: AuctionCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  
  // Auto-slide functionality
  useEffect(() => {
    if (auctionCapsules.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => 
        prev === auctionCapsules.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [auctionCapsules.length]);

  const goToSlide = (index: number) => {
    if (index < 0) {
      setCurrentSlide(auctionCapsules.length - 1);
    } else if (index >= auctionCapsules.length) {
      setCurrentSlide(0);
    } else {
      setCurrentSlide(index);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-neon-blue/10 blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/3 right-1/4 w-[250px] h-[250px] rounded-full bg-neon-pink/10 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-4xl font-bold text-center mb-16 text-gradient animate-fade-in">
          CURRENT AUCTIONS
        </h2>
        
        {auctionCapsules.length > 0 ? (
          <div className="relative animate-fade-in delay-100">
            <div className="flex justify-center mb-8">
              <button
                onClick={() => goToSlide(currentSlide - 1)}
                className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center mr-4 hover:bg-white/10 transition-colors transform hover:scale-110"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex space-x-2">
                {auctionCapsules.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 transform ${
                      currentSlide === index 
                        ? "bg-neon-blue scale-125" 
                        : "bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => goToSlide(currentSlide + 1)}
                className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center ml-4 hover:bg-white/10 transition-colors transform hover:scale-110"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {auctionCapsules.map((capsule, index) => (
                <AuctionCard 
                  key={capsule.id} 
                  capsule={capsule} 
                  index={index} 
                  currentSlide={currentSlide} 
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-white/60 py-12 animate-fade-in">
            <p>No active auctions at the moment.</p>
          </div>
        )}
        
        <div className="text-center mt-12 animate-fade-in delay-300">
          <Button 
            variant="outline" 
            className="rounded-full border-neon-blue text-neon-blue hover:bg-neon-blue/20 transition-all transform hover:scale-105"
            onClick={() => navigate("/profile")}
          >
            VIEW ALL AUCTIONS
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AuctionCarousel;
