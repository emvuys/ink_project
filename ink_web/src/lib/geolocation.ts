import type { GpsCoordinates } from './types';

export interface GeolocationResult {
  success: boolean;
  coordinates?: GpsCoordinates;
  accuracy?: number;
  error?: string;
}

export async function getCurrentPosition(): Promise<GeolocationResult> {
  if (!navigator.geolocation) {
    return {
      success: false,
      error: 'Geolocation not supported',
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let errorMessage = 'Location access denied';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timeout';
            break;
        }

        resolve({
          success: false,
          error: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

export function getDeviceInfo(): string {
  const ua = navigator.userAgent;
  const platform = navigator.platform || 'Unknown';
  
  let browser = 'Unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  
  return `${browser} on ${platform}`;
}

