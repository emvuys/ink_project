import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import authService from '../services/authService';
import { loginSchema } from '../utils/validation';
import logger from '../config/logger';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const validation = loginSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors,
        });
        return;
      }

      const { email, password } = validation.data;
      const result = await authService.login(email, password);

      res.json(result);
    } catch (error) {
      logger.error('Login error:', error);
      res.status(401).json({
        error: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await authService.getCurrentUser(req.user.id);
      res.json(user);
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(404).json({
        error: error instanceof Error ? error.message : 'User not found',
      });
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    res.json({ message: 'Logged out successfully' });
  }
}

export default new AuthController();
