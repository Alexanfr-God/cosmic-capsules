
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { ensureStorageBucketExists } from "@/utils/storageUtils";
import { CapsuleModalProvider } from "./CapsuleModalContext";
import { CapsuleModalContent } from "./CapsuleModalContent";
import { CapsuleModalActions } from "./CapsuleModalActions";
import { Capsule } from "@/services/capsuleService";
import { supabase } from "@/integrations/supabase/client";

interface CreateCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapsuleCreated?: (capsule: Capsule) => void;
}

const CreateCapsuleModal = ({ isOpen, onClose, onCapsuleCreated }: CreateCapsuleModalProps) => {
  const { user, refreshUserProfile } = useAuth();

  // Initialize storage and refresh user profile when the modal opens
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        await ensureStorageBucketExists('capsule_images');
        console.log("Storage bucket initialized");
      } catch (error) {
        console.error("Error initializing storage bucket:", error);
      }
    };
    
    if (isOpen) {
      console.log("Modal opened, initializing...");
      initializeStorage();
      
      // Refresh user profile when modal opens
      if (user) {
        console.log("Refreshing user profile...");
        refreshUserProfile().catch(err => {
          console.error("Error refreshing user profile:", err);
        });

        // Ensure user profile exists
        const checkProfile = async () => {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            
            if (error || !data) {
              console.log("Profile not found, creating default profile");
              const { error: insertError } = await supabase
                .from('profiles')
                .upsert({
                  id: user.id,
                  username: `user_${Date.now().toString().slice(-4)}`,
                  full_name: user.email?.split('@')[0] || 'User',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              
              if (insertError) {
                console.error("Error creating profile:", insertError);
              } else {
                console.log("Default profile created");
                refreshUserProfile();
              }
            } else {
              console.log("User profile exists:", data);
            }
          } catch (err) {
            console.error("Error checking profile:", err);
          }
        };
        
        checkProfile();
      }
    }
  }, [isOpen, user, refreshUserProfile]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-space-dark/95 backdrop-blur-xl border border-neon-blue/20 rounded-xl w-full max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white">
            CREATE NEW TIME CAPSULE
          </DialogTitle>
        </DialogHeader>

        <CapsuleModalProvider onCapsuleCreated={onCapsuleCreated} onClose={onClose}>
          <CapsuleModalContent />
          <CapsuleModalActions onCapsuleCreated={onCapsuleCreated} onClose={onClose} />
        </CapsuleModalProvider>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCapsuleModal;
