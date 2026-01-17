import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sphere } from "@/components/Sphere";
import { verifyDelivery, ApiError } from "@/lib/api";
import { getCurrentPosition, getDeviceInfo } from "@/lib/geolocation";

const PremiumUnlockingHandler = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const text = "Unlocking";

  useEffect(() => {
    if (!token) {
      navigate('/error');
      return;
    }

    requestLocationAndVerify();
  }, [token]);

  const requestLocationAndVerify = async () => {
    const geoResult = await getCurrentPosition();
    
    if (!geoResult.success || !geoResult.coordinates) {
      setErrorMessage('Location access is required to verify delivery');
      navigate('/error');
      return;
    }

    await startVerification(geoResult.coordinates);
  };

  const startVerification = async (coordinates: { lat: number; lng: number }) => {
    try {
      const response = await verifyDelivery({
        nfc_token: token!,
        delivery_gps: coordinates,
        device_info: getDeviceInfo(),
        delivery_type: 'premium' // 标记为Premium类型
      });

      if (response.proof_id) {
        navigate(`/premium/email-sent?proofId=${response.proof_id}`);
      } else if (response.verify_url) {
        const match = response.verify_url.match(/\/verify\/([^\/]+)$/);
        if (match) {
          navigate(`/premium/email-sent?proofId=${match[1]}`);
        } else {
          setErrorMessage('Invalid response from server');
          navigate('/error');
        }
      } else {
        setErrorMessage('Invalid response from server');
        navigate('/error');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          navigate('/error');
        } else {
          setErrorMessage(error.data?.error || 'Verification failed');
          navigate('/error');
        }
      } else {
        setErrorMessage('Network error. Please check your connection.');
        navigate('/error');
      }
    }
  };

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
            {text}
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
      
      {/* Privacy Policy link */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10 pointer-events-auto">
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
};

export default PremiumUnlockingHandler;

