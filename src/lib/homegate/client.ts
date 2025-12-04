import type { SearchCriteria, Feature } from '@/lib/types';

// --- Types ---

export interface HomegateSearchResult {
  id: string;
  title: string;
  location: string;
  address?: string;
  price?: number;
  currency?: string;
  rooms?: number;
  livingSpace?: number;
  imageUrl?: string;
  externalUrl?: string;
  listingType?: 'STANDARD' | 'PREMIUM' | 'TOP';
}

export interface HomegateSearchResponse {
  results: HomegateSearchResult[];
  totalCount: number;
}

// API Request Types
interface SearchQuery {
  offerType: 'RENT' | 'BUY';
  categories?: string[];
  excludeCategories?: string[];
  location?: {
    geoTags?: string[];
    radius?: number;
  };
  numberOfRooms?: { from?: number; to?: number };
  monthlyRent?: { from?: number; to?: number };
  price?: { from?: number; to?: number };
  livingSpace?: { from?: number; to?: number };
  yearBuilt?: { from?: number; to?: number };
  floor?: { from?: number };
  availableDate?: { from?: string };
  text?: { query: string; language?: string };
  isPriceDefined?: boolean;
  hasBalcony?: boolean;
  hasElevator?: boolean;
  hasWheelchairAccess?: boolean;
  hasParking?: boolean;
  hasMinergie?: boolean;
  isNewBuilding?: boolean;
  isOldBuilding?: boolean;
  hasPool?: boolean;
}

interface SearchRequestBody {
  fieldset: 'web-srp-list' | 'web-srp-map';
  size: number;
  from?: number;
  sort?: {
    field: 'dateCreated' | 'price' | 'exclusive';
    direction: 'asc' | 'desc';
  };
  countTotalHitsPrecisely?: boolean;
  query: SearchQuery;
}

// API Response Types
interface ApiListingLocalization {
  text?: {
    title?: string;
    description?: string;
  };
  attachments?: Array<{
    type: string;
    url: string;
    file?: string;
  }>;
}

interface ApiListing {
  id: string;
  offerType: string;
  categories?: string[];
  localization?: Record<string, ApiListingLocalization> & { primary?: string };
  address?: {
    locality?: string;
    postalCode?: string;
    region?: string;
    country?: string;
    street?: string;
    geoCoordinates?: {
      latitude: number;
      longitude: number;
      accuracy?: string;
    };
  };
  characteristics?: {
    numberOfRooms?: number;
    livingSpace?: number;
    hasBalcony?: boolean;
    floor?: number;
  };
  prices?: {
    currency?: string;
    rent?: {
      gross?: number;
      net?: number;
      extra?: number;
      interval?: string;
    };
    buy?: {
      price?: number;
    };
  };
  availableFrom?: string;
  meta?: {
    createdAt?: string;
    updatedAt?: string;
  };
}

interface ApiSearchResult {
  id: string;
  listing: ApiListing;
  listingType?: {
    type: 'STANDARD' | 'PREMIUM' | 'TOP';
  };
  listingCard?: {
    size: string;
  };
  listerBranding?: {
    logoUrl?: string;
    legalName?: string;
    isPremiumBranding?: boolean;
  };
}

interface ApiSearchResponse {
  results: ApiSearchResult[];
  total: number;
}

// --- Feature to API boolean mapping ---

const FEATURE_TO_API_PARAM: Record<Feature, keyof SearchQuery> = {
  balcony: 'hasBalcony',
  terrace: 'hasBalcony', // API uses hasBalcony for both
  elevator: 'hasElevator',
  wheelchair_access: 'hasWheelchairAccess',
  parking: 'hasParking',
  garage: 'hasParking', // API uses hasParking for both
  minergie: 'hasMinergie',
  new_building: 'isNewBuilding',
  old_building: 'isOldBuilding',
  swimming_pool: 'hasPool',
};

// --- Category mapping ---

const CATEGORY_MAP: Record<string, string[]> = {
  apartment: ['APARTMENT', 'FLAT', 'MAISONETTE', 'DUPLEX', 'STUDIO', 'ATTIC'],
  house: ['HOUSE'],
  plot: ['AGRICULTURE'],
  parking: ['PARKING'],
  commercial: ['COMMERCIAL', 'OFFICE', 'GASTRONOMY', 'INDUSTRIAL', 'RETAIL', 'STORAGE'],
};

// --- Radius mapping (km to meters) ---

const VALID_RADII = [0, 1000, 2000, 3000, 5000, 10000, 15000, 25000, 50000];

function mapRadiusToApi(radiusKm?: number): number | undefined {
  if (!radiusKm) return undefined;
  const radiusMeters = radiusKm * 1000;
  // Find closest valid radius
  return VALID_RADII.reduce((prev, curr) =>
    Math.abs(curr - radiusMeters) < Math.abs(prev - radiusMeters) ? curr : prev
  );
}

// --- Build search query ---

