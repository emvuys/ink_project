import { Response } from 'express';
import { AuthRequest } from '../types';
import statsService from '../services/statsService';
import logger from '../config/logger';

export class StatsController {
  async getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await statsService.getDashboardStats();
      res.json(stats);
    } catch (error) {
      logger.error('Get dashboard stats error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch statistics',
      });
    }
  }
}

export default new StatsController();
