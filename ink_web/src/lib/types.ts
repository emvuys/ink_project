export interface GpsCoordinates {
  lat: number;
  lng: number;
}

export interface VerifyRequest {
  nfc_token: string;
  delivery_gps: GpsCoordinates;
  device_info?: string;
  phone_last4?: string;
}

export interface VerifyResponse {
  proof_id: string;
  verification_status: string;
  gps_verdict: 'pass' | 'near' | 'flagged';
  distance_meters: number;
  signature: string;
  verify_url: string;
  already_verified?: boolean; // Indicates if this was already verified before
}

export interface VerifyErrorResponse {
  error: string;
  requires_phone?: boolean;
}

export interface EnrollmentData {
  timestamp: string;
  shipping_address_gps: GpsCoordinates;
  warehouse_gps?: GpsCoordinates;
  photo_urls: string[];
  photo_hashes: string[];
}

export interface DeliveryData {
  timestamp: string;
  delivery_gps: GpsCoordinates;
  device_info: string;
  gps_verdict: 'pass' | 'near' | 'flagged';
  phone_verified: boolean;
}

export interface ProofRecord {
  proof_id: string;
  order_id: string;
  nfc_uid?: string;
  merchant?: string;
  order_url?: string | null;
  enrollment: EnrollmentData;
  delivery: DeliveryData | null;
  signature: string;
  public_key: string;
  key_id: string;
}

