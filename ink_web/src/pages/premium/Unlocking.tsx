import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sphere } from "@/components/Sphere";

const PremiumUnlocking = () => {
  const navigate = useNavigate();
  const text = "Unlocking";

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/premium/email-sent");
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="h-[100dvh] bg-background relative overflow-hidden">
      <Sphere enhancedDiffusion />

      <main className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ transform: 'translateY(-15%)' }}>
        <div className="text-center">
          <h1 
            className="text-5xl md:text-6xl font-medium tracking-tight mb-4 text-[#1a1a2e] pb-2"
            style={{ 
              fontFamily: "'DM Serif Display', serif",
              animation: 'horizontalWipe 3s ease-out forwards',
              animationDelay: '0.6s',
              clipPath: 'inset(0 100% 0 0)',
              willChange: 'clip-path',
              transform: 'translateZ(0)'
            }}
          >
            {text}
            <span className="inline-flex ml-1">
              <span className="animate-[subtleScale_2s_ease-in-out_infinite]">.</span>
              <span className="animate-[subtleScale_2s_ease-in-out_0.3s_infinite]">.</span>
              <span className="animate-[subtleScale_2s_ease-in-out_0.6s_infinite]">.</span>
            </span>
          </h1>
          <p 
            className="text-xs text-[#5a5a6e]"
            style={{ 
              opacity: 0,
              animation: 'gentleFadeIn 1.5s ease-out 3.8s forwards, subtlePulse 3s ease-in-out 5.5s infinite',
              willChange: 'opacity, transform',
              transform: 'translateZ(0)'
            }}
          >
            Requesting Location
          </p>
        </div>
      </main>
      
      {/* Privacy Policy link */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <a 
          href="/privacy" 
          className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          Privacy Policy
        </a>
      </div>

      <style>{`
        @keyframes subtleScale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.04);
          }
        }
      `}</style>
    </div>
  );
};

export default PremiumUnlocking;
