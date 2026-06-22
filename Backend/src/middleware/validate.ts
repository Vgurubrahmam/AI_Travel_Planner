import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { BUDGET_TIERS, MAX_TRIP_DURATION, MIN_TRIP_DURATION, MAX_INTERESTS } from '../utils/constants';

// Validate registration input
export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email, password } = req.body;

  const errors: string[] = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest(errors.join(', ')));
  }

  next();
};

// Validate login input
export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;

  const errors: string[] = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest(errors.join(', ')));
  }

  next();
};

// Validate trip creation input
export const validateCreateTrip = (req: Request, res: Response, next: NextFunction): void => {
  const { destination, duration, budgetTier, interests } = req.body;

  const errors: string[] = [];

  if (!destination || typeof destination !== 'string' || destination.trim().length === 0) {
    errors.push('Destination is required');
  }

  if (!duration || typeof duration !== 'number') {
    errors.push('Duration is required and must be a number');
  } else if (duration < MIN_TRIP_DURATION || duration > MAX_TRIP_DURATION) {
    errors.push(`Duration must be between ${MIN_TRIP_DURATION} and ${MAX_TRIP_DURATION} days`);
  }

  if (!budgetTier || !BUDGET_TIERS.includes(budgetTier)) {
    errors.push(`Budget tier must be one of: ${BUDGET_TIERS.join(', ')}`);
  }

  if (!interests || !Array.isArray(interests) || interests.length === 0) {
    errors.push('At least one interest is required');
  } else if (interests.length > MAX_INTERESTS) {
    errors.push(`Maximum ${MAX_INTERESTS} interests allowed`);
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest(errors.join(', ')));
  }

  next();
};

// Validate add activity input
export const validateAddActivity = (req: Request, res: Response, next: NextFunction): void => {
  const { time, activity, description, location } = req.body;

  const errors: string[] = [];

  if (!time || typeof time !== 'string') errors.push('Time is required');
  if (!activity || typeof activity !== 'string') errors.push('Activity name is required');
  if (!description || typeof description !== 'string') errors.push('Description is required');
  if (!location || typeof location !== 'string') errors.push('Location is required');

  if (errors.length > 0) {
    return next(ApiError.badRequest(errors.join(', ')));
  }

  next();
};

// Validate packing item input
export const validateAddPackingItem = (req: Request, res: Response, next: NextFunction): void => {
  const { item, category } = req.body;

  const errors: string[] = [];

  if (!item || typeof item !== 'string' || item.trim().length === 0) {
    errors.push('Item name is required');
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest(errors.join(', ')));
  }

  next();
};
