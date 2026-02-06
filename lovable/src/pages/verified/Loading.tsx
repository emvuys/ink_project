import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sphere } from "@/components/Sphere";

const VerifiedLoading = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/verified/phone-verification");
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="h-[100dvh] bg-background relative overflow-hidden">
      <Sphere enhancedDiffusion />

      <main className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10" style={{ transform: 'translateY(-15%)' }}>
        <div 
          className="w-10 h-10 rounded-full border border-[#1a1a2e]/30 border-t-[#1a1a2e]"
          style={{
            animation: 'elegantSpin 1.8s cubic-bezier(0.68, 0.0, 0.27, 1.0) infinite'
          }}
        />
        <p 
          className="mt-6 text-xs"
          style={{ 
            fontFamily: 'Inter, sans-serif',
            color: 'hsl(220 15% 35%)'
          }}
        >
          Loading delivery record
        </p>
      </main>

      <style>{`
        @keyframes elegantSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
    </div>
  );
};

export default VerifiedLoading;