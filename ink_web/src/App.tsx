import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const PremiumUnlockingHandler = lazy(() => import("./pages/premium/PremiumUnlockingHandler"));
const AuthUnlockingHandler = lazy(() => import("./pages/auth/AuthUnlockingHandler"));
const PhoneVerificationHandler = lazy(() => import("./pages/auth/PhoneVerificationHandler"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Error = lazy(() => import("./pages/Error"));
const Record = lazy(() => import("./pages/Record"));
const DeliveryRecord = lazy(() => import("./pages/DeliveryRecord"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />
          
          {/* Delivery Record - unified page for both auth and premium */}
          <Route path="/delivery-record/:proofId" element={<DeliveryRecord />} />
          
          {/* Premium flow */}
          <Route path="/premium/delivery-record/:proofId" element={<DeliveryRecord />} />
          {/* Legacy path with /t/ for backward compatibility - must be before /premium/:token */}
          <Route path="/premium/t/:token" element={<PremiumUnlockingHandler />} />
          {/* New path without /t/ */}
          <Route path="/premium/:token" element={<PremiumUnlockingHandler />} />

          {/* Auth flow */}
          <Route path="/auth/phone-verify/:token" element={<PhoneVerificationHandler />} />
          <Route path="/auth/delivery-record/:proofId" element={<DeliveryRecord />} />
          {/* Legacy path with /t/ for backward compatibility - must be before /auth/:token */}
          <Route path="/auth/t/:token" element={<AuthUnlockingHandler />} />
          {/* New path without /t/ */}
          <Route path="/auth/:token" element={<AuthUnlockingHandler />} />

          {/* Legacy routes - redirect /t/:token to /auth/:token for backward compatibility */}
          <Route path="/t/:token" element={<AuthUnlockingHandler />} />
          
          {/* Legacy record pages */}
          <Route path="/verify/:proofId" element={<Record />} />
          <Route path="/record/:proofId" element={<Record />} />
          
          {/* Admin (merchant animation management) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Shared pages */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/error" element={<Error />} />

          {/* Direct token access at root path - must be after all other routes */}
          {/* This handles URLs like https://in.ink/token_xxx */}
          {/* Note: This will match any path that doesn't match above routes */}
          <Route path="/:token" element={<AuthUnlockingHandler />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
