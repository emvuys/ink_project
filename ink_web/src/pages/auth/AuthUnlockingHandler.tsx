import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sphere } from "@/components/Sphere";
import { verifyDelivery, ApiError, getMerchantByToken, getMerchantAnimation } from "@/lib/api";
import { getCurrentPosition, getDeviceInfo } from "@/lib/geolocation";

type LocationPhase = 'requesting' | 'done';

const AuthUnlockingHandler = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showError, setShowError] = useState(false);
  const [isInvalidToken, setIsInvalidToken] = useState(false);
  const [savedCoordinates, setSavedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [animationUrl, setAnimationUrl] = useState<string | null>(null);
  const [locationPhase, setLocationPhase] = useState<LocationPhase>('requesting');
  const [isVerifying, setIsVerifying] = useState(false);

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
    setIsInvalidToken(false);
    setLocationPhase('requesting');
    const geoResult = await getCurrentPosition();

    // Only use real coordinates when user approved; otherwise use placeholder so delivery record hides map
    const coordinates =
      geoResult.success && geoResult.coordinates
        ? geoResult.coordinates
        : { lat: 0, lng: 0 };

    setSavedCoordinates(coordinates);
    setLocationPhase('done');
    await startVerification(coordinates);
  };

  const handleRetry = () => {
    // Phone verification disabled: always retry location/verify (no redirect to phone-verify)
    requestLocationAndVerify();
  };

  const startVerification = async (coordinates: { lat: number; lng: number }) => {
    setIsVerifying(true);
    try {
      const deviceInfo = getDeviceInfo();
      const response = await verifyDelivery({
        nfc_token: token!,
        delivery_gps: {
          lat: Number(coordinates.lat),
          lng: Number(coordinates.lng),
        },
        device_info: deviceInfo,
        delivery_type: 'authenticate',
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
      setIsVerifying(false);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          setErrorMessage('Invalid delivery token');
          setIsInvalidToken(true);
          setShowError(true);
        } else if (error.status === 400 && error.data?.requires_phone) {
          setErrorMessage(error.data?.error || 'Verification failed');
          setShowError(true);
        } else if (error.status === 400 && error.data?.code === 'TOO_SOON_AFTER_ENROLL') {
          const sec = error.data?.wait_seconds;
          setErrorMessage(
            sec != null && sec > 0
              ? `Please wait at least 2 minutes after enrollment (about ${sec} seconds left)`
              : 'Please wait at least 2 minutes after enrollment before confirming delivery'
          );
          setShowError(true);
        } else if (error.status === 429) {
          setErrorMessage(error.data?.error || 'Too many requests. Please try again in a few minutes.');
          setShowError(true);
        } else {
          const msg =
            error.data?.error ||
            error.message ||
            (error.status ? `Verification failed (${error.status})` : 'Verification failed');
          setErrorMessage(msg);
          setShowError(true);
        }
      } else {
        const msg =
          error instanceof Error ? error.message : 'Network error. Please check your connection.';
        setErrorMessage(msg);
        setShowError(true);
      }
    }
  };

  if ((isVerifying || locationPhase === 'requesting') && animationUrl) {
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

  if (locationPhase === 'requesting' && !animationUrl) {
    return (
      <div className="h-[100dvh] bg-background relative overflow-hidden">
        <Sphere />
        <main className="absolute inset-0 flex items-center justify-center px-6 z-10" style={{ transform: 'translateY(-10%)' }}>
          <div className="text-center animate-fade-in max-w-sm">
            <h1
              className="text-2xl md:text-3xl font-medium tracking-tight mb-4 text-[#1a1a2e]"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Allow location access
            </h1>
            <p className="text-sm text-[#5a5a6e] mb-6">
              To confirm your delivery and show it on the map, please allow or deny location when your browser asks.
            </p>
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#1a1a2e] border-t-transparent" aria-hidden />
          </div>
        </main>
        <div className="absolute bottom-8 left-0 right-0 text-center z-10">
          <a href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Privacy Policy
          </a>
        </div>
      </div>
    );
  }

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
              Try again
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

export default AuthUnlockingHandler;

