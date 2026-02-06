import { Response } from 'express';
import { AuthRequest, OrderQuery } from '../types';
import orderService from '../services/orderService';
import { createOrderSchema, updateOrderStatusSchema } from '../utils/validation';
import logger from '../config/logger';

export class OrderController {
  async getOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const query = req.query as OrderQuery;
      const result = await orderService.getOrders(query);
      res.json(result);
    } catch (error) {
      logger.error('Get orders error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
      });
    }
  }

  async getOrderById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);
      res.json(order);
    } catch (error) {
      logger.error('Get order by ID error:', error);
      res.status(404).json({
        error: error instanceof Error ? error.message : 'Order not found',
      });
    }
  }

  async createOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const validation = createOrderSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors,
        });
        return;
      }

      const order = await orderService.createOrder(validation.data);
      res.status(201).json(order);
    } catch (error) {
      logger.error('Create order error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to create order',
      });
    }
  }

  async updateOrderStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validation = updateOrderStatusSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors,
        });
        return;
      }

      const order = await orderService.updateOrderStatus(id, validation.data.status);
      res.json(order);
    } catch (error) {
      logger.error('Update order status error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to update order status',
      });
    }
  }
}

export default new OrderController();
