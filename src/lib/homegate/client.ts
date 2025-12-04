import type { SearchCriteria } from '@/lib/types';

interface HomegateSearchResult {
  id: string;
  title: string;
  location: string;
  address?: string;
  price?: number;
  rooms?: number;
  livingSpace?: number;
  imageUrl?: string;
  externalUrl?: string;
}

interface HomegateSearchResponse {
  results: HomegateSearchResult[];
  totalCount: number;
}

// Map our criteria to Homegate API parameters
function mapCriteriaToParams(criteria: SearchCriteria): Record<string, string> {
  const params: Record<string, string> = {};

  if (criteria.location) {
    params.loc = criteria.location;
  }

  if (criteria.radius) {
    params.radius = String(criteria.radius);
  }

  if (criteria.offerType) {
    params.offerType = criteria.offerType === 'buy' ? 'SALE' : 'RENT';
  }

  if (criteria.category) {
    params.category = criteria.category.toUpperCase();
  }

  if (criteria.priceFrom) {
    params.priceFrom = String(criteria.priceFrom);
  }

  if (criteria.priceTo) {
    params.priceTo = String(criteria.priceTo);
  }

  if (criteria.roomsFrom) {
    params.roomsFrom = String(criteria.roomsFrom);
  }

  if (criteria.roomsTo) {
    params.roomsTo = String(criteria.roomsTo);
  }

  if (criteria.livingSpaceFrom) {
    params.surfaceFrom = String(criteria.livingSpaceFrom);
  }

  if (criteria.livingSpaceTo) {
    params.surfaceTo = String(criteria.livingSpaceTo);
  }

  if (criteria.freeText) {
    params.query = criteria.freeText;
  }

  return params;
}

export async function searchHomegate(
  criteria: SearchCriteria
): Promise<HomegateSearchResponse> {
  const apiUrl = process.env.HOMEGATE_API_URL;
  const apiKey = process.env.HOMEGATE_API_KEY;

  // If no API key, return mock data
  if (!apiKey || !apiUrl) {
    return getMockResults(criteria);
  }

  try {
    const params = mapCriteriaToParams(criteria);
    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(`${apiUrl}/search?${queryString}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Homegate API error:', response.status);
      return getMockResults(criteria);
    }

    const data = await response.json();

    // Transform Homegate response to our format
    return {
      results: transformHomegateResults(data),
      totalCount: data.totalCount || data.results?.length || 0,
    };
  } catch (error) {
    console.error('Homegate search error:', error);
    return getMockResults(criteria);
  }
}

function transformHomegateResults(data: unknown): HomegateSearchResult[] {
  // This would be adapted based on actual Homegate API response structure
  // For now, assume data.results is an array
  const results = (data as { results?: unknown[] })?.results || [];

  return results.map((item: unknown) => {
    const i = item as Record<string, unknown>;
    return {
      id: String(i.id || Math.random().toString(36).substr(2, 9)),
      title: String(i.title || 'Property'),
      location: String(i.location || i.city || 'Unknown'),
      address: i.address ? String(i.address) : undefined,
      price: typeof i.price === 'number' ? i.price : undefined,
      rooms: typeof i.rooms === 'number' ? i.rooms : undefined,
      livingSpace: typeof i.livingSpace === 'number' ? i.livingSpace : undefined,
      imageUrl: i.imageUrl ? String(i.imageUrl) : undefined,
      externalUrl: i.url ? String(i.url) : undefined,
    };
  });
}

// Mock data for development/demo
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
      rooms: 4.5,
      livingSpace: 120,
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
      externalUrl: 'https://www.homegate.ch/rent/1234567',
    },
    {
      id: 'mock-2',
      title: `Modern 3.5 room apartment with balcony`,
      location: location,
      address: 'Hauptstrasse 25',
      price: basePrice * 0.8 + Math.floor(Math.random() * priceRange * 0.8),
      rooms: 3.5,
      livingSpace: 85,
      imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      externalUrl: 'https://www.homegate.ch/rent/1234568',
    },
    {
      id: 'mock-3',
      title: `Spacious 5.5 room house with garden`,
      location: location,
      address: 'Gartenweg 5',
      price: basePrice * 1.5 + Math.floor(Math.random() * priceRange * 1.5),
      rooms: 5.5,
      livingSpace: 180,
      imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
      externalUrl: 'https://www.homegate.ch/rent/1234569',
    },
    {
      id: 'mock-4',
      title: `Cozy 2.5 room apartment in city center`,
      location: location,
      address: 'Stadtplatz 3',
      price: basePrice * 0.6 + Math.floor(Math.random() * priceRange * 0.6),
      rooms: 2.5,
      livingSpace: 55,
      imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      externalUrl: 'https://www.homegate.ch/rent/1234570',
    },
    {
      id: 'mock-5',
      title: `Newly renovated 4 room apartment`,
      location: location,
      address: 'Seestrasse 42',
      price: basePrice * 1.1 + Math.floor(Math.random() * priceRange),
      rooms: 4,
      livingSpace: 100,
      imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400',
      externalUrl: 'https://www.homegate.ch/rent/1234571',
    },
    {
      id: 'mock-6',
      title: `Penthouse with panoramic views`,
      location: location,
      address: 'Bergstrasse 100',
      price: basePrice * 2 + Math.floor(Math.random() * priceRange * 2),
      rooms: 6,
      livingSpace: 250,
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
      externalUrl: 'https://www.homegate.ch/rent/1234572',
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

