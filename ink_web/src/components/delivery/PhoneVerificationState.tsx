import { useState, useRef, useEffect } from "react";
import { InkButton } from "@/components/ui/ink-button";
import PrivacyLink from "@/components/PrivacyLink";

interface PhoneVerificationStateProps {
  onSubmit: (phone: string) => void;
  error?: string;
  isLoading?: boolean;
}

const PhoneVerificationState = ({ onSubmit, error, isLoading }: PhoneVerificationStateProps) => {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    // Auto-advance to next box
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    // Vibrate on page load to indicate NFC connection
    if ('vibrate' in navigator) {
      navigator.vibrate(200); // 200ms vibration
    }
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-ink-white flex flex-col items-center px-6 pt-[120px] animate-container-fade-in">
      {/* Circle Symbol */}
      <div className="mb-8 animate-fade-in">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9.5" stroke="#000000" strokeWidth="1" />
        </svg>
      </div>

      {/* Headline */}
      <div className="text-center mb-8 animate-fade-up">
        <h1 className="text-[30px] font-bold text-ink-black leading-[34px] mb-[6px]">
          Almost there
        </h1>
        <p className="text-[15px] text-[#666666] leading-[22px]">
          Last 4 digits of your phone
        </p>
      </div>

      {/* 4-Digit Input Boxes */}
      <div className="flex gap-3 mb-12">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-[52px] h-[52px] border border-ink-black bg-ink-white text-center text-[24px] font-bold text-ink-black focus:outline-none focus:ring-1 focus:ring-ink-black transition-transform duration-200"
            style={{
              transform: digit ? "scale(1.05)" : "scale(1)",
            }}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="w-full max-w-[320px] mb-4 text-center">
          <p className="text-[13px] text-red-600">{error}</p>
        </div>
      )}

      {/* Confirm Button */}
      <div className="w-full max-w-[320px] mb-8">
        <InkButton 
          size="full"
          className="tracking-[0.6px]"
          disabled={digits.some(d => !d) || isLoading}
          onClick={() => onSubmit(digits.join(''))}
        >
          {isLoading ? 'Verifying...' : 'Confirm'}
        </InkButton>
      </div>

      {/* About Link */}
      <div className="text-center max-w-[320px]">
        <button 
          onClick={() => setIsAboutExpanded(!isAboutExpanded)}
          className="text-[13px] text-[#666666] underline hover:text-ink-black transition-colors"
        >
          About this step
        </button>
        {isAboutExpanded && (
          <p className="mt-3 text-[14px] text-[#666666] leading-[22px] animate-fade-in">
            This quick check helps confirm the package is being received by the right person.
          </p>
        )}
      </div>

      <div className="mt-auto">
        <PrivacyLink />
      </div>
    </div>
  );
};

export default PhoneVerificationState;
