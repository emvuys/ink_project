import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createMerchantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  alertThreshold: z.number().int().positive().default(5),
});

export const updateMerchantSchema = createMerchantSchema.partial();

export const updateThresholdSchema = z.object({
  alertThreshold: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  merchantId: z.string().uuid('Invalid merchant ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  shippingAddress: z.string().min(1, 'Shipping address is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'packed', 'shipped', 'delivered']),
});

export const createVideoSchema = z.object({
  merchantName: z.string().min(1, 'Merchant name is required'),
  isLooping: z.boolean().default(true),
});

export const updateVideoSchema = z.object({
  merchantName: z.string().min(1).optional(),
  isLooping: z.boolean().optional(),
});
