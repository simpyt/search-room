import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME, keys, skPrefix, gsiKeys, gsiSkPrefix, GSI_NAMES } from './client';
import type { Listing, ListingStatus, ListingSource } from '@/lib/types';
import { v4 as uuid } from 'uuid';

export interface CreateListingInput {
  roomId: string;
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
}

export async function createListing(input: CreateListingInput): Promise<Listing> {
  const listingId = uuid();
  const now = new Date().toISOString();
  const status: ListingStatus = 'UNSEEN';

  const listing: Listing = {
    ...input,
    listingId,
    addedAt: now,
    status,
    seenBy: [input.addedByUserId], // The person who added it has "seen" it
  };

  // Build GSI attributes
  const gsiAttrs: Record<string, string> = {
    // GSI2: StatusIndex - always populated for listings
    ...gsiKeys.listingStatus(input.roomId, status, listingId),
  };

  // GSI1: ExternalIdIndex - only if externalId is provided (sparse index)
  if (input.externalId) {
    Object.assign(gsiAttrs, gsiKeys.listingExternalId(input.sourceBrand, input.externalId, input.roomId));
  }

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...keys.listing(input.roomId, listingId),
        ...listing,
        ...gsiAttrs,
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

  const { PK, SK, entityType, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...listing } = result.Item;
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
    const { PK, SK, entityType, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...listing } = item;
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
  status: ListingStatus,
  visitPlannedAt?: string | null
): Promise<Listing | null> {
  // Also update GSI2SK for StatusIndex
  const gsi2sk = gsiKeys.listingStatus(roomId, status, listingId).GSI2SK;

  const updateExpressionParts = ['#status = :status', 'GSI2SK = :gsi2sk'];
  const expressionAttributeNames: Record<string, string> = {
    '#status': 'status',
  };
  const expressionAttributeValues: Record<string, ListingStatus | string | null> = {
    ':status': status,
    ':gsi2sk': gsi2sk,
  };

  if (visitPlannedAt !== undefined) {
    updateExpressionParts.push('#visitPlannedAt = :visitPlannedAt');
    expressionAttributeNames['#visitPlannedAt'] = 'visitPlannedAt';
    expressionAttributeValues[':visitPlannedAt'] = visitPlannedAt;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: keys.listing(roomId, listingId),
      UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  if (!result.Attributes) return null;

  const { PK, SK, entityType, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...listing } = result.Attributes;
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
  const gsi2sk = gsiKeys.listingStatus(roomId, newStatus, listingId).GSI2SK;

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: keys.listing(roomId, listingId),
      UpdateExpression: 'SET seenBy = list_append(seenBy, :userId), #status = :status, GSI2SK = :gsi2sk',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':userId': [userId],
        ':status': newStatus,
        ':gsi2sk': gsi2sk,
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  if (!result.Attributes) return null;

  const { PK, SK, entityType, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...updated } = result.Attributes;
  return updated as Listing;
}

export async function findListingByExternalId(
  roomId: string,
  sourceBrand: ListingSource,
  externalId: string
): Promise<Listing | null> {
  // Use GSI1 (ExternalIdIndex) for O(1) lookup
  const gsiKey = gsiKeys.listingExternalId(sourceBrand, externalId, roomId);

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI_NAMES.externalId,
      KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :sk',
      ExpressionAttributeValues: {
        ':pk': gsiKey.GSI1PK,
        ':sk': gsiKey.GSI1SK,
      },
      Limit: 1,
    })
  );

  if (!result.Items || result.Items.length === 0) return null;

  const { PK, SK, entityType, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...listing } = result.Items[0];
  return listing as Listing;
}

/**
 * Get listings for a room filtered by status using GSI2 (StatusIndex).
 * More efficient than getRoomListings when you only need listings of a specific status.
 */
export async function getRoomListingsByStatus(
  roomId: string,
  status: ListingStatus
): Promise<Listing[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI_NAMES.status,
      KeyConditionExpression: 'GSI2PK = :pk AND begins_with(GSI2SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `ROOM#${roomId}`,
        ':sk': gsiSkPrefix.status(status),
      },
    })
  );

  return (result.Items || []).map((item) => {
    const { PK, SK, entityType, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...listing } = item;
    return listing as Listing;
  });
}

