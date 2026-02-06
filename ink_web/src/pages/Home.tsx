const Home = () => {
  return (
    <div className="h-[100dvh] bg-background relative overflow-hidden flex flex-col items-center justify-center">
      {/* Centered Content */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
        {/* INK Logo - "ink" centered, period hangs right */}
        <div className="relative">
          <h1 
            className="text-6xl md:text-8xl font-serif tracking-tight text-foreground"
            style={{ 
              fontFamily: "'DM Serif Display', serif",
              animation: 'horizontalWipe 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards',
              clipPath: 'inset(0 100% 0 0)',
              willChange: 'clip-path'
            }}
          >
            ink
          </h1>
          <span 
            className="absolute top-0 text-6xl md:text-8xl font-serif tracking-tight"
            style={{ 
              fontFamily: "'DM Serif Display', serif",
              right: '-0.3em',
              color: 'hsl(var(--foreground))',
              opacity: 0,
              animation: 'periodFadeIn 2s cubic-bezier(0.4, 0, 0.2, 1) 1.6s forwards'
            }}
          >.</span>
        </div>
        
        {/* Tagline */}
        <p className="text-xs md:text-sm text-muted-foreground max-w-md leading-relaxed mt-6">
          Premium delivery with tap-to-confirm signature
        </p>
        
        {/* Body subtext */}
        <p className="text-[11px] text-[#7a7a8e] max-w-sm leading-relaxed mt-4" style={{ fontFamily: "Inter, sans-serif" }}>
          Every shipment is equipped with NFC-enabled delivery confirmation, GPS-verified delivery location, and package documentation—protecting your brand while providing one final touchpoint in the purchase journey.
        </p>
      </div>
      
      {/* Footer Contact */}
      <div className="pb-12 text-center">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Get in touch</p>
        <a 
          href="mailto:info@in.ink" 
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          info@in.ink
        </a>
      </div>
    </div>
  );
};

export default Home;
