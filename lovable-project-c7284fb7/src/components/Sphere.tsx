interface SphereProps {
  enhancedDiffusion?: boolean;
}

const Sphere = ({ enhancedDiffusion = false }: SphereProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: 'translateY(-10%)' }}>
      {/* Enhanced top light diffusion - only shown when enhancedDiffusion is true */}
      {enhancedDiffusion && (
        <div 
          className="absolute rounded-full"
          style={{
            width: 'min(100vw, 750px)',
            height: 'min(70vw, 500px)',
            transform: 'translateY(-35%)',
            background: `
              radial-gradient(ellipse 100% 100% at 50% 100%, 
                hsla(0, 0%, 100%, 0.95) 0%,
                hsla(0, 0%, 100%, 0.7) 25%,
                hsla(220, 10%, 95%, 0.4) 50%,
                hsla(220, 10%, 92%, 0.15) 75%,
                hsla(220, 10%, 90%, 0) 100%
              )
            `,
            filter: 'blur(min(80px, 15vw))',
          }}
        />
      )}
      
      {/* Main sphere body - extremely blurred and subtle */}
      <div 
        className="absolute rounded-full"
        style={{
          width: 'min(90vw, 650px)',
          height: 'min(90vw, 650px)',
          background: `
            radial-gradient(circle at 50% 50%, 
              hsla(220, 15%, 85%, 0.4) 0%,
              hsla(220, 12%, 88%, 0.2) 40%,
              hsla(220, 10%, 90%, 0.05) 70%,
              transparent 100%
            )
          `,
          filter: 'blur(120px)',
        }}
      />
      
      {/* Bottom shadow - blurred */}
      <div 
        className="absolute rounded-full"
        style={{
          width: 'min(70vw, 500px)',
          height: 'min(70vw, 500px)',
          background: `
            radial-gradient(ellipse 100% 50% at 50% 90%, 
              hsla(220, 20%, 60%, 0.3) 0%,
              hsla(220, 15%, 70%, 0.15) 40%,
              transparent 70%
            )
          `,
          filter: 'blur(60px)',
        }}
      />
    </div>
  );
};

export { Sphere };
