import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NetworkMismatchBanner } from "@/components/NetworkMismatchBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnimatedRoute } from "@/components/AnimatedRoute";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Stats from "./pages/Stats";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<AnimatedRoute><Landing /></AnimatedRoute>} />
      <Route path="/vault" element={<AnimatedRoute><Index /></AnimatedRoute>} />
      <Route path="/stats" element={<AnimatedRoute><Stats /></AnimatedRoute>} />
      <Route path="/admin" element={<AnimatedRoute><Admin /></AnimatedRoute>} />
      <Route path="*" element={<AnimatedRoute><NotFound /></AnimatedRoute>} />
    </Routes>
  );
};

const Layout = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NetworkMismatchBanner />
      <Header />
      <div className="flex-1">
        <ErrorBoundary>
          <AnimatedRoutes />
        </ErrorBoundary>
      </div>
      <Footer />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WalletProvider>
        <Sonner />
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </WalletProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
