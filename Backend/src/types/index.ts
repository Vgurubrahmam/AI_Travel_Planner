import { Request } from 'express';

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Trip creation input
export interface CreateTripInput {
  destination: string;
  duration: number;
  budgetTier: 'budget' | 'moderate' | 'luxury';
  interests: string[];
}

// Activity within a day
export interface IActivity {
  time: string;
  activity: string;
  description: string;
  location: string;
  estimatedCost: number;
  category: string;
}

// Single day in itinerary
export interface IDay {
  day: number;
  title: string;
  activities: IActivity[];
}

// Hotel recommendation
export interface IHotel {
  name: string;
  rating: number;
  pricePerNight: number;
  location: string;
  amenities: string[];
  bookingUrl: string;
}

// Budget breakdown
export interface IBudget {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  miscellaneous: number;
  total: number;
  currency: string;
}

// Packing list item
export interface IPackingItem {
  item: string;
  category: string;
  packed: boolean;
}
