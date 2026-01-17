import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Premium flow pages
import PremiumUnlocking from "./pages/premium/Unlocking";
import PremiumEmailSent from "./pages/premium/EmailSent";
import PremiumDeliveryRecord from "./pages/premium/DeliveryRecord";

// Auth flow pages
import AuthUnlocking from "./pages/auth/Unlocking";
import PhoneVerification from "./pages/auth/PhoneVerification";
import AuthAuthenticated from "./pages/auth/Authenticated";
import AuthDeliveryRecord from "./pages/auth/DeliveryRecord";

// Shared pages
import Privacy from "./pages/Privacy";
import Home from "./pages/Home";
import Error from "./pages/Error";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Premium flow */}
          <Route path="/premium/unlocking" element={<PremiumUnlocking />} />
          <Route path="/premium/email-sent" element={<PremiumEmailSent />} />
          <Route path="/premium/delivery-record" element={<PremiumDeliveryRecord />} />

          {/* Auth flow */}
          <Route path="/auth/unlocking" element={<AuthUnlocking />} />
          <Route path="/auth/phone-verification" element={<PhoneVerification />} />
          <Route path="/auth/authenticated" element={<AuthAuthenticated />} />
          <Route path="/auth/delivery-record" element={<AuthDeliveryRecord />} />

          {/* Shared pages */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/home" element={<Home />} />
          <Route path="/error" element={<Error />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
