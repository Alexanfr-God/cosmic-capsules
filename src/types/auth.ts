
import type { User, Session } from '@supabase/supabase-js';

export type UserProfile = {
  id: string;
  username?: string;
  avatar_url?: string;
  banner_url?: string;
  wallet_address?: string;
}

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  userProfile: UserProfile | null;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;
};
