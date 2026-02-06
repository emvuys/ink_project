import prisma from '../config/database';
import { OrderQuery, OrderStatus } from '../types';
import { generateOrderId } from '../utils/helpers';
import logger from '../config/logger';

export class OrderService {
  async getOrders(query: OrderQuery) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '50');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.merchantId) {
      where.merchantId = query.merchantId;
    }

    const [orders, total] = await Promise.all([
      prisma.fulfillmentOrder.findMany({
        where,
        orderBy: { orderDate: 'desc' },
        skip,
        take: limit,
        include: {
          merchant: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.fulfillmentOrder.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(id: string) {
    const order = await prisma.fulfillmentOrder.findUnique({
      where: { id },
      include: {
        merchant: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  async createOrder(data: {
    merchantId: string;
    quantity: number;
    shippingAddress: string;
  }) {
    const merchant = await prisma.merchant.findUnique({
      where: { id: data.merchantId },
    });

    if (!merchant) {
      throw new Error('Merchant not found');
    }

    const order = await prisma.fulfillmentOrder.create({
      data: {
        id: generateOrderId(),
        merchantId: data.merchantId,
        orderDate: new Date(),
        quantity: data.quantity,
        shippingAddress: data.shippingAddress,
        status: 'pending',
      },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logger.info(`Order created: ${order.id} for ${merchant.name}`);
    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await prisma.fulfillmentOrder.findUnique({
      where: { id },
      include: { merchant: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const updateData: any = { status };

    // Set timestamps based on status
    const now = new Date();
    if (status === 'packed' && !order.packedAt) {
      updateData.packedAt = now;
    }
    if (status === 'shipped' && !order.shippedAt) {
      updateData.shippedAt = now;
    }
    if (status === 'delivered' && !order.deliveredAt) {
      updateData.deliveredAt = now;
    }

    const updatedOrder = await prisma.fulfillmentOrder.update({
      where: { id },
      data: updateData,
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update merchant inventory when order is delivered
    if (status === 'delivered' && order.status !== 'delivered') {
      await prisma.merchant.update({
        where: { id: order.merchantId },
        data: {
          currentInventory: {
            increment: order.quantity,
          },
          lastRefillDate: now,
        },
      });

      logger.info(
        `Merchant ${order.merchant.name} inventory increased by ${order.quantity}`
      );
    }

    logger.info(`Order ${id} status updated to ${status}`);
    return updatedOrder;
  }

  async getStatistics() {
    const [pending, packed, shipped] = await Promise.all([
      prisma.fulfillmentOrder.count({ where: { status: 'pending' } }),
      prisma.fulfillmentOrder.count({ where: { status: 'packed' } }),
      prisma.fulfillmentOrder.count({ where: { status: 'shipped' } }),
    ]);

    return {
      pending,
      packed,
      shipped,
    };
  }
}

export default new OrderService();
