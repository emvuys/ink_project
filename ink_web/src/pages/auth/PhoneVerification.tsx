import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const PhoneVerification = () => {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  const handleComplete = (digits: string) => {
    if (digits.length === 4) {
      // Navigate to authenticated page after entering digits
      setTimeout(() => {
        navigate("/auth/authenticated");
      }, 500);
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center bg-background px-6 overflow-hidden">
      {/* Main content */}
      <div 
        className="flex flex-col items-center text-center"
        style={{
          opacity: 0,
          animation: 'fadeIn 0.8s ease-out 0.2s forwards'
        }}
      >
        {/* Heading */}
        <h1 
          className="text-4xl md:text-5xl mb-4"
          style={{ fontFamily: 'DM Serif Display, serif' }}
        >
          Enter Last Four of Telephone
        </h1>
        
        {/* Subtext */}
        <p 
          className="text-xs mb-10 max-w-xs"
          style={{ 
            fontFamily: 'Inter, sans-serif',
            color: 'hsl(220 15% 35%)'
          }}
        >
          You're a bit far from the delivery address. Wanna make sure it's you.
        </p>

        {/* OTP Input */}
        <div 
          className="mb-8"
          style={{
            opacity: 0,
            animation: 'fadeIn 0.8s ease-out 0.5s forwards'
          }}
        >
          <InputOTP
            maxLength={4}
            value={value}
            onChange={(val) => {
              setValue(val);
              handleComplete(val);
            }}
          >
            <InputOTPGroup className="gap-3">
              <InputOTPSlot 
                index={0} 
                className="w-14 h-14 text-2xl border-2 border-foreground/20 rounded-md bg-background"
                style={{ fontFamily: 'DM Serif Display, serif' }}
              />
              <InputOTPSlot 
                index={1} 
                className="w-14 h-14 text-2xl border-2 border-foreground/20 rounded-md bg-background"
                style={{ fontFamily: 'DM Serif Display, serif' }}
              />
              <InputOTPSlot 
                index={2} 
                className="w-14 h-14 text-2xl border-2 border-foreground/20 rounded-md bg-background"
                style={{ fontFamily: 'DM Serif Display, serif' }}
              />
              <InputOTPSlot 
                index={3} 
                className="w-14 h-14 text-2xl border-2 border-foreground/20 rounded-md bg-background"
                style={{ fontFamily: 'DM Serif Display, serif' }}
              />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      {/* Privacy link */}
      <div 
        className="absolute bottom-8"
        style={{
          opacity: 0,
          animation: 'fadeIn 1s ease-out 0.8s forwards'
        }}
      >
        <Link 
          to="/privacy" 
          className="text-xs underline"
          style={{ 
            fontFamily: 'Inter, sans-serif',
            color: 'hsl(220 15% 35%)'
          }}
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  );
};

export default PhoneVerification;
