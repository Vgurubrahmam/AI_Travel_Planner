import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * POST /api/auth/register
 * Register a new user
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.registerUser(name, email, password);

    res.status(201).json(ApiResponse.success(result, 'User registered successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Login a user
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);

    res.status(200).json(ApiResponse.success(result, 'Login successful'));
  } catch (error) {
    next(error);
  }
};
