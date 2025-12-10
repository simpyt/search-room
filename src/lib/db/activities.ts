import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME, keys, skPrefix, calculateTTL, TTL_DAYS } from './client';
import type { Activity, ActivityType, SenderType } from '@/lib/types';
import { v4 as uuid } from 'uuid';

export async function createActivity(
  roomId: string,
  type: ActivityType,
  senderType: SenderType,
  senderId: string,
  data: Record<string, unknown> = {}
): Promise<Activity> {
  const now = new Date().toISOString();
  const activityId = uuid();

  const activity = {
    roomId,
    activityId,
    type,
    createdAt: now,
    senderType,
    senderId,
    ...data,
  } as Activity;

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        // SK now includes activityId to prevent timestamp collision
        ...keys.activity(roomId, now, activityId),
        ...activity,
        entityType: 'Activity',
        // TTL: Activities expire after 90 days for automatic cleanup
        ttl: calculateTTL(TTL_DAYS.activities),
      },
    })
  );

  return activity;
}

export async function getRoomActivities(
  roomId: string,
  limit = 100,
  afterTimestamp?: string
): Promise<Activity[]> {
  const params: {
    TableName: string;
    KeyConditionExpression: string;
    ExpressionAttributeValues: Record<string, string>;
    ScanIndexForward: boolean;
    Limit: number;
  } = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `ROOM#${roomId}`,
      ':sk': skPrefix.activities,
    },
    ScanIndexForward: false, // newest first
    Limit: limit,
  };

  if (afterTimestamp) {
    params.KeyConditionExpression = 'PK = :pk AND SK > :sk';
    params.ExpressionAttributeValues = {
      ':pk': `ROOM#${roomId}`,
      ':sk': `ACTIVITY#${afterTimestamp}`,
    };
  }

  const result = await docClient.send(new QueryCommand(params));

  return (result.Items || []).map((item) => {
    const { PK, SK, entityType, ttl, ...activity } = item;
    return activity as Activity;
  });
}

// Helper functions for common activity types
export async function logChatMessage(
  roomId: string,
  senderId: string,
  senderType: SenderType,
  text: string
): Promise<Activity> {
  return createActivity(roomId, 'ChatMessage', senderType, senderId, { text });
}

export async function logRoomCreated(
  roomId: string,
  userId: string,
  roomName: string
): Promise<Activity> {
  return createActivity(roomId, 'RoomCreated', 'system', userId, { roomName });
}

export async function logMemberJoined(
  roomId: string,
  userId: string,
  memberName: string
): Promise<Activity> {
  return createActivity(roomId, 'MemberJoined', 'system', userId, { memberName });
}

export async function logCriteriaUpdated(
  roomId: string,
  userId: string,
  criteriaRef: string,
  summary: string
): Promise<Activity> {
  return createActivity(roomId, 'CriteriaUpdated', 'user', userId, {
    criteriaRef,
    summary,
  });
}

export async function logSearchExecuted(
  roomId: string,
  userId: string,
  resultsCount: number,
  criteriaRef?: string
): Promise<Activity> {
  return createActivity(roomId, 'SearchExecuted', 'user', userId, {
    resultsCount,
    criteriaRef,
  });
}

export async function logCompatibilityComputed(
  roomId: string,
  compatibilityRef: string,
  scorePercent: number,
  level: string
): Promise<Activity> {
  return createActivity(roomId, 'CompatibilityComputed', 'system', 'system', {
    compatibilityRef,
    scorePercent,
    level,
  });
}

export async function logListingPinned(
  roomId: string,
  userId: string,
  listingId: string,
  listingTitle: string
): Promise<Activity> {
  return createActivity(roomId, 'ListingPinned', 'user', userId, {
    listingId,
    listingTitle,
  });
}

export async function logListingStatusChanged(
  roomId: string,
  userId: string,
  listingId: string,
  listingTitle: string,
  fromStatus: string,
  toStatus: string
): Promise<Activity> {
  return createActivity(roomId, 'ListingStatusChanged', 'user', userId, {
    listingId,
    listingTitle,
    fromStatus,
    toStatus,
  });
}

export async function logListingVisitScheduled(
  roomId: string,
  userId: string,
  listingId: string,
  listingTitle: string,
  visitPlannedAt: string
): Promise<Activity> {
  return createActivity(roomId, 'ListingVisitScheduled', 'user', userId, {
    listingId,
    listingTitle,
    visitPlannedAt,
  });
}

export async function logAICriteriaProposed(
  roomId: string,
  criteriaRef: string,
  summary: string
): Promise<Activity> {
  return createActivity(roomId, 'AICriteriaProposed', 'ai_copilot', 'ai_copilot', {
    criteriaRef,
    summary,
  });
}

export async function logAICompromiseProposed(
  roomId: string,
  criteriaRef: string,
  summary: string
): Promise<Activity> {
  return createActivity(roomId, 'AICompromiseProposed', 'ai_copilot', 'ai_copilot', {
    criteriaRef,
    summary,
  });
}

