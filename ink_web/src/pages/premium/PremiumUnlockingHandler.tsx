import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sphere } from "@/components/Sphere";
import { verifyDelivery, ApiError, getMerchantByToken, getMerchantAnimation } from "@/lib/api";
import { getCurrentPosition, getDeviceInfo } from "@/lib/geolocation";

const PremiumUnlockingHandler = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showError, setShowError] = useState(false);
  const [animationUrl, setAnimationUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setShowError(true);
      setErrorMessage('Invalid token');
      return;
    }
    const loadAnimation = async (): Promise<void> => {
      try {
        const { merchant } = await getMerchantByToken(token);
        const nameToTry = (merchant && merchant.trim()) || 'default';
        const res = await getMerchantAnimation(nameToTry);
        if (res?.animation_url) setAnimationUrl(res.animation_url);
      } catch (_) {
        try {
          const fallback = await getMerchantAnimation('default');
          if (fallback?.animation_url) setAnimationUrl(fallback.animation_url);
        } catch (_2) {}
      }
    };
    (async () => {
      await loadAnimation();
      requestLocationAndVerify();
    })();
  }, [token]);

  const requestLocationAndVerify = async () => {
    setShowError(false);
    const geoResult = await getCurrentPosition();
    
    if (!geoResult.success || !geoResult.coordinates) {
      setErrorMessage('Location access is required to confirm your delivery');
      setShowError(true);
      return;
    }

    await startVerification(geoResult.coordinates);
  };

  const handleRetry = () => {
    requestLocationAndVerify();
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
        navigate(`/delivery-record/${response.proof_id}`);
      } else if (response.verify_url) {
        const match = response.verify_url.match(/\/verify\/([^\/]+)$/);
        if (match) {
          navigate(`/delivery-record/${match[1]}`);
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
          setErrorMessage('Invalid delivery token');
          setShowError(true);
        } else {
          setErrorMessage(error.data?.error || 'Verification failed');
          setShowError(true);
        }
      } else {
        setErrorMessage('Network error. Please check your connection.');
        setShowError(true);
      }
    }
  };

  if (showError) {
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
              {errorMessage}
            </p>
            <button 
              onClick={handleRetry}
              className="text-xs text-[#1a1a2e] font-medium underline underline-offset-4 pointer-events-auto hover:text-[#5a5a6e] transition-colors"
            >
              Enable location and try again
            </button>
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
  }

  if (animationUrl) {
    const isVideo = /\.(mp4|webm|mov)$/i.test(animationUrl);
    return (
      <div className="h-[100dvh] bg-black relative overflow-hidden flex items-center justify-center">
        {isVideo ? (
          <video
            src={animationUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <img src={animationUrl} alt="" className="w-full h-full object-contain" />
        )}
      </div>
    );
  }

  return <div className="h-[100dvh] bg-black" />;
};

export default PremiumUnlockingHandler;

