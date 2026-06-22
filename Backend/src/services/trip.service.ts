import { Trip, ITrip } from '../models/Trip';
import { ApiError } from '../utils/ApiError';
import * as aiService from './ai.service';

/**
 * Create a new trip with AI-generated content
 */
export async function createTrip(
  userId: string,
  destination: string,
  duration: number,
  budgetTier: string,
  interests: string[]
): Promise<ITrip> {
  console.log(`Generating trip to ${destination} for user ${userId}...`);

  // Generate all AI content in parallel for better performance
  const [itinerary, hotels, estimatedBudget, packingList] = await Promise.all([
    aiService.generateItinerary(destination, duration, budgetTier, interests),
    aiService.generateHotelRecommendations(destination, budgetTier, duration),
    aiService.estimateBudget(destination, duration, budgetTier),
    aiService.generatePackingList(destination, duration, interests),
  ]);

  // Save to database
  const trip = await Trip.create({
    userId,
    destination,
    duration,
    budgetTier: budgetTier as 'budget' | 'moderate' | 'luxury',
    interests,
    itinerary,
    hotels,
    estimatedBudget,
    packingList,
  });

  console.log(`Trip created: ${(trip as any)._id}`);
  return trip as ITrip;
}

/**
 * Get all trips for a user
 */
export async function getUserTrips(userId: string): Promise<ITrip[]> {
  return Trip.find({ userId }).sort({ createdAt: -1 });
}

/**
 * Get a single trip by ID (with ownership check)
 */
export async function getTripById(tripId: string, userId: string): Promise<ITrip> {
  const trip = await Trip.findOne({ _id: tripId, userId });

  if (!trip) {
    throw ApiError.notFound('Trip not found');
  }

  return trip;
}

/**
 * Update a trip (with ownership check)
 */
export async function updateTrip(
  tripId: string,
  userId: string,
  updates: Partial<Pick<ITrip, 'destination' | 'duration' | 'budgetTier' | 'interests'>>
): Promise<ITrip> {
  const trip = await Trip.findOneAndUpdate(
    { _id: tripId, userId },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!trip) {
    throw ApiError.notFound('Trip not found');
  }

  return trip;
}

/**
 * Delete a trip (with ownership check)
 */
export async function deleteTrip(tripId: string, userId: string): Promise<void> {
  const trip = await Trip.findOneAndDelete({ _id: tripId, userId });

  if (!trip) {
    throw ApiError.notFound('Trip not found');
  }
}
