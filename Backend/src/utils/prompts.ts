export const buildItineraryPrompt = (
  destination: string,
  duration: number,
  budgetTier: string,
  interests: string[]
): string => {
  return `You are an expert travel planner. Generate a detailed day-by-day travel itinerary.

Trip Details:
- Destination: ${destination}
- Duration: ${duration} days
- Budget Tier: ${budgetTier}
- Interests: ${interests.join(', ')}

Respond ONLY with valid JSON (no markdown, no explanation). Use this exact format:
[
  {
    "day": 1,
    "title": "Day title describing the theme",
    "activities": [
      {
        "time": "09:00 AM",
        "activity": "Activity name",
        "description": "Brief description of the activity",
        "location": "Specific location or venue name",
        "estimatedCost": 25,
        "category": "sightseeing"
      }
    ]
  }
]

Requirements:
- Include 4-6 activities per day
- Categories: sightseeing, food, transport, adventure, culture, shopping, relaxation, nightlife, other
- Estimated costs should be in USD and appropriate for the ${budgetTier} budget tier
- Times should cover morning to evening
- Activities should match the interests: ${interests.join(', ')}`;
};

export const buildHotelPrompt = (
  destination: string,
  budgetTier: string,
  duration: number
): string => {
  return `You are a hotel recommendation expert. Suggest 3 hotels for a trip.

Trip Details:
- Destination: ${destination}
- Budget Tier: ${budgetTier}
- Duration: ${duration} days

Respond ONLY with valid JSON (no markdown, no explanation). Use this exact format:
[
  {
    "name": "Hotel Name",
    "rating": 4.5,
    "pricePerNight": 120,
    "location": "Hotel address or area",
    "amenities": ["WiFi", "Pool", "Breakfast"],
    "bookingUrl": ""
  }
]

Requirements:
- Provide exactly 3 hotel options
- Prices in USD appropriate for ${budgetTier} tier
- Rating between 1-5
- Include realistic amenities`;
};

export const buildBudgetPrompt = (
  destination: string,
  duration: number,
  budgetTier: string
): string => {
  return `You are a travel budget expert. Estimate the total trip budget.

Trip Details:
- Destination: ${destination}
- Duration: ${duration} days
- Budget Tier: ${budgetTier}

Respond ONLY with valid JSON (no markdown, no explanation). Use this exact format:
{
  "accommodation": 500,
  "food": 300,
  "transport": 200,
  "activities": 250,
  "miscellaneous": 100,
  "total": 1350,
  "currency": "USD"
}

Requirements:
- All values in USD
- Total should be the sum of all categories
- Amounts should be realistic for ${duration} days in ${destination} at ${budgetTier} level`;
};

export const buildPackingListPrompt = (
  destination: string,
  duration: number,
  interests: string[]
): string => {
  return `You are a travel packing expert. Generate a packing list for a trip.

Trip Details:
- Destination: ${destination}
- Duration: ${duration} days
- Activities/Interests: ${interests.join(', ')}

Respond ONLY with valid JSON (no markdown, no explanation). Use this exact format:
[
  {
    "item": "Item name",
    "category": "clothing",
    "packed": false
  }
]

Requirements:
- Include 15-25 items
- Categories: clothing, toiletries, electronics, documents, medication, accessories, other
- Items should be relevant to the destination and activities
- All items should have packed set to false`;
};

export const buildRegenerateDayPrompt = (
  destination: string,
  dayNumber: number,
  interests: string[],
  budgetTier: string
): string => {
  return `You are an expert travel planner. Regenerate the itinerary for a single day.

Trip Details:
- Destination: ${destination}
- Day Number: ${dayNumber}
- Budget Tier: ${budgetTier}
- Interests: ${interests.join(', ')}

Respond ONLY with valid JSON (no markdown, no explanation). Use this exact format:
{
  "day": ${dayNumber},
  "title": "Day title describing the theme",
  "activities": [
    {
      "time": "09:00 AM",
      "activity": "Activity name",
      "description": "Brief description",
      "location": "Specific location",
      "estimatedCost": 25,
      "category": "sightseeing"
    }
  ]
}

Requirements:
- Include 4-6 activities
- Categories: sightseeing, food, transport, adventure, culture, shopping, relaxation, nightlife, other
- Create a fresh, different itinerary from what might have been generated before
- Costs in USD appropriate for ${budgetTier} tier`;
};
