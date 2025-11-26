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

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Request failed',
        response.status,
        data
      );
    }

    return data;
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

export { ApiError };
export type { VerifyErrorResponse };

