import prisma from '../config/database';
import { VideoQuery } from '../types';
import { formatFileSize } from '../utils/helpers';
import logger from '../config/logger';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

export class VideoService {
  async getVideos(query: VideoQuery) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '50');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.merchantName = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    const [videos, total] = await Promise.all([
      prisma.merchantVideo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.merchantVideo.count({ where }),
    ]);

    return {
      data: videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getVideoById(id: string) {
    const video = await prisma.merchantVideo.findUnique({
      where: { id },
    });

    if (!video) {
      throw new Error('Video not found');
    }

    return video;
  }

  async createVideo(
    data: {
      merchantName: string;
      isLooping: boolean;
    },
    file: Express.Multer.File
  ) {
    const videoUrl = `/uploads/${file.filename}`;
    const format = file.mimetype === 'image/gif' ? 'GIF' : 'MP4';

    const video = await prisma.merchantVideo.create({
      data: {
        merchantName: data.merchantName,
        videoUrl,
        fileSize: file.size,
        format,
        isLooping: data.isLooping,
      },
    });

    logger.info(`Video created for merchant: ${data.merchantName}`);
    return video;
  }

  async updateVideo(
    id: string,
    data: {
      merchantName?: string;
      isLooping?: boolean;
    },
    file?: Express.Multer.File
  ) {
    const existingVideo = await prisma.merchantVideo.findUnique({
      where: { id },
    });

    if (!existingVideo) {
      throw new Error('Video not found');
    }

    const updateData: any = {};

    if (data.merchantName) {
      updateData.merchantName = data.merchantName;
    }

    if (data.isLooping !== undefined) {
      updateData.isLooping = data.isLooping;
    }

    if (file) {
      // Delete old file
      const oldFilePath = path.join(process.cwd(), existingVideo.videoUrl);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      // Update with new file
      updateData.videoUrl = `/uploads/${file.filename}`;
      updateData.fileSize = file.size;
      updateData.format = file.mimetype === 'image/gif' ? 'GIF' : 'MP4';
    }

    const video = await prisma.merchantVideo.update({
      where: { id },
      data: updateData,
    });

    logger.info(`Video updated: ${id}`);
    return video;
  }

  async deleteVideo(id: string) {
    const video = await prisma.merchantVideo.findUnique({
      where: { id },
    });

    if (!video) {
      throw new Error('Video not found');
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), video.videoUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.merchantVideo.delete({
      where: { id },
    });

    logger.info(`Video deleted: ${id}`);
  }
}

export default new VideoService();
