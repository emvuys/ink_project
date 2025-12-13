import { Sphere } from "@/components/Sphere";

const InvalidLinkState = () => {
  return (
    <div className="h-[100dvh] bg-background relative overflow-hidden">
      <Sphere />

      <main className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ transform: 'translateY(-15%)' }}>
        <div className="text-center animate-fade-in px-6">
          <h1 
            className="text-4xl md:text-5xl font-medium tracking-tight mb-4 text-[#1a1a2e]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Page Not Found
          </h1>
          <p className="text-xs text-[#5a5a6e]">
            This link is no longer active
          </p>
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

export default InvalidLinkState;
