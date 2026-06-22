import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { logger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { ApiResponse } from './utils/ApiResponse';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import tripRoutes from './routes/trip.routes';
import activityRoutes from './routes/activity.routes';
import packingRoutes from './routes/packing.routes';

const app = express();

// --- Middleware ---

// CORS
app.use(cors());

// JSON body parsing
app.use(express.json());

// Request logging
app.use(logger);

// Rate limiting on auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/auth', authLimiter);

// --- Routes ---

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json(ApiResponse.success({ status: 'ok', timestamp: new Date().toISOString() }, 'Server is running'));
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/trips', activityRoutes);
app.use('/api/trips', packingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json(ApiResponse.error(`Route ${req.method} ${req.path} not found`));
});

// Centralized error handler
app.use(errorHandler);

export default app;
