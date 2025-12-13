import { InkButton } from "@/components/InkButton";
import { Sphere } from "@/components/Sphere";
import { useNavigate } from "react-router-dom";

const Authenticated = () => {
  const navigate = useNavigate();

  const handleInkRecord = () => {
    navigate("/ink-record");
  };

  return (
    <div className="h-[100dvh] bg-background relative">
      <Sphere />

      <main className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ transform: 'translateY(-15%)' }}>
        <div className="text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-medium tracking-tight mb-4 text-[#1a1a2e]" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Authenticated
          </h1>
          <p className="text-xs text-[#5a5a6e]">
            Verified Successfully
          </p>
        </div>
      </main>
      
      {/* View Record Button */}
      <nav className="fixed bottom-44 left-0 right-0 z-50 flex justify-center overflow-visible">
        <div className="overflow-visible">
          <InkButton 
            onClick={handleInkRecord}
            size="md"
          >
            View Record
          </InkButton>
        </div>
      </nav>
      
      {/* Privacy Policy link */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
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

export default Authenticated;
