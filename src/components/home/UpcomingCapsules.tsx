
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Capsule } from "@/services/capsuleService";

interface UpcomingCapsulesProps {
  upcomingCapsules: Capsule[];
}

const UpcomingCapsules = ({ upcomingCapsules }: UpcomingCapsulesProps) => {
  return (
    <section className="py-24 bg-space-dark">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16 text-gradient">
          OPENING THIS WEEK
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {upcomingCapsules.length > 0 ? (
            upcomingCapsules.map((capsule) => (
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
