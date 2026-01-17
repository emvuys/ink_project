import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sphere } from "@/components/Sphere";
import LoadingState from "@/components/delivery/LoadingState";
import FailedState from "@/components/delivery/FailedState";
import InvalidLinkState from "@/components/delivery/InvalidLinkState";
import { verifyDelivery, ApiError } from "@/lib/api";
import { getCurrentPosition, getDeviceInfo } from "@/lib/geolocation";

type ViewState = 'loading' | 'failed' | 'invalid';

const Index = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<ViewState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setState('invalid');
      return;
    }

    requestLocation();
  }, [token]);

  const requestLocation = async () => {
    setState('loading');

    const geoResult = await getCurrentPosition();
    
    if (!geoResult.success || !geoResult.coordinates) {
      setErrorMessage('Location access is required to verify delivery');
      setState('failed');
      return;
    }

    await startVerification(geoResult.coordinates);
  };

  const startVerification = async (coordinates: { lat: number; lng: number }) => {
    setState('loading');

    try {
      const deviceInfo = getDeviceInfo();
      const response = await verifyDelivery({
        nfc_token: token!,
        delivery_gps: coordinates,
        device_info: deviceInfo,
      });

      if (response.proof_id) {
        navigate(`/authenticated-delivery-record/${response.proof_id}`);
      } else if (response.verify_url) {
        const match = response.verify_url.match(/\/verify\/([^\/]+)$/);
        if (match) {
          navigate(`/authenticated-delivery-record/${match[1]}`);
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
        } else if (error.status === 400 && error.data?.requires_phone) {
          // Phone verification required - navigate to phone verification page
          const deviceInfo = getDeviceInfo();
          navigate(`/phone-verify/${token}?lat=${coordinates.lat}&lng=${coordinates.lng}&device=${encodeURIComponent(deviceInfo)}`);
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
      case 'loading':
        return <LoadingState onRequestLocation={requestLocation} />;
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
