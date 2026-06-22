// User
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

// Auth
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Activity
export interface Activity {
  time: string;
  activity: string;
  description: string;
  location: string;
  estimatedCost: number;
  category: string;
}

// Day in itinerary
export interface Day {
  day: number;
  title: string;
  activities: Activity[];
}

// Hotel
export interface Hotel {
  name: string;
  rating: number;
  pricePerNight: number;
  location: string;
  amenities: string[];
  bookingUrl: string;
}

// Budget
export interface Budget {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  miscellaneous: number;
  total: number;
  currency: string;
}

// Packing item
export interface PackingItem {
  item: string;
  category: string;
  packed: boolean;
}

// Trip
export interface Trip {
  _id: string;
  userId: string;
  destination: string;
  duration: number;
  budgetTier: 'budget' | 'moderate' | 'luxury';
  interests: string[];
  itinerary: Day[];
  hotels: Hotel[];
  estimatedBudget: Budget;
  packingList: PackingItem[];
  createdAt: string;
  updatedAt: string;
}

// Create trip input
export interface CreateTripInput {
  destination: string;
  duration: number;
  budgetTier: 'budget' | 'moderate' | 'luxury';
  interests: string[];
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
