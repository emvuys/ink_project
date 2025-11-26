import PrivacyLink from "@/components/PrivacyLink";

interface LoadingStateProps {
  onRequestLocation?: () => void;
}

const LoadingState = ({ onRequestLocation }: LoadingStateProps) => {
  return (
    <div className="min-h-screen bg-ink-white flex flex-col items-center justify-center px-6 animate-container-fade-in">
      {/* INK Wordmark */}
      <div className="absolute top-[120px] opacity-0">
        <h1 className="text-[24px] font-bold text-ink-black tracking-tight">
          INK
        </h1>
      </div>

      {/* Main Content - Centered */}
      <div className="flex flex-col items-center">
        <p className="text-[16px] text-ink-black mb-4">
          Verifying delivery...
        </p>
        
        {/* Pulsing Line */}
        <div 
          className="w-[60px] h-[1px] bg-ink-black animate-pulse-line mb-6"
        />
        
        <p className="text-[14px] text-[#666666]">
          Requesting location...
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <PrivacyLink />
      </div>
    </div>
  );
};

export default LoadingState;
