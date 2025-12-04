import OpenAI from 'openai';
import type { ListingSource } from '@/lib/types';

// Lazy-load OpenAI client to avoid errors during build
let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }
  return openaiClient;
}

export interface ParsedListing {
  title: string;
  location: string;
  address: string | null;
  price: number | null;
  currency: string;
  rooms: number | null;
  livingSpace: number | null;
  yearBuilt: number | null;
  features: string[];
  imageUrl: string | null;
  sourceBrand: ListingSource;
  externalId: string;
}

export interface ParseInput {
  url: string;
  content: string;
  jsonLd?: object | null;
  ogData?: Record<string, string>;
}

const SYSTEM_PROMPT = `You are a real estate listing data extractor for the Swiss market.
Given HTML content from a listing page, extract structured data.

Rules:
1. Extract only factual information present on the page
2. For price, extract the numeric value only (no currency symbol)
3. For currency, default to CHF if not specified
4. For rooms, use Swiss notation (e.g., 3.5 rooms)
5. Living space should be in square meters (m²)
6. If a field cannot be determined with confidence, return null
7. For features, extract notable amenities: balcony, terrace, parking, 
   garage, elevator, dishwasher, washing machine, storage, garden, etc.
8. Return valid JSON only`;

export async function parseListingFromContent(input: ParseInput): Promise<ParsedListing> {
  const { url, content, jsonLd, ogData } = input;

  // Detect source from URL
  const sourceBrand = detectSource(url);
  
  // Generate external ID
  const externalId = generateExternalId(url, sourceBrand);

  // Clean and truncate content
  const cleanedContent = preprocessContent(content);

  // Build context from structured data if available
  let structuredContext = '';
  if (jsonLd) {
    structuredContext += `\nJSON-LD data: ${JSON.stringify(jsonLd)}`;
  }
  if (ogData && Object.keys(ogData).length > 0) {
    structuredContext += `\nOpen Graph data: ${JSON.stringify(ogData)}`;
  }

  const userPrompt = `Extract listing data from this page:

URL: ${url}
Source: ${sourceBrand}
${structuredContext}

Page content:
${cleanedContent}

Return JSON in this exact format:
{
  "title": "string - listing title",
  "location": "string - city/area name",
  "address": "string or null - full address if available",
  "price": "number or null - numeric price value only",
  "currency": "string - CHF, EUR, etc. (default CHF)",
  "rooms": "number or null - room count (e.g., 3.5)",
  "livingSpace": "number or null - square meters",
  "yearBuilt": "number or null - construction year",
  "features": ["array of strings - amenities/features"],
  "imageUrl": "string or null - main image URL"
}`;

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1, // Low temperature for consistent extraction
    max_tokens: 1000,
  });

  const responseContent = response.choices[0]?.message?.content;
  if (!responseContent) {
    throw new Error('No response from AI');
  }

  const parsed = JSON.parse(responseContent);

  // Validate and normalize the response
  return {
    title: parsed.title || 'Untitled Listing',
    location: parsed.location || 'Unknown',
    address: parsed.address || null,
    price: typeof parsed.price === 'number' ? parsed.price : null,
    currency: parsed.currency || 'CHF',
    rooms: typeof parsed.rooms === 'number' ? parsed.rooms : null,
    livingSpace: typeof parsed.livingSpace === 'number' ? parsed.livingSpace : null,
    yearBuilt: typeof parsed.yearBuilt === 'number' ? parsed.yearBuilt : null,
    features: Array.isArray(parsed.features) ? parsed.features : [],
    imageUrl: parsed.imageUrl || null,
    sourceBrand,
    externalId,
  };
}

/**
 * Detect source platform from URL
 */
export function detectSource(url: string): ListingSource {
  try {
    const hostname = new URL(url).hostname.toLowerCase();

    if (hostname.includes('homegate.ch')) return 'homegate';
    if (hostname.includes('immoscout24.ch')) return 'immoscout24';
    if (hostname.includes('anibis.ch')) return 'anibis';
    if (hostname.includes('facebook.com')) return 'facebook';
    if (hostname.includes('ricardo.ch')) return 'ricardo';
    if (hostname.includes('comparis.ch')) return 'comparis';

    return 'other';
  } catch {
    return 'other';
  }
}

/**
 * Generate external ID for deduplication
 */
export function generateExternalId(url: string, source: ListingSource): string {
  // Try to extract platform-specific ID from URL
  const patterns: Record<string, RegExp> = {
    homegate: /\/(\d+)(?:\?|$|\/)/,
    immoscout24: /\/(\d+)(?:\?|$|\/)/,
    anibis: /\/(\d+)(?:\?|$|\/)/,
    ricardo: /\/(\d+)(?:\?|$|\/)/,
  };

  const pattern = patterns[source];
  if (pattern) {
    const match = url.match(pattern);
    if (match) return `${source}:${match[1]}`;
  }

  // Fallback: hash the URL
  return `${source}:${hashUrl(url)}`;
}

/**
 * Simple hash function for URL deduplication
 */
function hashUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Preprocess HTML content for AI parsing
 */
function preprocessContent(content: string, maxLength = 15000): string {
  // Remove script and style tags with their content
  let cleaned = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');

  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  // Remove all HTML tags but keep text content
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Collapse whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Truncate to max length
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength) + '...';
  }

  return cleaned;
}

