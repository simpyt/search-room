/**
 * Clean all mock data from DynamoDB
 * Run with: npm run db:clean
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'search-room';
const REGION = process.env.AWS_REGION || 'eu-central-1';

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Demo room ID to clean
const DEMO_ROOM_ID = 'demo-room-001';

// Users that might have UserRoom entries
const DEMO_USERS = ['pierre', 'marie'];

async function deleteItems(items: { PK: string; SK: string }[]) {
  if (items.length === 0) return 0;

  // DynamoDB BatchWrite supports max 25 items
  const batches: { PK: string; SK: string }[][] = [];
  for (let i = 0; i < items.length; i += 25) {
    batches.push(items.slice(i, i + 25));
  }

  let deleted = 0;
  for (const batch of batches) {
    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: batch.map((item) => ({
            DeleteRequest: {
              Key: { PK: item.PK, SK: item.SK },
            },
          })),
        },
      })
    );
    deleted += batch.length;
  }

  return deleted;
}

async function cleanRoomData(): Promise<number> {
  // Get all items for the demo room
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `ROOM#${DEMO_ROOM_ID}`,
      },
    })
  );

  const items = (result.Items || []).map((item) => ({
    PK: item.PK as string,
    SK: item.SK as string,
  }));

  return deleteItems(items);
}

async function cleanUserRoomData(): Promise<number> {
  let totalDeleted = 0;

  for (const userId of DEMO_USERS) {
    // Get UserRoom entries for this user pointing to demo room
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'PK = :pk AND SK = :sk',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': `ROOM#${DEMO_ROOM_ID}`,
        },
      })
    );

    const items = (result.Items || []).map((item) => ({
      PK: item.PK as string,
      SK: item.SK as string,
    }));

    totalDeleted += await deleteItems(items);
  }

  return totalDeleted;
}

async function cleanTestData(): Promise<number> {
  // Clean any leftover test data from test-db-connection.ts
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'begins_with(PK, :prefix)',
      ExpressionAttributeValues: {
        ':prefix': 'TEST#',
      },
    })
  );

  const items = (result.Items || []).map((item) => ({
    PK: item.PK as string,
    SK: item.SK as string,
  }));

  return deleteItems(items);
}

async function main() {
  console.log('='.repeat(50));
  console.log('Search Room - Clean Mock Data');
  console.log('='.repeat(50));
  console.log();

  console.log('1. Cleaning demo room data...');
  const roomItems = await cleanRoomData();
  console.log(`   ✓ Deleted ${roomItems} room items`);
  console.log();

  console.log('2. Cleaning user-room mappings...');
  const userRoomItems = await cleanUserRoomData();
  console.log(`   ✓ Deleted ${userRoomItems} user-room items`);
  console.log();

  console.log('3. Cleaning test data...');
  const testItems = await cleanTestData();
  console.log(`   ✓ Deleted ${testItems} test items`);
  console.log();

  const total = roomItems + userRoomItems + testItems;
  console.log('='.repeat(50));
  console.log(`✓ Cleaned ${total} total items`);
  console.log('='.repeat(50));
}

main().catch((error) => {
  console.error('✗ Clean failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});



