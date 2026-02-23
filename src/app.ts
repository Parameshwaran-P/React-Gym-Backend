import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';
import { platformMiddleware } from './middleware/platform.middleware';
import routes from './routes/index';
// import logger from '../config/logger';

const app = express();

// Middleware
app.use(cors({
  origin: env.CORS_ORIGINS,
  credentials: true,
}));
app.use(express.json());
app.use(platformMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// Error handler (must be last)
app.use(errorMiddleware);

export default app;