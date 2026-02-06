import { Response } from 'express';
import { AuthRequest, VideoQuery } from '../types';
import videoService from '../services/videoService';
import { createVideoSchema, updateVideoSchema } from '../utils/validation';
import logger from '../config/logger';

export class VideoController {
  async getVideos(req: AuthRequest, res: Response): Promise<void> {
    try {
      const query = req.query as VideoQuery;
      const result = await videoService.getVideos(query);
      res.json(result);
    } catch (error) {
      logger.error('Get videos error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch videos',
      });
    }
  }

  async getVideoById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const video = await videoService.getVideoById(id);
      res.json(video);
    } catch (error) {
      logger.error('Get video by ID error:', error);
      res.status(404).json({
        error: error instanceof Error ? error.message : 'Video not found',
      });
    }
  }

  async createVideo(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Video file is required' });
        return;
      }

      const validation = createVideoSchema.safeParse({
        merchantName: req.body.merchantName,
        isLooping: req.body.isLooping === 'true',
      });

      if (!validation.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors,
        });
        return;
      }

      const video = await videoService.createVideo(validation.data, req.file);
      res.status(201).json(video);
    } catch (error) {
      logger.error('Create video error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to create video',
      });
    }
  }

  async updateVideo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validation = updateVideoSchema.safeParse({
        merchantName: req.body.merchantName,
        isLooping: req.body.isLooping ? req.body.isLooping === 'true' : undefined,
      });

      if (!validation.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors,
        });
        return;
      }

      const video = await videoService.updateVideo(id, validation.data, req.file);
      res.json(video);
    } catch (error) {
      logger.error('Update video error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to update video',
      });
    }
  }

  async deleteVideo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await videoService.deleteVideo(id);
      res.status(204).send();
    } catch (error) {
      logger.error('Delete video error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to delete video',
      });
    }
  }
}

export default new VideoController();
