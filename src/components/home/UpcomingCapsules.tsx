
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Capsule } from "@/services/capsuleService";
import { addDays } from "date-fns";

interface UpcomingCapsulesProps {
  upcomingCapsules: Capsule[];
}

const UpcomingCapsules = ({ upcomingCapsules }: UpcomingCapsulesProps) => {
  const [displayCapsules, setDisplayCapsules] = useState<Capsule[]>(upcomingCapsules);
  
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
      created_at: new Date().toISOString()
    };
    
    // Add the demo capsule to the display capsules
    if (upcomingCapsules.length === 0 || !upcomingCapsules.some(c => c.id === "demo-capsule")) {
      setDisplayCapsules([...upcomingCapsules, demoCapsule]);
    } else {
      setDisplayCapsules(upcomingCapsules);
    }
  }, [upcomingCapsules]);

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
                className="bg-space-light/10 backdrop-blur-xl border border-neon-green/20 hover:border-neon-green/60 transition-all"
              >
                <CardHeader>
                  <CardTitle className="text-neon-green">{capsule.name}</CardTitle>
                  <CardDescription className="text-white/60">
                    By {capsule.creator?.username || "Anonymous"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-white/80">
                      Opens on: {new Date(capsule.open_date).toLocaleDateString()} at {new Date(capsule.open_date).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="w-full bg-space-dark/50 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-neon-green to-neon-blue"
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
