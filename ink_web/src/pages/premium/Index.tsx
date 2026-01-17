import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sphere } from "@/components/Sphere";
import { verifyDelivery, ApiError } from "@/lib/api";
import { getCurrentPosition, getDeviceInfo } from "@/lib/geolocation";

type ViewState = 'unlocking' | 'failed' | 'invalid';

const PremiumIndex = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<ViewState>('unlocking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setState('invalid');
      return;
    }

    requestLocation();
  }, [token]);

  const requestLocation = async () => {
    setState('unlocking');

    const geoResult = await getCurrentPosition();
    
    if (!geoResult.success || !geoResult.coordinates) {
      setErrorMessage('Location access is required to verify delivery');
      setState('failed');
      return;
    }

    await startVerification(geoResult.coordinates);
  };

  const startVerification = async (coordinates: { lat: number; lng: number }) => {
    setState('unlocking');

    try {
      const response = await verifyDelivery({
        nfc_token: token!,
        delivery_gps: coordinates,
        device_info: getDeviceInfo(),
        // Premium delivery: no phone verification needed
      });

      if (response.proof_id) {
        navigate(`/premium/email-sent/${response.proof_id}`);
      } else if (response.verify_url) {
        const match = response.verify_url.match(/\/verify\/([^\/]+)$/);
        if (match) {
          navigate(`/premium/email-sent/${match[1]}`);
        } else {
          setErrorMessage('Invalid response from server');
          setState('failed');
        }
      } else {
        setErrorMessage('Invalid response from server');
        setState('failed');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          setState('invalid');
        } else {
          setErrorMessage(error.data?.error || 'Verification failed');
          setState('failed');
        }
      } else {
        setErrorMessage('Network error. Please check your connection.');
        setState('failed');
      }
    }
  };

  const renderState = () => {
    switch (state) {
      case 'unlocking':
        return (
          <div className="h-[100dvh] bg-background relative overflow-hidden">
            <Sphere enhancedDiffusion />

            <main className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ transform: 'translateY(-15%)' }}>
              <div className="text-center">
                <h1 
                  className="text-5xl md:text-6xl font-medium tracking-tight mb-4 text-[#1a1a2e] pb-2"
                  style={{ 
                    fontFamily: "'DM Serif Display', serif",
                    animation: 'horizontalWipe 3s ease-out forwards',
                    animationDelay: '0.6s',
                    clipPath: 'inset(0 100% 0 0)',
                    willChange: 'clip-path',
                    transform: 'translateZ(0)'
                  }}
                >
                  Unlocking
                  <span className="inline-flex ml-1">
                    <span className="animate-[subtleScale_2s_ease-in-out_infinite]">.</span>
                    <span className="animate-[subtleScale_2s_ease-in-out_0.3s_infinite]">.</span>
                    <span className="animate-[subtleScale_2s_ease-in-out_0.6s_infinite]">.</span>
                  </span>
                </h1>
                <p 
                  className="text-xs text-[#5a5a6e]"
                  style={{ 
                    opacity: 0,
                    animation: 'gentleFadeIn 1.5s ease-out 3.8s forwards, subtlePulse 3s ease-in-out 5.5s infinite',
                    willChange: 'opacity, transform',
                    transform: 'translateZ(0)'
                  }}
                >
                  Requesting Location
                </p>
              </div>
            </main>
            
            <div className="absolute bottom-8 left-0 right-0 text-center z-10">
              <a 
                href="/privacy" 
                className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Privacy Policy
              </a>
            </div>

            <style>{`
              @keyframes subtleScale {
                0%, 100% {
                  transform: scale(1);
                }
                50% {
                  transform: scale(1.04);
                }
              }
            `}</style>
          </div>
        );

      case 'failed':
        return (
          <div className="h-[100dvh] bg-background relative overflow-hidden">
            <Sphere />

            <main className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ transform: 'translateY(-15%)' }}>
              <div className="text-center animate-fade-in">
                <h1 
                  className="text-4xl md:text-5xl font-medium tracking-tight mb-4 text-[#1a1a2e]"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  Unable To Confirm
                </h1>
                <p className="text-xs text-[#5a5a6e] mb-6">
                  {errorMessage || 'Location access is required to confirm your delivery'}
                </p>
                <button 
                  onClick={requestLocation}
                  className="text-xs text-[#1a1a2e] font-medium underline underline-offset-4 pointer-events-auto hover:text-[#5a5a6e] transition-colors"
                >
                  Enable location and try again
                </button>
              </div>
            </main>
            
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

      case 'invalid':
        return (
          <div className="h-[100dvh] bg-background relative overflow-hidden">
            <Sphere />

            <main className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ transform: 'translateY(-15%)' }}>
              <div className="text-center animate-fade-in">
                <h1 
                  className="text-4xl md:text-5xl font-medium tracking-tight mb-4 text-[#1a1a2e]"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  Invalid Link
                </h1>
                <p className="text-xs text-[#5a5a6e]">
                  This delivery link is not valid
                </p>
              </div>
            </main>
            
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

      default:
        return null;
    }
  };

  return renderState();
};

export default PremiumIndex;

