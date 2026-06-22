import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  if (env.NODE_ENV === 'development') {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
  } else {
    console.error('Error:', err.message);
  }

  // Handle ApiError (our custom errors)
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(ApiResponse.error(err.message));
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json(ApiResponse.error('Validation error: ' + err.message));
    return;
  }

  // Handle Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0] || 'field';
    res.status(409).json(ApiResponse.error(`Duplicate value for ${field}`));
    return;
  }

  // Handle Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json(ApiResponse.error('Invalid ID format'));
    return;
  }

  // Default: internal server error
  const message = env.NODE_ENV === 'development' ? err.message : 'Internal server error';
  res.status(500).json(ApiResponse.error(message));
};
