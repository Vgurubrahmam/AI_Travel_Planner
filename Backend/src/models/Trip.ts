import mongoose, { Schema, Document } from 'mongoose';

export interface ITrip extends Document {
  userId: mongoose.Types.ObjectId;
  destination: string;
  duration: number;
  budgetTier: 'budget' | 'moderate' | 'luxury';
  interests: string[];
  itinerary: {
    day: number;
    title: string;
    activities: {
      time: string;
      activity: string;
      description: string;
      location: string;
      estimatedCost: number;
      category: string;
    }[];
  }[];
  hotels: {
    name: string;
    rating: number;
    pricePerNight: number;
    location: string;
    amenities: string[];
    bookingUrl: string;
  }[];
  estimatedBudget: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
    miscellaneous: number;
    total: number;
    currency: string;
  };
  packingList: {
    item: string;
    category: string;
    packed: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema(
  {
    time: { type: String, required: true },
    activity: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    estimatedCost: { type: Number, default: 0 },
    category: { type: String, default: 'other' },
  },
  { _id: false }
);

const daySchema = new Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true },
    activities: [activitySchema],
  },
  { _id: false }
);

const hotelSchema = new Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, default: 0 },
    pricePerNight: { type: Number, default: 0 },
    location: { type: String, default: '' },
    amenities: [{ type: String }],
    bookingUrl: { type: String, default: '' },
  },
  { _id: false }
);

const budgetSchema = new Schema(
  {
    accommodation: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    activities: { type: Number, default: 0 },
    miscellaneous: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
  },
  { _id: false }
);

const packingItemSchema = new Schema(
  {
    item: { type: String, required: true },
    category: { type: String, required: true },
    packed: { type: Boolean, default: false },
  },
  { _id: false }
);

const tripSchema = new Schema<ITrip>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
    },
    budgetTier: {
      type: String,
      enum: ['budget', 'moderate', 'luxury'],
      required: [true, 'Budget tier is required'],
    },
    interests: [{ type: String }],
    itinerary: [daySchema],
    hotels: [hotelSchema],
    estimatedBudget: budgetSchema,
    packingList: [packingItemSchema],
  },
  {
    timestamps: true,
  }
);

export const Trip = mongoose.model<ITrip>('Trip', tripSchema);