function buildSearchQuery(criteria: SearchCriteria): SearchQuery {
  const query: SearchQuery = {
    offerType: criteria.offerType === 'buy' ? 'BUY' : 'RENT',
  };

  // Categories
  if (criteria.category) {
    const mappedCategories = CATEGORY_MAP[criteria.category];
    if (mappedCategories) {
      query.categories = mappedCategories;
    }
  }

  // Location
  if (criteria.location) {
    query.location = {
      // Assume location is already a geo-tag or city name
      // The API expects format like "geo-city-zurich"
      geoTags: [criteria.location.startsWith('geo-') ? criteria.location : `geo-city-${criteria.location.toLowerCase().replace(/\s+/g, '-')}`],
    };

    const radius = mapRadiusToApi(criteria.radius);
    if (radius !== undefined) {
      query.location.radius = radius;
    }
  }

  // Price
  if (criteria.priceFrom !== undefined || criteria.priceTo !== undefined) {
    const priceRange: { from?: number; to?: number } = {};
    if (criteria.priceFrom !== undefined) priceRange.from = criteria.priceFrom;
    if (criteria.priceTo !== undefined) priceRange.to = criteria.priceTo;

    if (criteria.offerType === 'rent') {
      query.monthlyRent = priceRange;
    } else {
      query.price = priceRange;
    }
  }

  // Rooms
  if (criteria.roomsFrom !== undefined || criteria.roomsTo !== undefined) {
    query.numberOfRooms = {};
    if (criteria.roomsFrom !== undefined) query.numberOfRooms.from = criteria.roomsFrom;
    if (criteria.roomsTo !== undefined) query.numberOfRooms.to = criteria.roomsTo;
  }

  // Living space
  if (criteria.livingSpaceFrom !== undefined || criteria.livingSpaceTo !== undefined) {
    query.livingSpace = {};
    if (criteria.livingSpaceFrom !== undefined) query.livingSpace.from = criteria.livingSpaceFrom;
    if (criteria.livingSpaceTo !== undefined) query.livingSpace.to = criteria.livingSpaceTo;
  }

  // Year built
  if (criteria.yearBuiltFrom !== undefined || criteria.yearBuiltTo !== undefined) {
    query.yearBuilt = {};
    if (criteria.yearBuiltFrom !== undefined) query.yearBuilt.from = criteria.yearBuiltFrom;
    if (criteria.yearBuiltTo !== undefined) query.yearBuilt.to = criteria.yearBuiltTo;
  }

  // Floor
  if (criteria.floor !== undefined) {
    query.floor = { from: criteria.floor };
  }

  // Availability
  if (criteria.availability) {
    query.availableDate = { from: criteria.availability };
  }

  // Free text
  if (criteria.freeText) {
    query.text = { query: criteria.freeText, language: 'de' };
  }

  // Only with price
  if (criteria.onlyWithPrice) {
    query.isPriceDefined = true;
  }

  // Features -> boolean flags
  if (criteria.features && criteria.features.length > 0) {
    for (const feature of criteria.features) {
      const apiParam = FEATURE_TO_API_PARAM[feature];
      if (apiParam) {
        (query as unknown as Record<string, unknown>)[apiParam] = true;
      }
    }
  }

  return query;
}

// --- Transform API response ---

function transformApiResponse(data: ApiSearchResponse, offerType: 'buy' | 'rent'): HomegateSearchResponse {
  const results: HomegateSearchResult[] = data.results.map((item) => {
    const listing = item.listing;
    const primaryLang = (listing.localization?.primary as string) || 'de';
    const localized = listing.localization?.[primaryLang] as ApiListingLocalization | undefined;

    // Get price based on offer type
    let price: number | undefined;
    if (offerType === 'rent') {
      price = listing.prices?.rent?.gross ?? listing.prices?.rent?.net;
    } else {
      price = listing.prices?.buy?.price;
    }

    // Build address string
    let address: string | undefined;
    if (listing.address) {
      const parts = [listing.address.street, listing.address.postalCode, listing.address.locality].filter(Boolean);
      address = parts.length > 0 ? parts.join(', ') : undefined;
    }

    // Get first image
    const imageUrl = localized?.attachments?.find((a) => a.type === 'IMAGE')?.url;

    // Build title - fallback to category + rooms + location if no title
    const categories = listing.categories?.join(', ') || 'Property';
    const rooms = listing.characteristics?.numberOfRooms;
    const locality = listing.address?.locality || 'Unknown';
    const fallbackTitle = rooms 
      ? `${rooms} room ${categories.toLowerCase()} in ${locality}`
      : `${categories} in ${locality}`;

    return {
      id: listing.id,
      title: localized?.text?.title || fallbackTitle,
      location: locality,
      address,
      price,
      currency: listing.prices?.currency || 'CHF',
      rooms: listing.characteristics?.numberOfRooms,
      livingSpace: listing.characteristics?.livingSpace,
      imageUrl,
      externalUrl: `https://www.homegate.ch/${offerType === 'rent' ? 'rent' : 'buy'}/${listing.id}`,
      listingType: item.listingType?.type,
    };
  });

  return {
    results,
    totalCount: data.total,
  };
}

