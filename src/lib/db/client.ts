import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Use default credential provider chain (SSO, env vars, IAM roles, etc.)
// Only set explicit credentials if provided in env vars
const clientConfig: { region: string; credentials?: { accessKeyId: string; secretAccessKey: string } } = {
  region: process.env.AWS_REGION || 'eu-central-1',
};

// If explicit credentials are provided, use them; otherwise let SDK use default chain
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

const client = new DynamoDBClient(clientConfig);

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

