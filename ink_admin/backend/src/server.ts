import app from './app';
import { env } from './config/env';
import logger from './config/logger';
import prisma from './config/database';

const PORT = env.server.port;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${env.server.nodeEnv} mode`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, closing server gracefully`);
  
  server.close(async () => {
    logger.info('HTTP server closed');
    
    await prisma.$disconnect();
    logger.info('Database connection closed');
    
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
