import { useState, useRef, useEffect } from "react";
import { Sphere } from "@/components/Sphere";
import { InkButton } from "@/components/ui/ink-button";

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
    <div className="h-[100dvh] bg-background relative overflow-hidden">
      <Sphere enhancedDiffusion />

      <main className="absolute inset-0 flex items-center justify-center z-10 pointer-events-auto" style={{ transform: 'translateY(-15%)' }}>
        <div className="text-center px-6">
          <h1 
            className="text-5xl md:text-6xl font-medium tracking-tight mb-4 text-[#1a1a2e] pb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Verifying
          </h1>
          <p className="text-xs text-[#5a5a6e] mb-8">
            Verify Phone Number
          </p>
          <p className="text-[10px] text-[#5a5a6e] mb-8 max-w-xs mx-auto">
            You're a bit far away from the delivery address. Please enter the last four digits of the phone number on order to verify delivery.
          </p>
          
          {/* 4-Digit Input Boxes */}
          <div className="flex gap-3 mb-6 justify-center">
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
                className="w-14 h-14 bg-white border-0 rounded-lg text-xl font-medium text-[#1a1a2e] shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
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
          <div className="w-full max-w-[320px] mb-6">
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
              className="text-[11px] text-[#5a5a6e] underline hover:text-[#1a1a2e] transition-colors"
            >
              About this step
            </button>
            {isAboutExpanded && (
              <p className="mt-3 text-[11px] text-[#5a5a6e] leading-[18px] animate-fade-in">
                This quick check helps confirm the package is being received by the right person.
              </p>
            )}
          </div>
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

export default PhoneVerificationState;
