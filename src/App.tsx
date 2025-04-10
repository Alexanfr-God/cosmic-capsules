
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import Auctions from "./pages/Auctions";
import { WagmiConfig } from 'wagmi';
import { wagmiConfig, Web3ModalComponent } from './lib/web3-config';
import { AuthProvider } from "./contexts/AuthContext";
import AuctionNotifications from "./components/bidding/AuctionNotifications";

const queryClient = new QueryClient();

const App = () => {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AuctionNotifications />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/auctions" element={<Auctions />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </WagmiConfig>
      
      {/* Web3Modal needs to be outside WagmiConfig but still in the React tree */}
      <Web3ModalComponent />
    </>
  );
};

export default App;
