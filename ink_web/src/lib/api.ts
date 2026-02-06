import { API_BASE_URL } from './config';
import type { VerifyRequest, VerifyResponse, VerifyErrorResponse, ProofRecord } from './types';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const text = await response.text();
    let data: Record<string, unknown>;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: response.ok ? 'Invalid response' : `Server error (${response.status})` };
    }

    if (!response.ok) {
      throw new ApiError(
        (data.error as string) || 'Request failed',
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error', 0);
  }
}

export async function verifyDelivery(
  request: VerifyRequest
): Promise<VerifyResponse> {
  return fetchApi<VerifyResponse>('/verify', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function retrieveProof(proofId: string): Promise<ProofRecord> {
  return fetchApi<ProofRecord>(`/retrieve/${proofId}`);
}

export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  return fetchApi('/health');
}

/** Get merchant name by NFC token (for loading animation) */
export async function getMerchantByToken(nfcToken: string): Promise<{ merchant: string }> {
  return fetchApi<{ merchant: string }>(`/merchant-by-token?nfc_token=${encodeURIComponent(nfcToken)}`);
}

/** Get merchant name by proof ID (for loading animation on record pages) */
export async function getMerchantByProofId(proofId: string): Promise<{ merchant: string }> {
  return fetchApi<{ merchant: string }>(`/merchant-by-proof/${encodeURIComponent(proofId)}`);
}

/** Get animation URL for merchant (public). Returns { animation_url: null } on 404 instead of throwing. */
export async function getMerchantAnimation(merchantName: string): Promise<{ animation_url: string | null; merchant_name?: string }> {
  const url = `${API_BASE_URL}/merchant-animation/${encodeURIComponent(merchantName)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (res.status === 404) {
      return { animation_url: null };
    }
    if (!res.ok) {
      throw new ApiError(data.error || 'Request failed', res.status, data);
    }
    return data;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError('Network error', 0);
  }
}

const ADMIN_TOKEN_KEY = 'ink_admin_token';

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

/** Admin login */
export async function adminLogin(password: string): Promise<{ token: string }> {
  return fetchApi<{ token: string }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

/** Admin: list merchant animations */
export async function adminListAnimations(): Promise<{ merchant_animations: { id: string; merchant_name: string; animation_url: string; updated_at?: string }[] }> {
  const token = getAdminToken();
  if (!token) throw new ApiError('Unauthorized', 401);
  const url = `${API_BASE_URL}/admin/merchant-animations`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new ApiError(data.error || 'Request failed', res.status, data);
  return data;
}

/** Read file as base64 (avoids multipart "Unexpected end of form" in Cloud Functions) */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.indexOf(',') >= 0 ? result.split(',')[1] : result;
      resolve(base64 || '');
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Admin: upload merchant animation (uses base64 to avoid multipart issues in Cloud Functions) */
export async function adminUploadAnimation(merchantName: string, file: File): Promise<{ merchant_name: string; slug: string; animation_url: string }> {
  const token = getAdminToken();
  if (!token) throw new ApiError('Unauthorized', 401);
  const animation_base64 = await fileToBase64(file);
  const url = `${API_BASE_URL}/admin/merchant-animation-base64`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      merchant: merchantName,
      animation_base64,
      filename: file.name,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new ApiError(data.error || 'Upload failed', res.status, data);
  return data;
}

/** Admin: delete merchant animation by id (slug) */
export async function adminDeleteAnimation(merchantId: string): Promise<{ deleted: string }> {
  const token = getAdminToken();
  if (!token) throw new ApiError('Unauthorized', 401);
  const url = `${API_BASE_URL}/admin/merchant-animation/${encodeURIComponent(merchantId)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new ApiError(data.error || 'Delete failed', res.status, data);
  return data;
}

export { ApiError };
export type { VerifyErrorResponse };

