
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useAccount } from 'wagmi';
import { AuthContextType, UserProfile } from '@/types/auth';
import { fetchUserProfile, updateWalletAddress, uploadAvatar } from '@/services/profileService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  const { address } = useAccount();

  // Refresh user profile data
  const refreshUserProfile = async () => {
    if (user?.id) {
      try {
        console.log("Refreshing user profile for ID:", user.id);
        const profile = await fetchUserProfile(user.id);
        
        if (profile) {
          console.log("Profile data retrieved:", profile);
          setUserProfile(profile);
        } else {
          console.log("No profile found, attempting to create one");
          // Create a default profile if none exists
          const { data: newProfile, error } = await supabase
            .from('profiles')
            .insert({ 
              id: user.id,
              username: user.email?.split('@')[0] || `user_${Date.now().toString().slice(-4)}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
            
          if (error) {
            console.error("Error creating user profile:", error);
            toast({
              title: "Profile Error",
              description: "Could not create user profile",
              variant: "destructive",
            });
          } else if (newProfile) {
            console.log("New profile created:", newProfile);
            setUserProfile(newProfile as UserProfile);
          }
        }
      } catch (error) {
        console.error("Error in refreshUserProfile:", error);
      }
    }
  };

  // Upload avatar image
  const handleUploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    const url = await uploadAvatar(file, user.id);
    
    // Refresh the profile to get updated data
    if (url) {
      await refreshUserProfile();
    }
    
    return url;
  };

  // Update wallet address if needed
  useEffect(() => {
    const updateUserWalletAddress = async () => {
      if (user && address && userProfile && userProfile.wallet_address !== address) {
        console.log("Updating wallet address:", address);
        await updateWalletAddress(user.id, address);
        
        // Refresh user profile
        await refreshUserProfile();
      }
    };
    
    updateUserWalletAddress();
  }, [user, address, userProfile]);

  useEffect(() => {
    // First, set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Auth state changed:", _event, "User:", session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Don't refresh the profile directly here to avoid Supabase auth deadlock
          setTimeout(() => {
            refreshUserProfile();
          }, 0);
        } else {
          setUserProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Existing session check:", session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        refreshUserProfile();
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred while signing out",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    userProfile,
    signOut,
    refreshUserProfile,
    uploadAvatar: handleUploadAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
