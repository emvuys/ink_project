import prisma from '../config/database';
import { MerchantQuery } from '../types';
import { getStockStatus } from '../utils/helpers';
import logger from '../config/logger';

export class MerchantService {
  async getMerchants(query: MerchantQuery) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '50');
    const skip = (page - 1) * limit;

    const where: any = {};

    // Search filter
    if (query.search) {
      where.name = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    // Status filter
    if (query.status === 'critical') {
      where.currentInventory = { lt: 3 };
    } else if (query.status === 'low') {
      where.OR = [
        { currentInventory: { lt: 3 } },
        {
          AND: [
            { currentInventory: { gte: 3 } },
            { currentInventory: { lt: 10 } },
          ],
        },
      ];
    }

    // Sorting
    const orderBy: any = {};
    const sortBy = query.sortBy || 'name';
    const sortOrder = query.sortOrder || 'asc';

    switch (sortBy) {
      case 'inventory':
        orderBy.currentInventory = sortOrder;
        break;
      case 'lastRefill':
        orderBy.lastRefillDate = sortOrder;
        break;
      case 'totalUsed':
        orderBy.totalStickersUsed = sortOrder;
        break;
      default:
        orderBy.name = sortOrder;
    }

    const [merchants, total] = await Promise.all([
      prisma.merchant.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          usageRecords: {
            orderBy: { date: 'desc' },
            take: 5,
          },
          fulfillmentOrders: {
            orderBy: { orderDate: 'desc' },
            where: {
              status: 'delivered',
            },
            take: 5,
          },
        },
      }),
      prisma.merchant.count({ where }),
    ]);

    const merchantsWithStatus = merchants.map((merchant) => ({
      ...merchant,
      stockStatus: getStockStatus(merchant.currentInventory, merchant.alertThreshold),
    }));

    return {
      data: merchantsWithStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getMerchantById(id: string) {
    const merchant = await prisma.merchant.findUnique({
      where: { id },
      include: {
        usageRecords: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        fulfillmentOrders: {
          orderBy: { orderDate: 'desc' },
        },
      },
    });

    if (!merchant) {
      throw new Error('Merchant not found');
    }

    return {
      ...merchant,
      stockStatus: getStockStatus(merchant.currentInventory, merchant.alertThreshold),
    };
  }

  async createMerchant(data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    alertThreshold?: number;
  }) {
    const merchant = await prisma.merchant.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        alertThreshold: data.alertThreshold || 5,
        currentInventory: 0,
        totalStickersUsed: 0,
      },
    });

    logger.info(`Merchant created: ${merchant.name}`);
    return merchant;
  }

  async updateMerchant(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      alertThreshold?: number;
    }
  ) {
    const merchant = await prisma.merchant.update({
      where: { id },
      data,
    });

    logger.info(`Merchant updated: ${merchant.name}`);
    return merchant;
  }

  async deleteMerchant(id: string) {
    // Check for pending orders
    const pendingOrders = await prisma.fulfillmentOrder.count({
      where: {
        merchantId: id,
        status: { in: ['pending', 'packed', 'shipped'] },
      },
    });

    if (pendingOrders > 0) {
      throw new Error('Cannot delete merchant with pending orders');
    }

    await prisma.merchant.delete({
      where: { id },
    });

    logger.info(`Merchant deleted: ${id}`);
  }

  async updateAlertThreshold(id: string, threshold: number) {
    const merchant = await prisma.merchant.update({
      where: { id },
      data: { alertThreshold: threshold },
    });

    logger.info(`Alert threshold updated for ${merchant.name}: ${threshold}`);
    return merchant;
  }

  async getUsageHistory(merchantId: string) {
    return prisma.usageRecord.findMany({
      where: { merchantId },
      orderBy: { date: 'desc' },
    });
  }

  async getRefillHistory(merchantId: string) {
    return prisma.fulfillmentOrder.findMany({
      where: {
        merchantId,
        status: 'delivered',
      },
      orderBy: { deliveredAt: 'desc' },
    });
  }
}

export default new MerchantService();
