
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import { WagmiConfig } from 'wagmi';
import { wagmiConfig, Web3ModalComponent } from './lib/web3-config';
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <>
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </WagmiConfig>
    </QueryClientProvider>
    
    {/* Web3Modal нужно размещать вне основного компонента */}
    <Web3ModalComponent />
  </>
);

export default App;
