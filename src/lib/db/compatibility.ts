import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME, keys, skPrefix } from './client';
import type { CompatibilitySnapshot } from '@/lib/types';
import { getCompatibilityLevel } from '@/lib/types';

export async function saveCompatibilitySnapshot(
  roomId: string,
  scorePercent: number,
  comment: string,
  criteriaRefs: string[]
): Promise<CompatibilitySnapshot> {
  const timestamp = new Date().toISOString();
  const level = getCompatibilityLevel(scorePercent);

  const snapshot: CompatibilitySnapshot = {
    roomId,
    timestamp,
    scorePercent,
    level,
    comment,
    criteriaRefs,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...keys.compatibility(roomId, timestamp),
        ...snapshot,
        entityType: 'Compatibility',
      },
    })
  );

  return snapshot;
}

export async function getLatestCompatibility(
  roomId: string
): Promise<CompatibilitySnapshot | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `ROOM#${roomId}`,
        ':sk': skPrefix.compatibility,
      },
      ScanIndexForward: false,
      Limit: 1,
    })
  );

  if (!result.Items || result.Items.length === 0) return null;

  const { PK, SK, entityType, ...snapshot } = result.Items[0];
  return snapshot as CompatibilitySnapshot;
}

export async function getCompatibilityHistory(
  roomId: string,
  limit = 10
): Promise<CompatibilitySnapshot[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `ROOM#${roomId}`,
        ':sk': skPrefix.compatibility,
      },
      ScanIndexForward: false,
      Limit: limit,
    })
  );

  return (result.Items || []).map((item) => {
    const { PK, SK, entityType, ...snapshot } = item;
    return snapshot as CompatibilitySnapshot;
  });
}

