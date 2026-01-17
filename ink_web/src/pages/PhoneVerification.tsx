import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Sphere } from "@/components/Sphere";
import { verifyDelivery, ApiError } from "@/lib/api";

const PhoneVerification = () => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();

  const handleComplete = async (digits: string) => {
    if (digits.length !== 4) return;
    
    setIsLoading(true);
    setError("");

    try {
      // Get coordinates from URL params
      const lat = searchParams.get('lat');
      const lng = searchParams.get('lng');
      const deviceInfo = searchParams.get('device');

      if (!lat || !lng || !token) {
        setError('Missing required information');
        setIsLoading(false);
        return;
      }

      const response = await verifyDelivery({
        nfc_token: token,
        delivery_gps: {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        },
        device_info: deviceInfo || undefined,
        phone_last4: digits
      });

      // Navigate to authenticated page after successful verification
      if (response.proof_id) {
        navigate(`/authenticated-delivery-record/${response.proof_id}`);
      } else if (response.verify_url) {
        const match = response.verify_url.match(/\/verify\/([^\/]+)$/);
        if (match) {
          navigate(`/authenticated-delivery-record/${match[1]}`);
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.data?.error || 'Phone verification failed');
      } else {
        setError('Network error. Please try again.');
      }
      setIsLoading(false);
      setValue(""); // Clear input on error
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center bg-background px-6 overflow-hidden relative">
      <Sphere enhancedDiffusion />
      
      {/* Main content */}
      <div 
        className="flex flex-col items-center text-center relative z-10"
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

        {/* OTP Input - Manual implementation */}
        <div 
          className="mb-4"
          style={{
            opacity: 0,
            animation: 'fadeIn 0.8s ease-out 0.5s forwards'
          }}
        >
          <div className="flex gap-3">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={value[index] || ''}
                onChange={(e) => {
                  const digit = e.target.value.replace(/[^0-9]/g, '');
                  if (digit.length <= 1) {
                    const newValue = value.split('');
                    newValue[index] = digit;
                    const updatedValue = newValue.join('').slice(0, 4);
                    setValue(updatedValue);
                    
                    // Auto-advance to next input
                    if (digit && index < 3) {
                      const nextInput = document.getElementById(`phone-input-${index + 1}`);
                      nextInput?.focus();
                    }
                    
                    // Auto-submit when 4 digits are entered
                    if (updatedValue.length === 4 && !isLoading) {
                      handleComplete(updatedValue);
                    }
                  }
                }}
                onKeyDown={(e) => {
                  // Handle backspace
                  if (e.key === 'Backspace' && !value[index] && index > 0) {
                    const prevInput = document.getElementById(`phone-input-${index - 1}`);
                    prevInput?.focus();
                  }
                }}
                id={`phone-input-${index}`}
                disabled={isLoading}
                className="w-14 h-14 text-2xl border-2 border-foreground/20 rounded-md bg-background text-center focus:outline-none focus:border-foreground/40 transition-colors disabled:opacity-50"
                style={{ fontFamily: 'DM Serif Display, serif' }}
              />
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            className="mb-4 max-w-xs"
            style={{
              animation: 'fadeIn 0.3s ease-out'
            }}
          >
            <p 
              className="text-xs leading-relaxed" 
              style={{ 
                fontFamily: 'Inter, sans-serif',
                color: 'hsl(220 15% 45%)'
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="mb-4">
            <p className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: 'hsl(220 15% 35%)' }}>
              Verifying...
            </p>
          </div>
        )}
      </div>

      {/* Privacy link */}
      <div 
        className="absolute bottom-8 z-10"
        style={{
          opacity: 0,
          animation: 'fadeIn 1s ease-out 0.8s forwards'
        }}
      >
        <a 
          href="/privacy" 
          className="text-xs underline"
          style={{ 
            fontFamily: 'Inter, sans-serif',
            color: 'hsl(220 15% 35%)'
          }}
        >
          Privacy Policy
        </a>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PhoneVerification;

