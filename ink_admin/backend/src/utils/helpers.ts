import { StockStatus } from '../types';

export const getStockStatus = (inventory: number, threshold: number = 5): StockStatus => {
  if (inventory > 10) {
    return { status: 'success', label: 'Healthy' };
  }
  if (inventory >= threshold) {
    return { status: 'warning', label: 'Low Stock' };
  }
  return { status: 'critical', label: 'Critical' };
};

export const generateOrderId = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  return `FO${timestamp}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i];
};
