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
            className="absolute top-0 text-6xl md:text-8xl font-serif tracking-tight text-foreground"
            style={{ 
              fontFamily: "'DM Serif Display', serif",
              right: '-0.3em',
              opacity: 0,
              animation: 'gentleFadeIn 1.2s ease-out 1.5s forwards'
            }}
          >.</span>
        </div>
        
        {/* Tagline */}
        <p className="text-xs md:text-sm text-muted-foreground max-w-md leading-relaxed mt-6">
          Cryptographic proof for valuable shipments
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
