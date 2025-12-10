/**
 * DynamoDB Client Configuration and Key Helpers
 *
 * This module provides the DynamoDB client and key structure for the single-table design.
 * See docs/DYNAMODB_ACCESS_PATTERNS.md for complete documentation.
 *
 * Table Structure:
 * - Primary Key: PK (partition) + SK (sort)
 * - GSI1 (ExternalIdIndex): GSI1PK + GSI1SK - for listing deduplication
 * - GSI2 (StatusIndex): GSI2PK + GSI2SK - for status-based queries
 * - TTL: Enabled on 'ttl' attribute for automatic cleanup
 *
 * @module lib/db/client
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Credential resolution:
// - AWS Amplify: Uses IAM role automatically (no env vars needed)
// - Vercel/other: Uses explicit credentials from DYNAMODB_* env vars
// - Local dev: Uses AWS_* env vars or SSO profile
const accessKeyId = process.env.DYNAMODB_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.DYNAMODB_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
const sessionToken = process.env.DYNAMODB_SESSION_TOKEN || process.env.AWS_SESSION_TOKEN;
const region = process.env.DYNAMODB_REGION || process.env.AWS_REGION || 'eu-central-1';

const client = new DynamoDBClient({
  region,
  ...(accessKeyId && secretAccessKey
    ? {
        credentials: {
          accessKeyId,
          secretAccessKey,
          sessionToken,
        },
      }
    : {}),
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'search-room';

// GSI names
export const GSI_NAMES = {
  externalId: 'ExternalIdIndex', // GSI1: For finding listings by source + externalId
  status: 'StatusIndex', // GSI2: For querying listings by status
} as const;

// Key helpers
export const keys = {
  room: (roomId: string) => ({
    PK: `ROOM#${roomId}`,
    SK: 'ROOM',
  }),
  member: (roomId: string, userId: string) => ({
    PK: `ROOM#${roomId}`,
    SK: `MEMBER#${userId}`,
  }),
  criteria: (roomId: string, userId: string, timestamp: string) => ({
    PK: `ROOM#${roomId}`,
    SK: `CRITERIA#${userId}#${timestamp}`,
  }),
  combinedCriteria: (roomId: string, timestamp: string) => ({
    PK: `ROOM#${roomId}`,
    SK: `CRITERIA_COMBINED#${timestamp}`,
  }),
  listing: (roomId: string, listingId: string) => ({
    PK: `ROOM#${roomId}`,
    SK: `LISTING#${listingId}`,
  }),
  compatibility: (roomId: string, timestamp: string) => ({
    PK: `ROOM#${roomId}`,
    SK: `COMPATIBILITY#${timestamp}`,
  }),
  // Updated: include activityId for uniqueness (prevents collision on same timestamp)
  activity: (roomId: string, timestamp: string, activityId: string) => ({
    PK: `ROOM#${roomId}`,
    SK: `ACTIVITY#${timestamp}#${activityId}`,
  }),
  // For querying by user's rooms
  userRoom: (userId: string, roomId: string) => ({
    PK: `USER#${userId}`,
    SK: `ROOM#${roomId}`,
  }),
};

// GSI key helpers for listings
export const gsiKeys = {
  // GSI1: ExternalIdIndex - for finding listings by source + externalId
  listingExternalId: (sourceBrand: string, externalId: string, roomId: string) => ({
    GSI1PK: `SOURCE#${sourceBrand}#${externalId}`,
    GSI1SK: `ROOM#${roomId}`,
  }),
  // GSI2: StatusIndex - for querying listings by status within a room
  listingStatus: (roomId: string, status: string, listingId: string) => ({
    GSI2PK: `ROOM#${roomId}`,
    GSI2SK: `STATUS#${status}#${listingId}`,
  }),
};

// SK prefix helpers for queries
export const skPrefix = {
  members: 'MEMBER#',
  criteria: (userId: string) => `CRITERIA#${userId}#`,
  allCriteria: 'CRITERIA#',
  combinedCriteria: 'CRITERIA_COMBINED#',
  listings: 'LISTING#',
  compatibility: 'COMPATIBILITY#',
  activities: 'ACTIVITY#',
};

// GSI2 SK prefix helpers for status queries
export const gsiSkPrefix = {
  status: (status: string) => `STATUS#${status}#`,
};

// TTL helpers (DynamoDB TTL expects epoch seconds)
export const TTL_DAYS = {
  activities: 90, // Activities expire after 90 days
  criteria: 30, // Old criteria versions expire after 30 days
} as const;

/**
 * Calculate TTL epoch timestamp for DynamoDB.
 * @param daysFromNow - Number of days from now until expiration
 * @returns Unix epoch timestamp in seconds
 */
export function calculateTTL(daysFromNow: number): number {
  const now = Date.now();
  const expirationMs = now + daysFromNow * 24 * 60 * 60 * 1000;
  return Math.floor(expirationMs / 1000);
}

