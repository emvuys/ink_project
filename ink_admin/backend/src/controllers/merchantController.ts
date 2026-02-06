import { Response } from 'express';
import { AuthRequest, MerchantQuery } from '../types';
import merchantService from '../services/merchantService';
import {
  createMerchantSchema,
  updateMerchantSchema,
  updateThresholdSchema,
} from '../utils/validation';
import logger from '../config/logger';

export class MerchantController {
  async getMerchants(req: AuthRequest, res: Response): Promise<void> {
    try {
      const query = req.query as MerchantQuery;
      const result = await merchantService.getMerchants(query);
      res.json(result);
    } catch (error) {
      logger.error('Get merchants error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch merchants',
      });
    }
  }

  async getMerchantById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const merchant = await merchantService.getMerchantById(id);
      res.json(merchant);
    } catch (error) {
      logger.error('Get merchant by ID error:', error);
      res.status(404).json({
        error: error instanceof Error ? error.message : 'Merchant not found',
      });
    }
  }

  async createMerchant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const validation = createMerchantSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors,
        });
        return;
      }

      const merchant = await merchantService.createMerchant(validation.data);
      res.status(201).json(merchant);
    } catch (error) {
      logger.error('Create merchant error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to create merchant',
      });
    }
  }

  async updateMerchant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validation = updateMerchantSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors,
        });
        return;
      }

      const merchant = await merchantService.updateMerchant(id, validation.data);
      res.json(merchant);
    } catch (error) {
      logger.error('Update merchant error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to update merchant',
      });
    }
  }

  async deleteMerchant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await merchantService.deleteMerchant(id);
      res.status(204).send();
    } catch (error) {
      logger.error('Delete merchant error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to delete merchant',
      });
    }
  }

  async updateAlertThreshold(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validation = updateThresholdSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors,
        });
        return;
      }

      const merchant = await merchantService.updateAlertThreshold(
        id,
        validation.data.alertThreshold
      );
      res.json(merchant);
    } catch (error) {
      logger.error('Update alert threshold error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to update threshold',
      });
    }
  }

  async getUsageHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const history = await merchantService.getUsageHistory(id);
      res.json(history);
    } catch (error) {
      logger.error('Get usage history error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch usage history',
      });
    }
  }

  async getRefillHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const history = await merchantService.getRefillHistory(id);
      res.json(history);
    } catch (error) {
      logger.error('Get refill history error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch refill history',
      });
    }
  }
}

export default new MerchantController();
