import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ApiResponse } from '../utils/ApiResponse';
import * as tripService from '../services/trip.service';

/**
 * POST /api/trips
 * Generate a new AI-powered trip
 */
export const createTrip = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { destination, duration, budgetTier, interests } = req.body;

    const trip = await tripService.createTrip(
      req.user!.id,
      destination,
      duration,
      budgetTier,
      interests
    );

    res.status(201).json(ApiResponse.success(trip, 'Trip generated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/trips
 * Get all trips for the authenticated user
 */
export const getTrips = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trips = await tripService.getUserTrips(req.user!.id);
    res.status(200).json(ApiResponse.success(trips, 'Trips retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/trips/:id
 * Get a single trip by ID
 */
export const getTripById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trip = await tripService.getTripById(req.params.id as string, req.user!.id);
    res.status(200).json(ApiResponse.success(trip, 'Trip retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/trips/:id
 * Update a trip's basic details
 */
export const updateTrip = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { destination, duration, budgetTier, interests } = req.body;
    const updates: any = {};

    if (destination) updates.destination = destination;
    if (duration) updates.duration = duration;
    if (budgetTier) updates.budgetTier = budgetTier;
    if (interests) updates.interests = interests;

    const trip = await tripService.updateTrip(req.params.id as string, req.user!.id, updates);
    res.status(200).json(ApiResponse.success(trip, 'Trip updated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/trips/:id
 * Delete a trip
 */
export const deleteTrip = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await tripService.deleteTrip(req.params.id as string, req.user!.id);
    res.status(200).json(ApiResponse.success(null, 'Trip deleted successfully'));
  } catch (error) {
    next(error);
  }
};
