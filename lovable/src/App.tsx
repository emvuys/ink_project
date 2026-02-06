import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Verified flow pages
import VerifiedLoading from "./pages/verified/Loading";
import VerifiedPhoneVerification from "./pages/verified/PhoneVerification";
import VerifiedDeliveryRecord from "./pages/verified/DeliveryRecord";

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
          {/* Verified flow */}
          <Route path="/verified/loading" element={<VerifiedLoading />} />
          <Route path="/verified/phone-verification" element={<VerifiedPhoneVerification />} />
          <Route path="/verified/delivery-record" element={<VerifiedDeliveryRecord />} />


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