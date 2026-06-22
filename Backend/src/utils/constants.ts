export const BUDGET_TIERS = ['budget', 'moderate', 'luxury'] as const;

export const ACTIVITY_CATEGORIES = [
  'sightseeing',
  'food',
  'transport',
  'adventure',
  'culture',
  'shopping',
  'relaxation',
  'nightlife',
  'other',
] as const;

export const PACKING_CATEGORIES = [
  'clothing',
  'toiletries',
  'electronics',
  'documents',
  'medication',
  'accessories',
  'other',
] as const;

export const MAX_TRIP_DURATION = 30;
export const MIN_TRIP_DURATION = 1;
export const MAX_INTERESTS = 10;

export const AI_RETRY_ATTEMPTS = 3;
export const AI_INITIAL_DELAY_MS = 1000;
