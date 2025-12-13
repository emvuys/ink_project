import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Sphere } from "@/components/Sphere";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="h-[100dvh] bg-background relative overflow-hidden">
      <Sphere />

      <main className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ transform: 'translateY(-15%)' }}>
        <div className="text-center animate-fade-in px-6">
          <h1 
            className="text-6xl md:text-7xl font-medium tracking-tight mb-4 text-[#1a1a2e]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            404
          </h1>
          <p className="text-xs text-[#5a5a6e] mb-6">
            Page not found
          </p>
          <a 
            href="/" 
            className="text-xs text-[#1a1a2e] font-medium underline underline-offset-4 pointer-events-auto hover:text-[#5a5a6e] transition-colors"
          >
            Return to Home
          </a>
        </div>
      </main>
      
      {/* Privacy Policy link */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10 pointer-events-auto">
        <a 
          href="/privacy" 
          className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          Privacy Policy
        </a>
      </div>
    </div>
  );
};

export default NotFound;
