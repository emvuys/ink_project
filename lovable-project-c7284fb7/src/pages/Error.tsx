import { Sphere } from "@/components/Sphere";

const Error = () => {
  return (
    <div className="h-[100dvh] bg-background relative overflow-hidden">
      <Sphere />

      <main className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ transform: 'translateY(-15%)' }}>
        <div className="text-center animate-fade-in">
          <h1 
            className="text-4xl md:text-5xl font-medium tracking-tight mb-4 text-[#1a1a2e]"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Unable To Confirm
          </h1>
          <p className="text-xs text-[#5a5a6e] mb-6">
            Location access is required to verify delivery
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="text-xs text-[#1a1a2e] font-medium underline underline-offset-4 pointer-events-auto hover:text-[#5a5a6e] transition-colors"
          >
            Enable location and try again
          </button>
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

export default Error;
