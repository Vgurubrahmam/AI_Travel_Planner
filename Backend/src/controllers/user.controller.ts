import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../types';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

/**
 * GET /api/users/profile
 * Get authenticated user's profile
 */
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.status(200).json(
      ApiResponse.success(
        {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        'Profile retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};
