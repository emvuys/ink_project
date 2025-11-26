import { InkButton } from "@/components/ui/ink-button";
import PrivacyLink from "@/components/PrivacyLink";

interface FailedStateProps {
  message?: string;
}

const FailedState = ({ message }: FailedStateProps) => {
  return (
    <div className="min-h-screen bg-ink-white flex flex-col items-center px-6 pt-[120px] animate-container-fade-in">
      {/* Mismatch Symbol */}
      <div className="mb-8 animate-fade-in">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <line x1="8" y1="12" x2="24" y2="12" stroke="#000000" strokeWidth="1.5" />
          <line x1="8" y1="20" x2="24" y2="20" stroke="#000000" strokeWidth="1.5" />
          <line x1="14" y1="11" x2="18" y2="21" stroke="#000000" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Headline */}
      <div className="text-center mb-16 animate-fade-up">
        <h1 className="text-[30px] font-bold text-ink-black leading-[34px] mb-[6px]">
          Unable to confirm
        </h1>
        <p className="text-[15px] text-[#666666] leading-[22px]">
          {message || "Your location or phone number didn't match"}
        </p>
      </div>

      {/* Action Button */}
      <div className="w-full max-w-[320px] mb-auto">
        <InkButton 
          size="full"
          className="tracking-[0.6px]"
          onClick={() => window.location.reload()}
        >
          Try again
        </InkButton>
      </div>

      <div className="mt-auto">
        <PrivacyLink />
      </div>
    </div>
  );
};

export default FailedState;
