export const LISTING_STATUSES = [
  'UNSEEN',
  'SEEN',
  'VISIT_PLANNED',
  'VISITED',
  'APPLIED',
  'ACCEPTED',
  'REJECTED',
  'DELETED',
] as const;

export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  UNSEEN: 'Unseen',
  SEEN: 'Seen',
  VISIT_PLANNED: 'Visit Planned',
  VISITED: 'Visited',
  APPLIED: 'Applied',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  DELETED: 'Deleted',
};

export const LISTING_STATUS_COLORS: Record<ListingStatus, string> = {
  UNSEEN: 'bg-gray-500',
  SEEN: 'bg-blue-500',
  VISIT_PLANNED: 'bg-yellow-500',
  VISITED: 'bg-purple-500',
  APPLIED: 'bg-orange-500',
  ACCEPTED: 'bg-green-500',
  REJECTED: 'bg-red-500',
  DELETED: 'bg-gray-400',
};

export type ListingSource = 'homegate' | 'external_mock';

export interface Listing {
  roomId: string;
  listingId: string;
  sourceBrand: ListingSource;
  externalId?: string;
  title: string;
  location: string;
  address?: string;
  price?: number;
  currency?: string;
  rooms?: number;
  livingSpace?: number;
  yearBuilt?: number;
  features?: string[];
  imageUrl?: string;
  externalUrl?: string;
  addedByUserId: string;
  addedAt: string;
  status: ListingStatus;
  seenBy: string[];
}

