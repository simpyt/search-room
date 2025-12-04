/**
 * Seed mock data for development/demo purposes
 * Run with: npm run db:seed
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'search-room';
const REGION = process.env.AWS_REGION || 'eu-central-1';

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

// Fixed IDs for demo room
const DEMO_ROOM_ID = 'demo-room-001';

// Users from src/lib/types/user.ts
const USERS = {
  pierre: {
    id: 'pierre',
    name: 'Pierre',
    avatarColor: '#3B82F6',
  },
  marie: {
    id: 'marie',
    name: 'Marie',
    avatarColor: '#EC4899',
  },
};

// Key helpers (same as src/lib/db/client.ts)
const keys = {
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
  userRoom: (userId: string, roomId: string) => ({
    PK: `USER#${userId}`,
    SK: `ROOM#${roomId}`,
  }),
};

async function checkExistingData(): Promise<boolean> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `ROOM#${DEMO_ROOM_ID}`,
      },
      Limit: 1,
    })
  );
  return (result.Count || 0) > 0;
}

async function seedRoom() {
  const now = new Date();
  const roomCreatedAt = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago

  // Create room
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...keys.room(DEMO_ROOM_ID),
        roomId: DEMO_ROOM_ID,
        name: 'Our Zurich Apartment Search',
        createdByUserId: 'pierre',
        createdAt: roomCreatedAt,
        searchType: 'rent',
        entityType: 'Room',
      },
    })
  );

  // Add members
  await docClient.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: TABLE_NAME,
            Item: {
              ...keys.member(DEMO_ROOM_ID, 'pierre'),
              roomId: DEMO_ROOM_ID,
              userId: 'pierre',
              role: 'owner',
              joinedAt: roomCreatedAt,
              entityType: 'Member',
            },
          },
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: {
              ...keys.userRoom('pierre', DEMO_ROOM_ID),
              roomId: DEMO_ROOM_ID,
              userId: 'pierre',
              role: 'owner',
              joinedAt: roomCreatedAt,
              entityType: 'UserRoom',
            },
          },
        },
      ],
    })
  );

  const marieJoinedAt = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();
  await docClient.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: TABLE_NAME,
            Item: {
              ...keys.member(DEMO_ROOM_ID, 'marie'),
              roomId: DEMO_ROOM_ID,
              userId: 'marie',
              role: 'member',
              joinedAt: marieJoinedAt,
              entityType: 'Member',
            },
          },
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: {
              ...keys.userRoom('marie', DEMO_ROOM_ID),
              roomId: DEMO_ROOM_ID,
              userId: 'marie',
              role: 'member',
              joinedAt: marieJoinedAt,
              entityType: 'UserRoom',
            },
          },
        },
      ],
    })
  );

  console.log('   ✓ Room and members created');
}

async function seedCriteria() {
  const now = new Date();
  const pierreCriteriaAt = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
  const marieCriteriaAt = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString();

  // Pierre's criteria - prioritizes location and modern features
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...keys.criteria(DEMO_ROOM_ID, 'pierre', pierreCriteriaAt),
        roomId: DEMO_ROOM_ID,
        userId: 'pierre',
        timestamp: pierreCriteriaAt,
        criteria: {
          offerType: 'rent',
          location: 'Zürich',
          radius: 10,
          category: 'apartment',
          priceFrom: 1500,
          priceTo: 3000,
          roomsFrom: 3,
          roomsTo: 4,
          livingSpaceFrom: 70,
          onlyWithPrice: true,
          features: ['balcony', 'elevator'],
        },
        weights: {
          location: 5,
          priceTo: 3,
          roomsFrom: 5,
          features: 3,
        },
        source: 'manual',
        entityType: 'Criteria',
      },
    })
  );

  // Marie's criteria - prioritizes space and quiet neighborhood
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...keys.criteria(DEMO_ROOM_ID, 'marie', marieCriteriaAt),
        roomId: DEMO_ROOM_ID,
        userId: 'marie',
        timestamp: marieCriteriaAt,
        criteria: {
          offerType: 'rent',
          location: 'Zürich',
          radius: 15,
          category: 'apartment',
          priceFrom: 2000,
          priceTo: 3500,
          roomsFrom: 3,
          roomsTo: 5,
          livingSpaceFrom: 80,
          livingSpaceTo: 120,
          onlyWithPrice: true,
          features: ['balcony', 'parking'],
        },
        weights: {
          livingSpaceFrom: 5,
          location: 3,
          priceTo: 3,
          features: 5,
        },
        source: 'manual',
        entityType: 'Criteria',
      },
    })
  );

  console.log('   ✓ User criteria created');
}

async function seedListings() {
  const now = new Date();

  const mockListings = [
    {
      listingId: 'listing-001',
      sourceBrand: 'external_mock',
      title: 'Modern 3.5-room apartment in Oerlikon',
      location: 'Zürich, Oerlikon',
      address: 'Wallisellenstrasse 45',
      price: 2450,
      currency: 'CHF',
      rooms: 3.5,
      livingSpace: 78,
      yearBuilt: 2018,
      features: ['balcony', 'elevator', 'minergie'],
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      externalUrl: 'https://example.com/listing-001',
      addedByUserId: 'pierre',
      addedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'SEEN',
      seenBy: ['pierre', 'marie'],
    },
    {
      listingId: 'listing-002',
      sourceBrand: 'external_mock',
      title: 'Spacious 4-room flat with garden access',
      location: 'Zürich, Altstetten',
      address: 'Badenerstrasse 320',
      price: 2800,
      currency: 'CHF',
      rooms: 4,
      livingSpace: 95,
      yearBuilt: 2015,
      features: ['balcony', 'parking', 'elevator'],
      imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      externalUrl: 'https://example.com/listing-002',
      addedByUserId: 'marie',
      addedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'VISIT_PLANNED',
      seenBy: ['pierre', 'marie'],
    },
    {
      listingId: 'listing-003',
      sourceBrand: 'external_mock',
      title: 'Cozy 3-room apartment near HB',
      location: 'Zürich, City',
      address: 'Langstrasse 120',
      price: 2650,
      currency: 'CHF',
      rooms: 3,
      livingSpace: 65,
      yearBuilt: 1990,
      features: ['elevator'],
      imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      externalUrl: 'https://example.com/listing-003',
      addedByUserId: 'pierre',
      addedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'UNSEEN',
      seenBy: ['pierre'],
    },
    {
      listingId: 'listing-004',
      sourceBrand: 'external_mock',
      title: 'Bright 4.5-room with lake view',
      location: 'Zürich, Seefeld',
      address: 'Seefeldstrasse 88',
      price: 3200,
      currency: 'CHF',
      rooms: 4.5,
      livingSpace: 110,
      yearBuilt: 2020,
      features: ['balcony', 'elevator', 'parking', 'minergie'],
      imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      externalUrl: 'https://example.com/listing-004',
      addedByUserId: 'marie',
      addedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      status: 'SEEN',
      seenBy: ['marie'],
    },
    {
      listingId: 'listing-005',
      sourceBrand: 'external_mock',
      title: 'Renovated 3.5-room in quiet area',
      location: 'Zürich, Wipkingen',
      address: 'Röschibachstrasse 22',
      price: 2350,
      currency: 'CHF',
      rooms: 3.5,
      livingSpace: 82,
      yearBuilt: 2019,
      features: ['balcony', 'new_building'],
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      externalUrl: 'https://example.com/listing-005',
      addedByUserId: 'pierre',
      addedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      status: 'UNSEEN',
      seenBy: ['pierre'],
    },
  ];

  for (const listing of mockListings) {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...keys.listing(DEMO_ROOM_ID, listing.listingId),
          roomId: DEMO_ROOM_ID,
          ...listing,
          entityType: 'Listing',
        },
      })
    );
  }

  console.log(`   ✓ ${mockListings.length} listings created`);
}

async function seedActivities() {
  const now = new Date();
  let activityTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const activities = [
    {
      type: 'RoomCreated',
      senderType: 'system',
      senderId: 'pierre',
      roomName: 'Our Zurich Apartment Search',
    },
    {
      type: 'MemberJoined',
      senderType: 'system',
      senderId: 'marie',
      memberName: 'Marie',
      offset: 1 * 24 * 60 * 60 * 1000, // +1 day
    },
    {
      type: 'ChatMessage',
      senderType: 'user',
      senderId: 'pierre',
      text: "Hey! I've set up this room for our apartment search. Let's find our dream place!",
      offset: 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000,
    },
    {
      type: 'ChatMessage',
      senderType: 'user',
      senderId: 'marie',
      text: 'Great idea! I was thinking we need at least 3 rooms and a balcony would be nice.',
      offset: 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000,
    },
    {
      type: 'CriteriaUpdated',
      senderType: 'user',
      senderId: 'pierre',
      criteriaRef: 'pierre-criteria-1',
      summary: 'Set location to Zürich, 3-4 rooms, max 3000 CHF',
      offset: 2 * 24 * 60 * 60 * 1000,
    },
    {
      type: 'CriteriaUpdated',
      senderType: 'user',
      senderId: 'marie',
      criteriaRef: 'marie-criteria-1',
      summary: 'Set location to Zürich, 3-5 rooms, min 80m², needs parking',
      offset: 3 * 24 * 60 * 60 * 1000,
    },
    {
      type: 'CompatibilityComputed',
      senderType: 'system',
      senderId: 'system',
      compatibilityRef: 'compat-1',
      scorePercent: 72,
      level: 'MEDIUM',
      offset: 3 * 24 * 60 * 60 * 1000 + 1000,
    },
    {
      type: 'ChatMessage',
      senderType: 'ai_copilot',
      senderId: 'ai_copilot',
      text: "I noticed you both want 3+ rooms and a balcony in Zürich. The main difference is Marie needs parking while Pierre prioritizes being closer to the center. Your compatibility is 72% - pretty good!",
      offset: 3 * 24 * 60 * 60 * 1000 + 60 * 1000,
    },
    {
      type: 'ListingPinned',
      senderType: 'user',
      senderId: 'pierre',
      listingId: 'listing-001',
      listingTitle: 'Modern 3.5-room apartment in Oerlikon',
      offset: 4 * 24 * 60 * 60 * 1000,
    },
    {
      type: 'ChatMessage',
      senderType: 'user',
      senderId: 'marie',
      text: 'This one looks nice! But no parking... Let me check if there is street parking nearby.',
      offset: 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
    },
    {
      type: 'ListingStatusChanged',
      senderType: 'user',
      senderId: 'marie',
      listingId: 'listing-002',
      listingTitle: 'Spacious 4-room flat with garden access',
      fromStatus: 'SEEN',
      toStatus: 'VISIT_PLANNED',
      offset: 5 * 24 * 60 * 60 * 1000,
    },
    {
      type: 'ChatMessage',
      senderType: 'user',
      senderId: 'marie',
      text: "I scheduled a visit for the Altstetten flat on Saturday! 🎉",
      offset: 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000,
    },
    {
      type: 'ChatMessage',
      senderType: 'user',
      senderId: 'pierre',
      text: 'Perfect! I added the confirmation to my calendar. See you there!',
      offset: 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000,
    },
  ];

  const baseTime = activityTime.getTime();
  let idx = 0;

  for (const activity of activities) {
    const offset = (activity as { offset?: number }).offset || idx * 1000;
    const timestamp = new Date(baseTime + offset).toISOString();
    const activityId = `activity-${String(idx + 1).padStart(3, '0')}`;

    const { offset: _offset, ...activityData } = activity as Record<string, unknown>;

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...keys.activity(DEMO_ROOM_ID, timestamp),
          roomId: DEMO_ROOM_ID,
          activityId,
          createdAt: timestamp,
          ...activityData,
          entityType: 'Activity',
        },
      })
    );
    idx++;
  }

  console.log(`   ✓ ${activities.length} activities created`);
}

async function seedCompatibility() {
  const now = new Date();
  const compatTimestamp = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...keys.compatibility(DEMO_ROOM_ID, compatTimestamp),
        roomId: DEMO_ROOM_ID,
        timestamp: compatTimestamp,
        scorePercent: 72,
        level: 'MEDIUM',
        comment:
          'Good alignment on location (Zürich) and room count (3-4). Main differences: Marie needs parking (+CHF), Pierre wants to be closer to center. Budget overlap: 2000-3000 CHF.',
        criteriaRefs: ['pierre-criteria-1', 'marie-criteria-1'],
        entityType: 'Compatibility',
      },
    })
  );

  console.log('   ✓ Compatibility snapshot created');
}

async function main() {
  console.log('='.repeat(50));
  console.log('Search Room - Seed Mock Data');
  console.log('='.repeat(50));
  console.log();

  // Check if data already exists
  console.log('1. Checking for existing data...');
  const exists = await checkExistingData();

  if (exists) {
    console.log('   ⚠ Demo room already exists. Run db:clean first to reset.');
    console.log();
    console.log('='.repeat(50));
    return;
  }

  console.log('   ✓ No existing data found');
  console.log();

  console.log('2. Creating demo room with members...');
  await seedRoom();
  console.log();

  console.log('3. Creating user criteria...');
  await seedCriteria();
  console.log();

  console.log('4. Creating mock listings...');
  await seedListings();
  console.log();

  console.log('5. Creating activity feed...');
  await seedActivities();
  console.log();

  console.log('6. Creating compatibility snapshot...');
  await seedCompatibility();
  console.log();

  console.log('='.repeat(50));
  console.log('✓ Mock data seeded successfully!');
  console.log();
  console.log('Demo room ID:', DEMO_ROOM_ID);
  console.log('Users: pierre (owner), marie (member)');
  console.log('='.repeat(50));
}

main().catch((error) => {
  console.error('✗ Seed failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});

