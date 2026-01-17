import { Sphere } from "@/components/Sphere";
import { InkButton } from "@/components/ui/ink-button";

interface FailedStateProps {
  message?: string;
}

const FailedState = ({ message }: FailedStateProps) => {
  return (
    <div className="h-[100dvh] bg-background relative overflow-hidden">
      <Sphere />

      <main className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ transform: 'translateY(-15%)' }}>
        <div className="text-center animate-fade-in px-6">
          <h1 
            className="text-4xl md:text-5xl font-medium tracking-tight mb-4 text-[#1a1a2e]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Unable To Confirm
          </h1>
          <p className="text-xs text-[#5a5a6e] mb-6">
            {message || "Verification failed. Please try again."}
          </p>
        </div>
      </main>

      {/* Action Button */}
      <nav className="fixed bottom-44 left-0 right-0 z-50 flex justify-center overflow-visible pointer-events-auto">
        <div className="overflow-visible max-w-[320px] w-full px-6">
          <InkButton 
            size="full"
            className="tracking-[0.6px]"
            onClick={() => window.location.reload()}
          >
            Try again
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

export default FailedState;
