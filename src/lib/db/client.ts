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
  activity: (roomId: string, timestamp: string) => ({
    PK: `ROOM#${roomId}`,
    SK: `ACTIVITY#${timestamp}`,
  }),
  // For querying by user's rooms
  userRoom: (userId: string, roomId: string) => ({
    PK: `USER#${userId}`,
    SK: `ROOM#${roomId}`,
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

