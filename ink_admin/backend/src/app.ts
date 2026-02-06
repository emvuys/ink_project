import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth';
import merchantRoutes from './routes/merchants';
import orderRoutes from './routes/orders';
import videoRoutes from './routes/videos';
import statsRoutes from './routes/stats';

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: env.server.allowedOrigins,
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(env.upload.uploadDir));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/stats', statsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
