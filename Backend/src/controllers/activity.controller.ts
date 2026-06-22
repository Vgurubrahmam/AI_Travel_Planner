import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { Trip } from '../models/Trip';
import * as aiService from '../services/ai.service';

/**
 * POST /api/trips/:id/days/:day/activities
 * Add an activity to a specific day
 */
export const addActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const dayNumber = parseInt(req.params.day as string, 10);
    const { time, activity, description, location, estimatedCost, category } = req.body;

    const trip = await Trip.findOne({ _id: id, userId: req.user!.id });
    if (!trip) {
      throw ApiError.notFound('Trip not found');
    }

    const dayEntry = trip.itinerary.find((d) => d.day === dayNumber);
    if (!dayEntry) {
      throw ApiError.notFound(`Day ${dayNumber} not found in itinerary`);
    }

    dayEntry.activities.push({
      time,
      activity,
      description,
      location,
      estimatedCost: estimatedCost || 0,
      category: category || 'other',
    });

    await trip.save();
    res.status(201).json(ApiResponse.success(trip, 'Activity added successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/trips/:id/days/:day/activities/:actIdx
 * Update an activity at a specific index
 */
export const updateActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const dayNumber = parseInt(req.params.day as string, 10);
    const activityIndex = parseInt(req.params.actIdx as string, 10);

    const trip = await Trip.findOne({ _id: id, userId: req.user!.id });
    if (!trip) {
      throw ApiError.notFound('Trip not found');
    }

    const dayEntry = trip.itinerary.find((d) => d.day === dayNumber);
    if (!dayEntry) {
      throw ApiError.notFound(`Day ${dayNumber} not found in itinerary`);
    }

    if (activityIndex < 0 || activityIndex >= dayEntry.activities.length) {
      throw ApiError.badRequest('Invalid activity index');
    }

    // Update only provided fields
    const { time, activity, description, location, estimatedCost, category } = req.body;
    if (time) dayEntry.activities[activityIndex].time = time;
    if (activity) dayEntry.activities[activityIndex].activity = activity;
    if (description) dayEntry.activities[activityIndex].description = description;
    if (location) dayEntry.activities[activityIndex].location = location;
    if (estimatedCost !== undefined) dayEntry.activities[activityIndex].estimatedCost = estimatedCost;
    if (category) dayEntry.activities[activityIndex].category = category;

    await trip.save();
    res.status(200).json(ApiResponse.success(trip, 'Activity updated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/trips/:id/days/:day/activities/:actIdx
 * Remove an activity at a specific index
 */
export const removeActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const dayNumber = parseInt(req.params.day as string, 10);
    const activityIndex = parseInt(req.params.actIdx as string, 10);

    const trip = await Trip.findOne({ _id: id, userId: req.user!.id });
    if (!trip) {
      throw ApiError.notFound('Trip not found');
    }

    const dayEntry = trip.itinerary.find((d) => d.day === dayNumber);
    if (!dayEntry) {
      throw ApiError.notFound(`Day ${dayNumber} not found in itinerary`);
    }

    if (activityIndex < 0 || activityIndex >= dayEntry.activities.length) {
      throw ApiError.badRequest('Invalid activity index');
    }

    dayEntry.activities.splice(activityIndex, 1);
    await trip.save();

    res.status(200).json(ApiResponse.success(trip, 'Activity removed successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/trips/:id/days/:day/regenerate
 * AI-regenerate a single day while preserving the rest of the itinerary
 */
export const regenerateDay = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const dayNumber = parseInt(req.params.day as string, 10);

    const trip = await Trip.findOne({ _id: id, userId: req.user!.id });
    if (!trip) {
      throw ApiError.notFound('Trip not found');
    }

    const dayIndex = trip.itinerary.findIndex((d) => d.day === dayNumber);
    if (dayIndex === -1) {
      throw ApiError.notFound(`Day ${dayNumber} not found in itinerary`);
    }

    // Regenerate only this day using AI
    const newDay = await aiService.regenerateDay(
      trip.destination,
      dayNumber,
      trip.interests,
      trip.budgetTier
    );

    // Replace the day in the itinerary
    trip.itinerary[dayIndex] = newDay;
    await trip.save();

    res.status(200).json(ApiResponse.success(trip, `Day ${dayNumber} regenerated successfully`));
  } catch (error) {
    next(error);
  }
};