// --- Main search function ---

export async function searchHomegate(
  criteria: SearchCriteria,
  options?: { size?: number; from?: number }
): Promise<HomegateSearchResponse> {
  const apiUrl = process.env.HOMEGATE_API_URL || 'https://apitest.homegate.ch/search';
  const trafficIdentifier = process.env.HOMEGATE_TRAFFIC_IDENTIFIER || 'search-room-hackathon';

  const requestBody: SearchRequestBody = {
    fieldset: 'web-srp-list',
    size: options?.size ?? 20,
    from: options?.from ?? 0,
    sort: {
      field: 'dateCreated',
      direction: 'desc',
    },
    countTotalHitsPrecisely: true,
    query: buildSearchQuery(criteria),
  };

  try {
    console.log('[Homegate] Searching with:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${apiUrl}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'de',
        'X-Homegate-Traffic-Identifier': trafficIdentifier,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Homegate] API error:', response.status, errorText);
      return getMockResults(criteria);
    }

    const data: ApiSearchResponse = await response.json();
    console.log('[Homegate] Found', data.total, 'results');
    return transformApiResponse(data, criteria.offerType);
  } catch (error) {
    console.error('[Homegate] Search error:', error);
    return getMockResults(criteria);
  }
}

// --- Mock data for development ---

function getMockResults(criteria: SearchCriteria): HomegateSearchResponse {
  const location = criteria.location || 'Switzerland';
  const basePrice = criteria.offerType === 'buy' ? 800000 : 2000;
  const priceRange = criteria.offerType === 'buy' ? 500000 : 1500;

  const mockListings: HomegateSearchResult[] = [
    {
      id: 'mock-1',
      title: `Beautiful 4.5 room apartment in ${location}`,
      location: location,
      address: 'Bahnhofstrasse 10',
      price: basePrice + Math.floor(Math.random() * priceRange),
      currency: 'CHF',
      rooms: 4.5,
      livingSpace: 120,
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
      externalUrl: `https://www.homegate.ch/${criteria.offerType}/1234567`,
      listingType: 'STANDARD',
    },
    {
      id: 'mock-2',
      title: `Modern 3.5 room apartment with balcony`,
      location: location,
      address: 'Hauptstrasse 25',
      price: basePrice * 0.8 + Math.floor(Math.random() * priceRange * 0.8),
      currency: 'CHF',
      rooms: 3.5,
      livingSpace: 85,
      imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      externalUrl: `https://www.homegate.ch/${criteria.offerType}/1234568`,
      listingType: 'PREMIUM',
    },
    {
      id: 'mock-3',
      title: `Spacious 5.5 room house with garden`,
      location: location,
      address: 'Gartenweg 5',
      price: basePrice * 1.5 + Math.floor(Math.random() * priceRange * 1.5),
      currency: 'CHF',
      rooms: 5.5,
      livingSpace: 180,
      imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
      externalUrl: `https://www.homegate.ch/${criteria.offerType}/1234569`,
      listingType: 'TOP',
    },
    {
      id: 'mock-4',
      title: `Cozy 2.5 room apartment in city center`,
      location: location,
      address: 'Stadtplatz 3',
      price: basePrice * 0.6 + Math.floor(Math.random() * priceRange * 0.6),
      currency: 'CHF',
      rooms: 2.5,
      livingSpace: 55,
      imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      externalUrl: `https://www.homegate.ch/${criteria.offerType}/1234570`,
      listingType: 'STANDARD',
    },
    {
      id: 'mock-5',
      title: `Newly renovated 4 room apartment`,
      location: location,
      address: 'Seestrasse 42',
      price: basePrice * 1.1 + Math.floor(Math.random() * priceRange),
      currency: 'CHF',
      rooms: 4,
      livingSpace: 100,
      imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400',
      externalUrl: `https://www.homegate.ch/${criteria.offerType}/1234571`,
      listingType: 'STANDARD',
    },
    {
      id: 'mock-6',
      title: `Penthouse with panoramic views`,
      location: location,
      address: 'Bergstrasse 100',
      price: basePrice * 2 + Math.floor(Math.random() * priceRange * 2),
      currency: 'CHF',
      rooms: 6,
      livingSpace: 250,
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
      externalUrl: `https://www.homegate.ch/${criteria.offerType}/1234572`,
      listingType: 'PREMIUM',
    },
  ];

  // Filter by criteria
  let filtered = mockListings;

  if (criteria.priceFrom) {
    filtered = filtered.filter((l) => !l.price || l.price >= criteria.priceFrom!);
  }
  if (criteria.priceTo) {
    filtered = filtered.filter((l) => !l.price || l.price <= criteria.priceTo!);
  }
  if (criteria.roomsFrom) {
    filtered = filtered.filter((l) => !l.rooms || l.rooms >= criteria.roomsFrom!);
  }
  if (criteria.roomsTo) {
    filtered = filtered.filter((l) => !l.rooms || l.rooms <= criteria.roomsTo!);
  }

  return {
    results: filtered,
    totalCount: filtered.length,
  };
}
