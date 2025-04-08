
import { MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UserDMPanel = () => {
  return (
    <Card className="h-full bg-space-dark/80 border border-neon-blue/20 backdrop-blur-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Direct Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-60 text-center p-4 border border-dashed border-neon-blue/20 rounded-lg">
          <MessageSquare className="w-12 h-12 text-neon-blue/40 mb-4" />
          <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
          <p className="text-white/60 text-sm">
            Direct messages between capsule creators will be available soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDMPanel;
