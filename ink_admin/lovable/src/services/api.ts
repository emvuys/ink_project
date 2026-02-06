const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(response.status, error.error || error.message || 'Request failed');
  }
  
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ token: string; user: User }>(response);
  },

  logout: async () => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(response);
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(response);
  },
};

// Merchants API
export const merchantsApi = {
  getAll: async (params?: MerchantQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString();
    const response = await fetch(`${API_URL}/merchants${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PaginatedResponse<Merchant>>(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/merchants/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Merchant>(response);
  },

  create: async (data: CreateMerchantData) => {
    const response = await fetch(`${API_URL}/merchants`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Merchant>(response);
  },

  update: async (id: string, data: Partial<CreateMerchantData>) => {
    const response = await fetch(`${API_URL}/merchants/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Merchant>(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/merchants/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(response);
  },

  updateThreshold: async (id: string, alertThreshold: number) => {
    const response = await fetch(`${API_URL}/merchants/${id}/threshold`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ alertThreshold }),
    });
    return handleResponse<Merchant>(response);
  },

  getUsageHistory: async (id: string) => {
    const response = await fetch(`${API_URL}/merchants/${id}/usage`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<UsageRecord[]>(response);
  },

  getRefillHistory: async (id: string) => {
    const response = await fetch(`${API_URL}/merchants/${id}/refills`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<RefillRecord[]>(response);
  },
};

// Orders API
export const ordersApi = {
  getAll: async (params?: OrderQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.merchantId) searchParams.set('merchantId', params.merchantId);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString();
    const response = await fetch(`${API_URL}/orders${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PaginatedResponse<FulfillmentOrder>>(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<FulfillmentOrder>(response);
  },

  create: async (data: CreateOrderData) => {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<FulfillmentOrder>(response);
  },

  updateStatus: async (id: string, status: OrderStatus) => {
    const response = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<FulfillmentOrder>(response);
  },
};

// Videos API
export const videosApi = {
  getAll: async (params?: VideoQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString();
    const response = await fetch(`${API_URL}/videos${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PaginatedResponse<MerchantVideo>>(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/videos/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<MerchantVideo>(response);
  },

  create: async (data: FormData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/videos`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: data,
    });
    return handleResponse<MerchantVideo>(response);
  },

  update: async (id: string, data: FormData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/videos/${id}`, {
      method: 'PUT',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: data,
    });
    return handleResponse<MerchantVideo>(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/videos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(response);
  },
};

// Stats API
export const statsApi = {
  getDashboard: async () => {
    const response = await fetch(`${API_URL}/stats/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DashboardStats>(response);
  },
};

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Merchant {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  currentInventory: number;
  alertThreshold: number;
  totalStickersUsed: number;
  lastRefillDate: string | null;
  createdAt: string;
  updatedAt: string;
  usageRecords?: UsageRecord[];
  fulfillmentOrders?: FulfillmentOrder[];
  stockStatus?: {
    status: 'success' | 'warning' | 'critical';
    label: string;
  };
}

export interface UsageRecord {
  id: string;
  merchantId: string;
  date: string;
  stickersUsed: number;
  createdAt: string;
}

export interface RefillRecord {
  id: string;
  date: string;
  quantity: number;
  status: string;
}

export interface FulfillmentOrder {
  id: string;
  merchantId: string;
  orderDate: string;
  quantity: number;
  shippingAddress: string;
  status: OrderStatus;
  packedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  merchant?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface MerchantVideo {
  id: string;
  merchantName: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  fileSize: number | null;
  format: string | null;
  isLooping: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalMerchants: number;
  totalStickersInCirculation: number;
  lowStockCount: number;
  pendingOrders: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export type OrderStatus = 'pending' | 'packed' | 'shipped' | 'delivered';

export interface MerchantQueryParams {
  search?: string;
  status?: 'all' | 'low' | 'critical';
  sortBy?: 'name' | 'inventory' | 'lastRefill' | 'totalUsed';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface OrderQueryParams {
  status?: string;
  merchantId?: string;
  page?: number;
  limit?: number;
}

export interface VideoQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateMerchantData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  alertThreshold?: number;
}

export interface CreateOrderData {
  merchantId: string;
  quantity: number;
  shippingAddress: string;
}

export { ApiError };
