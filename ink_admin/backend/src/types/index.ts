import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface MerchantQuery extends PaginationQuery {
  search?: string;
  status?: 'all' | 'low' | 'critical';
  sortBy?: 'name' | 'inventory' | 'lastRefill' | 'totalUsed';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderQuery extends PaginationQuery {
  status?: string;
  merchantId?: string;
}

export interface VideoQuery extends PaginationQuery {
  search?: string;
}

export type OrderStatus = 'pending' | 'packed' | 'shipped' | 'delivered';

export interface StockStatus {
  status: 'success' | 'warning' | 'critical';
  label: string;
}
