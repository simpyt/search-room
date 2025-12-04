import {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME, keys, skPrefix } from './client';
import type { Room, RoomMember, RoomWithMembers, RoomContext } from '@/lib/types';
import { v4 as uuid } from 'uuid';

export async function createRoom(
  name: string,
  createdByUserId: string,
  searchType: 'buy' | 'rent' = 'buy',
  initialContext?: Omit<RoomContext, 'updatedAt' | 'updatedByUserId'>
): Promise<Room> {
  const roomId = uuid();
  const now = new Date().toISOString();

  const context: RoomContext | undefined = initialContext
    ? {
        ...initialContext,
        updatedAt: now,
        updatedByUserId: createdByUserId,
      }
    : undefined;

  const room: Room = {
    roomId,
    name,
    createdByUserId,
    createdAt: now,
    searchType,
    ...(context && { context }),
  };

  const member: RoomMember = {
    roomId,
    userId: createdByUserId,
    role: 'owner',
    joinedAt: now,
  };

  // Create room and add owner as member in a transaction
  await docClient.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: TABLE_NAME,
            Item: {
              ...keys.room(roomId),
              ...room,
              entityType: 'Room',
            },
          },
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: {
              ...keys.member(roomId, createdByUserId),
              ...member,
              entityType: 'Member',
            },
          },
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: {
              ...keys.userRoom(createdByUserId, roomId),
              roomId,
              userId: createdByUserId,
              role: 'owner',
              joinedAt: now,
              entityType: 'UserRoom',
            },
          },
        },
      ],
    })
  );

  return room;
}

export async function getRoom(roomId: string): Promise<Room | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: keys.room(roomId),
    })
  );

  if (!result.Item) return null;

  const { PK, SK, entityType, ...room } = result.Item;
  return room as Room;
}

export async function getRoomWithMembers(roomId: string): Promise<RoomWithMembers | null> {
  const room = await getRoom(roomId);
  if (!room) return null;

  const members = await getRoomMembers(roomId);
  return { ...room, members };
}

export async function getRoomMembers(roomId: string): Promise<RoomMember[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `ROOM#${roomId}`,
        ':sk': skPrefix.members,
      },
    })
  );

  return (result.Items || []).map((item) => {
    const { PK, SK, entityType, ...member } = item;
    return member as RoomMember;
  });
}

export async function addMember(
  roomId: string,
  userId: string,
  role: 'owner' | 'member' = 'member'
): Promise<RoomMember> {
  const now = new Date().toISOString();

  const member: RoomMember = {
    roomId,
    userId,
    role,
    joinedAt: now,
  };

  await docClient.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: TABLE_NAME,
            Item: {
              ...keys.member(roomId, userId),
              ...member,
              entityType: 'Member',
            },
          },
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: {
              ...keys.userRoom(userId, roomId),
              roomId,
              userId,
              role,
              joinedAt: now,
              entityType: 'UserRoom',
            },
          },
        },
      ],
    })
  );

  return member;
}

export async function getUserRooms(userId: string): Promise<string[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'ROOM#',
      },
    })
  );

  return (result.Items || []).map((item) => item.roomId);
}

export async function isUserMemberOfRoom(roomId: string, userId: string): Promise<boolean> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: keys.member(roomId, userId),
    })
  );

  return !!result.Item;
}

export async function updateRoom(
  roomId: string,
  updates: { name?: string }
): Promise<Room | null> {
  const room = await getRoom(roomId);
  if (!room) return null;

  const updatedRoom = { ...room, ...updates };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...keys.room(roomId),
        ...updatedRoom,
        entityType: 'Room',
      },
    })
  );

  return updatedRoom;
}

export async function updateRoomContext(
  roomId: string,
  context: Omit<RoomContext, 'updatedAt' | 'updatedByUserId'>,
  userId: string
): Promise<Room | null> {
  const room = await getRoom(roomId);
  if (!room) return null;

  const updatedContext: RoomContext = {
    ...context,
    updatedAt: new Date().toISOString(),
    updatedByUserId: userId,
  };

  const updatedRoom: Room = { ...room, context: updatedContext };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...keys.room(roomId),
        ...updatedRoom,
        entityType: 'Room',
      },
    })
  );

  return updatedRoom;
}

export async function deleteRoom(roomId: string): Promise<void> {
  // First get all items for this room
  const items = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `ROOM#${roomId}`,
      },
    })
  );

  if (!items.Items || items.Items.length === 0) return;

  // Delete all items (max 25 per batch in DynamoDB)
  const batches = [];
  for (let i = 0; i < items.Items.length; i += 25) {
    batches.push(items.Items.slice(i, i + 25));
  }

  for (const batch of batches) {
    await docClient.send(
      new TransactWriteCommand({
        TransactItems: batch.map((item) => ({
          Delete: {
            TableName: TABLE_NAME,
            Key: { PK: item.PK, SK: item.SK },
          },
        })),
      })
    );
  }
}

