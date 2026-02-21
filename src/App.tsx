import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AnimatePresence } from "framer-motion";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import Team from "./pages/Team";
import Events from "./pages/Events";
import Apply from "./pages/Apply";
import ServerStatus from "./pages/ServerStatus";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import EventBooking from "./pages/EventBooking";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import SmoothScroll from "./components/layout/SmoothScroll";
import Preloader from "./components/layout/Preloader";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/team" element={<Team />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:eventId/book" element={<EventBooking />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/server-status" element={<ServerStatus />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Preloader />
        <Toaster />
        <Sonner />
        <SmoothScroll />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
        <SpeedInsights />
        <Analytics />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
