import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME, keys, skPrefix } from './client';
import type { Listing, ListingStatus } from '@/lib/types';
import { v4 as uuid } from 'uuid';

export interface CreateListingInput {
  roomId: string;
  sourceBrand: 'homegate' | 'external_mock';
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
}

export async function createListing(input: CreateListingInput): Promise<Listing> {
  const listingId = uuid();
  const now = new Date().toISOString();

  const listing: Listing = {
    ...input,
    listingId,
    addedAt: now,
    status: 'UNSEEN',
    seenBy: [input.addedByUserId], // The person who added it has "seen" it
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...keys.listing(input.roomId, listingId),
        ...listing,
        entityType: 'Listing',
      },
    })
  );

  return listing;
}

export async function getListing(
  roomId: string,
  listingId: string
): Promise<Listing | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: keys.listing(roomId, listingId),
    })
  );

  if (!result.Item) return null;

  const { PK, SK, entityType, ...listing } = result.Item;
  return listing as Listing;
}

export async function getRoomListings(
  roomId: string,
  includeDeleted = false
): Promise<Listing[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `ROOM#${roomId}`,
        ':sk': skPrefix.listings,
      },
    })
  );

  const listings = (result.Items || []).map((item) => {
    const { PK, SK, entityType, ...listing } = item;
    return listing as Listing;
  });

  if (includeDeleted) {
    return listings;
  }

  return listings.filter((l) => l.status !== 'DELETED');
}

export async function updateListingStatus(
  roomId: string,
  listingId: string,
  status: ListingStatus
): Promise<Listing | null> {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: keys.listing(roomId, listingId),
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  if (!result.Attributes) return null;

  const { PK, SK, entityType, ...listing } = result.Attributes;
  return listing as Listing;
}

export async function markListingAsSeen(
  roomId: string,
  listingId: string,
  userId: string
): Promise<Listing | null> {
  // First get the listing to check current seenBy
  const listing = await getListing(roomId, listingId);
  if (!listing) return null;

  // If already seen by this user, just return
  if (listing.seenBy.includes(userId)) {
    return listing;
  }

  // Add user to seenBy and update status if it was UNSEEN
  const newStatus = listing.status === 'UNSEEN' ? 'SEEN' : listing.status;

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: keys.listing(roomId, listingId),
      UpdateExpression: 'SET seenBy = list_append(seenBy, :userId), #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':userId': [userId],
        ':status': newStatus,
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  if (!result.Attributes) return null;

  const { PK, SK, entityType, ...updated } = result.Attributes;
  return updated as Listing;
}

export async function findListingByExternalId(
  roomId: string,
  externalId: string
): Promise<Listing | null> {
  // This requires a scan or GSI - for POC we'll scan
  const listings = await getRoomListings(roomId, true);
  return listings.find((l) => l.externalId === externalId) || null;
}

