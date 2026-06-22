import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

/**
 * Generate JWT token for a user
 */
export function generateToken(userId: string, email: string): string {
  return jwt.sign({ id: userId, email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

/**
 * Register a new user
 */
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ user: { id: string; name: string; email: string }; token: string }> {
  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw ApiError.badRequest('Email already registered');
  }

  // Create user
  const user = await User.create({ name, email, password });

  // Generate token
  const token = generateToken(user._id.toString(), user.email);

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
    token,
  };
}

/**
 * Login a user
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ user: { id: string; name: string; email: string }; token: string }> {
  // Find user and include password field
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user._id.toString(), user.email);

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
    token,
  };
}
