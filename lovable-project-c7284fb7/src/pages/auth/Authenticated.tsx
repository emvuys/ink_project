import { Sphere } from "@/components/Sphere";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AuthAuthenticated = () => {
  const navigate = useNavigate();
  return (
    <div className="h-[100dvh] bg-background relative">
      <Sphere />

      <main
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        style={{ transform: "translateY(-15%)" }}
      >
        <div className="text-center animate-fade-in">
          <h1
            className="text-5xl md:text-6xl font-medium tracking-tight mb-4 text-[#1a1a2e]"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Delivery Confirmed
          </h1>
          <p className="text-xs text-[#5a5a6e] mb-8">Your delivery has been authenticated</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9a9aae]" style={{ fontFamily: "Inter, sans-serif" }}>Verified</p>
        </div>
      </main>

      {/* View Proof link */}
      <div className="absolute bottom-24 left-0 right-0 text-center z-10">
        <Button
          variant="outline"
          onClick={() => navigate("/auth/delivery-record")}
          className="bg-transparent border-[#d0d0d8] text-[#5a5a6e] hover:bg-[#f0f0f4] hover:text-[#4a4a5e] text-xs px-6"
        >
          View Proof
        </Button>
      </div>

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

export default AuthAuthenticated;
