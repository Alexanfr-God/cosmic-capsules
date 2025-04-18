
import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { updateWalletAddress } from '@/services/profileService';

export const WalletConnect = () => {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const { user, signOut, refreshUserProfile } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle wallet authentication when connected
  useEffect(() => {
    const handleWalletAuth = async () => {
      if (isConnected && address) {
        try {
          console.log("Wallet connected, handling authentication for address:", address);
          
          // Check if user exists with this wallet
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('*')
            .eq('wallet_address', address)
            .maybeSingle();

          if (!existingUser) {
            // If no user with this wallet, create new wallet-based profile
            console.log("No existing user found with this wallet address, creating new account");
            
            // Use wallet address as the unique identifier for authentication
            const { data, error } = await supabase.auth.signUp({
              email: `${address.toLowerCase()}@wallet.auth`,
              password: crypto.randomUUID(), // Generate a random password since we'll never use it again
              options: {
                data: {
                  wallet_address: address,
                }
              }
            });
            
            if (error) {
              console.error("Signup error:", error);
              toast({
                title: 'Authentication Error',
                description: 'There was a problem connecting your wallet',
                variant: 'destructive',
              });
              return;
            }
          }

          // Update or set wallet address in profiles
          await updateWalletAddress(user?.id || '', address);
          
          // Refresh user profile to ensure we have the latest data
          await refreshUserProfile();
          
          toast({
            title: 'Wallet connected',
            description: 'Your wallet has been connected and your account is ready',
          });
        } catch (error) {
          console.error('Error in wallet authentication:', error);
          toast({
            title: 'Authentication Error',
            description: 'There was a problem connecting your wallet',
            variant: 'destructive',
          });
        }
      }
    };

    handleWalletAuth();
  }, [isConnected, address, toast, refreshUserProfile, user?.id]);

  // Handle wallet connection/disconnection
  const handleWalletAction = async () => {
    if (isConnected) {
      disconnect();
      // Sign out from Supabase when wallet is disconnected
      await signOut();
      toast({
        title: 'Wallet disconnected',
        description: 'Your wallet has been successfully disconnected',
      });
    } else {
      // Open Web3Modal
      const injected = connectors.find((c) => c.id === 'injected');
      if (injected?.ready) {
        connect({ connector: injected });
      } else {
        // Open Web3Modal using global method
        const w3mEvent = new Event('w3m-open-modal');
        document.dispatchEvent(w3mEvent);
      }
    }
  };

  // Shorten address for display
  const shortenAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Don't render on server-side
  if (!mounted) return null;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleWalletAction}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-space-light border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-white transition-all duration-300"
      >
        <Wallet className="w-5 h-5" />
        {isConnected ? shortenAddress(address) : "CONNECT WALLET"}
      </button>
    </div>
  );
};
