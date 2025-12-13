import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sphere } from "@/components/Sphere";
import LoadingState from "@/components/delivery/LoadingState";
import SuccessState from "@/components/delivery/SuccessState";
import PhoneVerificationState from "@/components/delivery/PhoneVerificationState";
import FailedState from "@/components/delivery/FailedState";
import InvalidLinkState from "@/components/delivery/InvalidLinkState";
import { verifyDelivery, ApiError } from "@/lib/api";
import { getCurrentPosition, getDeviceInfo } from "@/lib/geolocation";
import type { VerifyResponse } from "@/lib/types";

type ViewState = 'loading' | 'success' | 'phone' | 'failed' | 'invalid';

const Index = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<ViewState>('loading');
  const [verifyResult, setVerifyResult] = useState<VerifyResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [locationRequested, setLocationRequested] = useState(false);

  useEffect(() => {
    if (!token) {
      setState('invalid');
      return;
    }

    // Request location permission when page loads
    requestLocation();
  }, [token]);

  const requestLocation = async () => {
    setState('loading');
    setLocationRequested(true);

    const geoResult = await getCurrentPosition();
    
    if (!geoResult.success || !geoResult.coordinates) {
      // GPS denied or failed - show error page
      setErrorMessage('Location access is required to verify delivery');
      setState('failed');
      return;
    }

    // Location obtained, proceed with verification
    await startVerification(geoResult.coordinates);
  };

  const startVerification = async (coordinates?: { lat: number; lng: number }) => {
    setState('loading');

    // If coordinates not provided, try to get them
    let deliveryGps = coordinates;
    if (!deliveryGps) {
      const geoResult = await getCurrentPosition();
      if (!geoResult.success || !geoResult.coordinates) {
        setState('phone');
        return;
      }
      deliveryGps = geoResult.coordinates;
    }

    try {
      const response = await verifyDelivery({
        nfc_token: token!,
        delivery_gps: deliveryGps,
        device_info: getDeviceInfo(),
      });

      // Always show success page first, whether newly verified or already verified
      setVerifyResult(response);
      setState('success');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400 && error.data?.requires_phone) {
          setState('phone');
        } else if (error.status === 404) {
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

  const handlePhoneSubmit = async (phone: string) => {
    setIsPhoneLoading(true);
    setPhoneError('');

    const geoResult = await getCurrentPosition();
    
    try {
      const response = await verifyDelivery({
        nfc_token: token!,
        delivery_gps: geoResult.coordinates || { lat: 0, lng: 0 },
        device_info: getDeviceInfo(),
        phone_last4: phone,
      });

      // Always show success page first
      setVerifyResult(response);
      setState('success');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          // Phone verification failed - show error page
          setErrorMessage("Your location or phone number didn't match");
          setState('failed');
        } else if (error.status === 404) {
          setState('invalid');
        } else {
          setErrorMessage(error.data?.error || 'Verification failed');
          setState('failed');
        }
      } else {
        setErrorMessage('Network error. Please check your connection.');
        setState('failed');
      }
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const renderState = () => {
    switch (state) {
      case 'loading':
        return <LoadingState onRequestLocation={requestLocation} />;
      case 'success':
        return (
          <SuccessState 
            proofId={verifyResult?.proof_id}
            verifyUrl={verifyResult?.verify_url}
          />
        );
      case 'phone':
        return (
          <PhoneVerificationState 
            onSubmit={handlePhoneSubmit}
            error={phoneError}
            isLoading={isPhoneLoading}
          />
        );
      case 'failed':
        return <FailedState message={errorMessage} />;
      case 'invalid':
        return <InvalidLinkState />;
      default:
        return <LoadingState />;
    }
  };

  return renderState();
};

export default Index;
