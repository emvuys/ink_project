import type { GpsCoordinates } from './types';

interface GeocodeResult {
  success: boolean;
  address?: string;
  error?: string;
}

/**
 * Convert GPS coordinates to human-readable address using OpenStreetMap Nominatim API
 * Free service, no API key required
 */
export async function reverseGeocode(coordinates: GpsCoordinates): Promise<GeocodeResult> {
  try {
    const { lat, lng } = coordinates;
    
    // Use Nominatim API (OpenStreetMap's geocoding service)
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'INK-Delivery-Verification/1.0', // Required by Nominatim
      },
    });

    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }

    const data = await response.json();

    if (data.error) {
      return {
        success: false,
        error: 'Address not found',
      };
    }

    // Extract useful address components
    const address = data.address || {};
    const parts: string[] = [];

    // Build address from components (most specific to least specific)
    if (address.house_number) parts.push(address.house_number);
    if (address.road) parts.push(address.road);
    if (address.suburb || address.neighbourhood) parts.push(address.suburb || address.neighbourhood);
    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village);
    }
    if (address.state) parts.push(address.state);
    if (address.country) parts.push(address.country);

    const formattedAddress = parts.length > 0 
      ? parts.join(', ')
      : data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

    return {
      success: true,
      address: formattedAddress,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      success: false,
      error: 'Unable to fetch address',
    };
  }
}

/**
 * Get a shortened version of the address (for display)
 */
export function getShortAddress(fullAddress: string): string {
  const parts = fullAddress.split(', ');
  // Return first 3 parts or full address if shorter
  return parts.slice(0, 3).join(', ');
}

