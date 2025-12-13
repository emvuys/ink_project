import { Sphere } from "@/components/Sphere";
import { InkButton } from "@/components/ui/ink-button";
import { useNavigate } from "react-router-dom";

interface SuccessStateProps {
  proofId?: string;
  verifyUrl?: string;
}

const SuccessState = ({ proofId, verifyUrl }: SuccessStateProps) => {
  const navigate = useNavigate();

  const handleViewRecord = () => {
    if (proofId) {
      navigate(`/verify/${proofId}`);
    } else if (verifyUrl) {
      const match = verifyUrl.match(/\/verify\/([^\/]+)$/);
      if (match) navigate(`/verify/${match[1]}`);
    }
  };

  return (
    <div className="h-[100dvh] bg-background relative">
      <Sphere />

      <main className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ transform: 'translateY(-15%)' }}>
        <div className="text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-medium tracking-tight mb-4 text-[#1a1a2e]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Authenticated
          </h1>
          <p className="text-xs text-[#5a5a6e]">
            Verified Successfully
          </p>
        </div>
      </main>
      
      {/* View Record Button */}
      <nav className="fixed bottom-32 left-0 right-0 z-50 flex justify-center overflow-visible pointer-events-auto px-6">
        <div className="w-full max-w-[320px]">
          <InkButton 
            onClick={handleViewRecord}
            size="full"
            className="tracking-[0.6px] min-w-[280px]"
          >
            VIEW RECORD
          </InkButton>
        </div>
      </nav>
      
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

export default SuccessState;
