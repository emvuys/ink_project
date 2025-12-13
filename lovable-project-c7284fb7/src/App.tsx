import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Verifying from "./pages/Verifying";
import Telephone from "./pages/Telephone";
import Privacy from "./pages/Privacy";
import Authenticated from "./pages/Authenticated";
import Home from "./pages/Home";
import ReturnPassport from "./pages/ReturnPassport";
import InkRecord from "./pages/InkRecord";
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
          <Route path="/" element={<Verifying />} />
          <Route path="/telephone" element={<Telephone />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/authenticated" element={<Authenticated />} />
          <Route path="/home" element={<Home />} />
          <Route path="/return-passport" element={<ReturnPassport />} />
          <Route path="/ink-record" element={<InkRecord />} />
          <Route path="/error" element={<Error />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
