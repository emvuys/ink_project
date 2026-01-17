import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Premium flow pages
import PremiumUnlockingHandler from "./pages/premium/PremiumUnlockingHandler";
import PremiumEmailSent from "./pages/premium/EmailSent";
import PremiumDeliveryRecord from "./pages/premium/DeliveryRecord";

// Auth flow pages
import AuthUnlockingHandler from "./pages/auth/AuthUnlockingHandler";
import PhoneVerificationHandler from "./pages/auth/PhoneVerificationHandler";
import AuthAuthenticated from "./pages/auth/Authenticated";
import AuthDeliveryRecord from "./pages/auth/DeliveryRecord";

// Shared pages
import Privacy from "./pages/Privacy";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Record from "./pages/Record";
import InkRecord from "./pages/InkRecord";

// Legacy pages (for backward compatibility)
import FailedState from "./components/delivery/FailedState";

const queryClient = new QueryClient();

const ErrorPage = () => (
  <FailedState message="Unable to verify delivery. Please try again." />
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />
          
          {/* Premium flow */}
          <Route path="/premium/t/:token" element={<PremiumUnlockingHandler />} />
          <Route path="/premium/email-sent" element={<PremiumEmailSent />} />
          <Route path="/premium/delivery-record/:proofId" element={<PremiumDeliveryRecord />} />

          {/* Auth flow */}
          <Route path="/auth/t/:token" element={<AuthUnlockingHandler />} />
          <Route path="/auth/phone-verify/:token" element={<PhoneVerificationHandler />} />
          <Route path="/auth/authenticated" element={<AuthAuthenticated />} />
          <Route path="/auth/delivery-record/:proofId" element={<AuthDeliveryRecord />} />

          {/* Legacy routes - redirect /t/:token to /auth/t/:token for backward compatibility */}
          <Route path="/t/:token" element={<AuthUnlockingHandler />} />
          
          {/* Legacy record pages */}
          <Route path="/verify/:proofId" element={<Record />} />
          <Route path="/record/:proofId" element={<Record />} />
          <Route path="/ink-record" element={<InkRecord />} />
          <Route path="/authenticated-delivery-record/:proofId" element={<Record />} />
          
          {/* Shared pages */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/error" element={<ErrorPage />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
