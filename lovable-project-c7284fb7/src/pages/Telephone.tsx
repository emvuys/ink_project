import { useState } from "react";
import { Sphere } from "@/components/Sphere";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const Telephone = () => {
  const text = "Verifying";
  const [value, setValue] = useState("");
  
  return (
    <div className="h-[100dvh] bg-background relative overflow-hidden">
      <Sphere enhancedDiffusion />

      <main className="absolute inset-0 flex items-center justify-center z-10" style={{ transform: 'translateY(-15%)' }}>
        <div className="text-center">
          <h1 
            className="text-5xl md:text-6xl font-medium tracking-tight mb-4 text-[#1a1a2e] pb-2"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            {text}
          </h1>
          <p className="text-xs text-[#5a5a6e]">
            Verify Phone Number
          </p>
          <p className="text-[10px] text-[#5a5a6e] mt-4 mb-8 max-w-xs mx-auto">
            You're a bit far away from the delivery address. Please enter the last four digits of the phone number on order to verify delivery.
          </p>
          
          <div className="flex justify-center">
            <InputOTP
              maxLength={4}
              value={value}
              onChange={(value) => setValue(value)}
              inputMode="numeric"
            >
              <InputOTPGroup className="gap-3">
                <InputOTPSlot 
                  index={0} 
                  className="w-14 h-14 bg-white border-0 rounded-lg text-xl font-medium text-[#1a1a2e] shadow-sm"
                />
                <InputOTPSlot 
                  index={1} 
                  className="w-14 h-14 bg-white border-0 rounded-lg text-xl font-medium text-[#1a1a2e] shadow-sm"
                />
                <InputOTPSlot 
                  index={2} 
                  className="w-14 h-14 bg-white border-0 rounded-lg text-xl font-medium text-[#1a1a2e] shadow-sm"
                />
                <InputOTPSlot 
                  index={3} 
                  className="w-14 h-14 bg-white border-0 rounded-lg text-xl font-medium text-[#1a1a2e] shadow-sm"
                />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>
      </main>
      
      {/* Privacy Policy link */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
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

export default Telephone;
