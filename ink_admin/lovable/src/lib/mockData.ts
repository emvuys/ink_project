export interface Merchant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  currentInventory: number;
  lastRefillDate: string;
  totalStickersUsed: number;
  alertThreshold: number;
  usageHistory: UsageRecord[];
  refillHistory: RefillRecord[];
}

export interface UsageRecord {
  date: string;
  stickersUsed: number;
}

export interface RefillRecord {
  id: string;
  date: string;
  quantity: number;
  status: 'Pending' | 'Packed' | 'Shipped' | 'Delivered';
}

export interface FulfillmentOrder {
  id: string;
  orderDate: string;
  merchantId: string;
  merchantName: string;
  quantity: number;
  shippingAddress: string;
  status: 'Pending' | 'Packed' | 'Shipped' | 'Delivered';
}

export const merchants: Merchant[] = [
  {
    id: '1',
    name: 'MAAP',
    email: 'fulfillment@maap.cc',
    phone: '+1 (555) 123-4567',
    address: '123 Cycling Lane, Melbourne VIC 3000, Australia',
    currentInventory: 8,
    lastRefillDate: '2026-01-17',
    totalStickersUsed: 42,
    alertThreshold: 5,
    usageHistory: [
      { date: '2026-01-30', stickersUsed: 3 },
      { date: '2026-01-28', stickersUsed: 2 },
      { date: '2026-01-25', stickersUsed: 4 },
      { date: '2026-01-22', stickersUsed: 2 },
      { date: '2026-01-19', stickersUsed: 3 },
    ],
    refillHistory: [
      { id: 'R001', date: '2026-01-17', quantity: 20, status: 'Delivered' },
      { id: 'R002', date: '2025-12-20', quantity: 25, status: 'Delivered' },
    ],
  },
  {
    id: '2',
    name: 'Kylie Cosmetics',
    email: 'logistics@kyliecosmetics.com',
    phone: '+1 (555) 987-6543',
    address: '456 Beauty Blvd, Los Angeles CA 90210, USA',
    currentInventory: 2,
    lastRefillDate: '2025-12-31',
    totalStickersUsed: 98,
    alertThreshold: 5,
    usageHistory: [
      { date: '2026-01-30', stickersUsed: 5 },
      { date: '2026-01-29', stickersUsed: 4 },
      { date: '2026-01-27', stickersUsed: 6 },
      { date: '2026-01-25', stickersUsed: 3 },
      { date: '2026-01-23', stickersUsed: 5 },
    ],
    refillHistory: [
      { id: 'R003', date: '2025-12-31', quantity: 25, status: 'Delivered' },
      { id: 'R004', date: '2025-11-15', quantity: 30, status: 'Delivered' },
      { id: 'R005', date: '2025-10-01', quantity: 50, status: 'Delivered' },
    ],
  },
];

export const fulfillmentOrders: FulfillmentOrder[] = [
  {
    id: 'FO001',
    orderDate: '2026-01-30',
    merchantId: '2',
    merchantName: 'Kylie Cosmetics',
    quantity: 25,
    shippingAddress: '456 Beauty Blvd, Los Angeles CA 90210, USA',
    status: 'Pending',
  },
  {
    id: 'FO002',
    orderDate: '2026-01-29',
    merchantId: '1',
    merchantName: 'MAAP',
    quantity: 15,
    shippingAddress: '123 Cycling Lane, Melbourne VIC 3000, Australia',
    status: 'Packed',
  },
];

export function getStockStatus(inventory: number): 'success' | 'warning' | 'critical' {
  if (inventory > 10) return 'success';
  if (inventory >= 3) return 'warning';
  return 'critical';
}

export function getStatusLabel(status: 'success' | 'warning' | 'critical'): string {
  switch (status) {
    case 'success': return 'Healthy';
    case 'warning': return 'Low Stock';
    case 'critical': return 'Critical';
  }
}

export function getTotalStickersInCirculation(): number {
  return merchants.reduce((sum, m) => sum + m.currentInventory, 0);
}

export function getLowStockCount(): number {
  return merchants.filter(m => m.currentInventory < 3).length;
}

export function getPendingOrdersCount(): number {
  return fulfillmentOrders.filter(o => o.status === 'Pending').length;
}
