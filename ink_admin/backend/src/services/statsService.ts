import prisma from '../config/database';

export class StatsService {
  async getDashboardStats() {
    const [
      totalMerchants,
      merchants,
      lowStockCount,
      pendingOrders,
    ] = await Promise.all([
      prisma.merchant.count(),
      prisma.merchant.findMany({
        select: { currentInventory: true, alertThreshold: true },
      }),
      prisma.merchant.count({
        where: { currentInventory: { lt: 3 } },
      }),
      prisma.fulfillmentOrder.count({
        where: { status: 'pending' },
      }),
    ]);

    const totalStickersInCirculation = merchants.reduce(
      (sum, m) => sum + m.currentInventory,
      0
    );

    return {
      totalMerchants,
      totalStickersInCirculation,
      lowStockCount,
      pendingOrders,
    };
  }
}

export default new StatsService();
