import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { AI_RETRY_ATTEMPTS, AI_INITIAL_DELAY_MS } from '../utils/constants';
import {
  buildItineraryPrompt,
  buildHotelPrompt,
  buildBudgetPrompt,
  buildPackingListPrompt,
  buildRegenerateDayPrompt,
} from '../utils/prompts';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

/**
 * Call Gemini API with retry logic and exponential backoff, falling back between models if needed
 */
async function callGeminiWithRetry(prompt: string): Promise<string> {
  let lastError: Error | null = null;
  const modelsToTry = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-flash-latest'];

  for (const modelName of modelsToTry) {
    const model = genAI.getGenerativeModel({ model: modelName });
    
    for (let attempt = 0; attempt < AI_RETRY_ATTEMPTS; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        if (!text) {
          throw new Error('Empty response from Gemini');
        }

        return text;
      } catch (error: any) {
        lastError = error;
        console.error(`Gemini API (${modelName}) attempt ${attempt + 1} failed:`, error.message);

        // If it is a rate limit or quota exceeded error, fall back immediately to the next model
        const isQuotaError =
          error.message?.includes('429') ||
          error.message?.includes('quota') ||
          error.message?.includes('Quota') ||
          error.message?.includes('limit');
          
        if (isQuotaError && modelName !== 'gemini-flash-latest') {
          console.warn(`Quota/Rate limit hit on ${modelName}. Falling back to next model...`);
          break; // Break current model retry loop to try the next model
        }

        if (attempt < AI_RETRY_ATTEMPTS - 1) {
          const delay = AI_INITIAL_DELAY_MS * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }

  throw ApiError.internal(`AI generation failed after trying all models: ${lastError?.message}`);
}

/**
 * Parse JSON from Gemini response, handling potential markdown code blocks
 */
function parseJSON(text: string): any {
  // Remove markdown code blocks if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse AI response:', cleaned.substring(0, 200));
    throw ApiError.internal('Failed to parse AI response');
  }
}

/**
 * Generate a complete day-by-day itinerary
 */
export async function generateItinerary(
  destination: string,
  duration: number,
  budgetTier: string,
  interests: string[]
): Promise<any[]> {
  const prompt = buildItineraryPrompt(destination, duration, budgetTier, interests);
  const response = await callGeminiWithRetry(prompt);
  const itinerary = parseJSON(response);

  if (!Array.isArray(itinerary)) {
    throw ApiError.internal('Invalid itinerary format from AI');
  }

  return itinerary;
}

/**
 * Generate hotel recommendations
 */
export async function generateHotelRecommendations(
  destination: string,
  budgetTier: string,
  duration: number
): Promise<any[]> {
  const prompt = buildHotelPrompt(destination, budgetTier, duration);
  const response = await callGeminiWithRetry(prompt);
  const hotels = parseJSON(response);

  if (!Array.isArray(hotels)) {
    throw ApiError.internal('Invalid hotel recommendations format from AI');
  }

  return hotels;
}

/**
 * Generate estimated budget breakdown
 */
export async function estimateBudget(
  destination: string,
  duration: number,
  budgetTier: string
): Promise<any> {
  const prompt = buildBudgetPrompt(destination, duration, budgetTier);
  const response = await callGeminiWithRetry(prompt);
  const budget = parseJSON(response);

  if (!budget || typeof budget !== 'object' || !budget.total) {
    throw ApiError.internal('Invalid budget format from AI');
  }

  return budget;
}

/**
 * Generate packing list
 */
export async function generatePackingList(
  destination: string,
  duration: number,
  interests: string[]
): Promise<any[]> {
  const prompt = buildPackingListPrompt(destination, duration, interests);
  const response = await callGeminiWithRetry(prompt);
  const packingList = parseJSON(response);

  if (!Array.isArray(packingList)) {
    throw ApiError.internal('Invalid packing list format from AI');
  }

  return packingList;
}

/**
 * Regenerate a single day's itinerary
 */
export async function regenerateDay(
  destination: string,
  dayNumber: number,
  interests: string[],
  budgetTier: string
): Promise<any> {
  const prompt = buildRegenerateDayPrompt(destination, dayNumber, interests, budgetTier);
  const response = await callGeminiWithRetry(prompt);
  const day = parseJSON(response);

  if (!day || typeof day !== 'object' || !day.activities) {
    throw ApiError.internal('Invalid day format from AI');
  }

  return day;
}
