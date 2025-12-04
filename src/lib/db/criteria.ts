import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME, keys, skPrefix } from './client';
import type {
  UserCriteria,
  CombinedCriteria,
  SearchCriteria,
  CriteriaWeights,
  CombineMode,
} from '@/lib/types';

export async function saveUserCriteria(
  roomId: string,
  userId: string,
  criteria: SearchCriteria,
  weights: CriteriaWeights,
  source: 'manual' | 'ai_proposed' = 'manual'
): Promise<UserCriteria> {
  const timestamp = new Date().toISOString();

  const userCriteria: UserCriteria = {
    roomId,
    userId,
    timestamp,
    criteria,
    weights,
    source,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...keys.criteria(roomId, userId, timestamp),
        ...userCriteria,
        entityType: 'Criteria',
      },
    })
  );

  return userCriteria;
}

export async function getLatestUserCriteria(
  roomId: string,
  userId: string
): Promise<UserCriteria | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `ROOM#${roomId}`,
        ':sk': skPrefix.criteria(userId),
      },
      ScanIndexForward: false, // newest first
      Limit: 1,
    })
  );

  if (!result.Items || result.Items.length === 0) return null;

  const { PK, SK, entityType, ...criteria } = result.Items[0];
  return criteria as UserCriteria;
}

export async function getAllUsersCriteria(
  roomId: string
): Promise<Record<string, UserCriteria | null>> {
  // Get all criteria items for the room
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `ROOM#${roomId}`,
        ':sk': skPrefix.allCriteria,
      },
      ScanIndexForward: false,
    })
  );

  const items = result.Items || [];

  // Group by userId and get latest for each
  const userCriteria: Record<string, UserCriteria | null> = {};
  const seen = new Set<string>();

  for (const item of items) {
    // Skip combined criteria
    if (item.SK.startsWith('CRITERIA_COMBINED#')) continue;

    const { PK, SK, entityType, ...criteria } = item;
    const userCrit = criteria as UserCriteria;

    if (!seen.has(userCrit.userId)) {
      seen.add(userCrit.userId);
      userCriteria[userCrit.userId] = userCrit;
    }
  }

  return userCriteria;
}

export async function saveCombinedCriteria(
  roomId: string,
  criteria: SearchCriteria,
  weights: CriteriaWeights,
  fromUserIds: string[],
  combineMode: CombineMode
): Promise<CombinedCriteria> {
  const timestamp = new Date().toISOString();

  const combined: CombinedCriteria = {
    roomId,
    timestamp,
    criteria,
    weights,
    fromUserIds,
    combineMode,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...keys.combinedCriteria(roomId, timestamp),
        ...combined,
        entityType: 'CombinedCriteria',
      },
    })
  );

  return combined;
}

export async function getLatestCombinedCriteria(
  roomId: string
): Promise<CombinedCriteria | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `ROOM#${roomId}`,
        ':sk': skPrefix.combinedCriteria,
      },
      ScanIndexForward: false,
      Limit: 1,
    })
  );

  if (!result.Items || result.Items.length === 0) return null;

  const { PK, SK, entityType, ...combined } = result.Items[0];
  return combined as CombinedCriteria;
}

// Combine criteria from two users based on mode
export function combineCriteria(
  criteriaA: UserCriteria | null,
  criteriaB: UserCriteria | null,
  mode: CombineMode
): { criteria: SearchCriteria; weights: CriteriaWeights } {
  if (!criteriaA && !criteriaB) {
    return { criteria: { offerType: 'buy' }, weights: {} };
  }

  if (!criteriaA) {
    return { criteria: criteriaB!.criteria, weights: criteriaB!.weights };
  }

  if (!criteriaB) {
    return { criteria: criteriaA.criteria, weights: criteriaA.weights };
  }

  const a = criteriaA.criteria;
  const b = criteriaB.criteria;
  const wA = criteriaA.weights;
  const wB = criteriaB.weights;

  const combined: SearchCriteria = {
    offerType: a.offerType || b.offerType,
  };
  const weights: CriteriaWeights = {};

  // Location - use the one with higher weight, or first if equal
  if (a.location || b.location) {
    if (mode === 'all') {
      combined.location = a.location || b.location;
    } else {
      const wLocA = wA.location || 0;
      const wLocB = wB.location || 0;
      combined.location = wLocA >= wLocB ? a.location : b.location;
    }
    weights.location = Math.max(wA.location || 0, wB.location || 0) as 1 | 3 | 5 || undefined;
  }

  // Radius - use wider for 'all', narrower for 'strict', average for 'mixed'
  if (a.radius !== undefined || b.radius !== undefined) {
    const radA = a.radius ?? 50;
    const radB = b.radius ?? 50;
    switch (mode) {
      case 'all':
        combined.radius = Math.max(radA, radB);
        break;
      case 'strict':
        combined.radius = Math.min(radA, radB);
        break;
      case 'mixed':
        combined.radius = Math.round((radA + radB) / 2);
        break;
    }
  }

  // Category
  if (a.category || b.category) {
    combined.category = a.category || b.category;
  }

  // Price range
  const priceFromA = a.priceFrom ?? 0;
  const priceFromB = b.priceFrom ?? 0;
  const priceToA = a.priceTo ?? Infinity;
  const priceToB = b.priceTo ?? Infinity;

  switch (mode) {
    case 'all': // inclusive OR - widest range
      combined.priceFrom = Math.min(priceFromA, priceFromB) || undefined;
      combined.priceTo = Math.max(priceToA, priceToB) === Infinity ? undefined : Math.max(priceToA, priceToB);
      break;
    case 'strict': // exclusive AND - narrowest overlap
      combined.priceFrom = Math.max(priceFromA, priceFromB) || undefined;
      combined.priceTo = Math.min(priceToA, priceToB) === Infinity ? undefined : Math.min(priceToA, priceToB);
      break;
    case 'mixed': // average
      combined.priceFrom = Math.round((priceFromA + priceFromB) / 2) || undefined;
      const avgTo = (priceToA === Infinity || priceToB === Infinity)
        ? (priceToA === Infinity ? priceToB : priceToA)
        : Math.round((priceToA + priceToB) / 2);
      combined.priceTo = avgTo === Infinity ? undefined : avgTo;
      break;
  }

  // Rooms - similar logic
  const roomsFromA = a.roomsFrom ?? 0;
  const roomsFromB = b.roomsFrom ?? 0;
  const roomsToA = a.roomsTo ?? Infinity;
  const roomsToB = b.roomsTo ?? Infinity;

  switch (mode) {
    case 'all':
      combined.roomsFrom = Math.min(roomsFromA, roomsFromB) || undefined;
      combined.roomsTo = Math.max(roomsToA, roomsToB) === Infinity ? undefined : Math.max(roomsToA, roomsToB);
      break;
    case 'strict':
      combined.roomsFrom = Math.max(roomsFromA, roomsFromB) || undefined;
      combined.roomsTo = Math.min(roomsToA, roomsToB) === Infinity ? undefined : Math.min(roomsToA, roomsToB);
      break;
    case 'mixed':
      combined.roomsFrom = Math.round((roomsFromA + roomsFromB) / 2) || undefined;
      const avgRoomsTo = (roomsToA === Infinity || roomsToB === Infinity)
        ? (roomsToA === Infinity ? roomsToB : roomsToA)
        : Math.round((roomsToA + roomsToB) / 2);
      combined.roomsTo = avgRoomsTo === Infinity ? undefined : avgRoomsTo;
      break;
  }

  // Living space - similar logic
  if (a.livingSpaceFrom !== undefined || b.livingSpaceFrom !== undefined ||
      a.livingSpaceTo !== undefined || b.livingSpaceTo !== undefined) {
    const lsFromA = a.livingSpaceFrom ?? 0;
    const lsFromB = b.livingSpaceFrom ?? 0;
    const lsToA = a.livingSpaceTo ?? Infinity;
    const lsToB = b.livingSpaceTo ?? Infinity;

    switch (mode) {
      case 'all':
        combined.livingSpaceFrom = Math.min(lsFromA, lsFromB) || undefined;
        combined.livingSpaceTo = Math.max(lsToA, lsToB) === Infinity ? undefined : Math.max(lsToA, lsToB);
        break;
      case 'strict':
        combined.livingSpaceFrom = Math.max(lsFromA, lsFromB) || undefined;
        combined.livingSpaceTo = Math.min(lsToA, lsToB) === Infinity ? undefined : Math.min(lsToA, lsToB);
        break;
      case 'mixed':
        combined.livingSpaceFrom = Math.round((lsFromA + lsFromB) / 2) || undefined;
        const avgLsTo = (lsToA === Infinity || lsToB === Infinity)
          ? (lsToA === Infinity ? lsToB : lsToA)
          : Math.round((lsToA + lsToB) / 2);
        combined.livingSpaceTo = avgLsTo === Infinity ? undefined : avgLsTo;
        break;
    }
  }

  // Features - union for 'all', intersection for 'strict', union for 'mixed'
  const featuresA = new Set(a.features || []);
  const featuresB = new Set(b.features || []);

  if (featuresA.size > 0 || featuresB.size > 0) {
    switch (mode) {
      case 'all':
      case 'mixed':
        combined.features = [...new Set([...featuresA, ...featuresB])];
        break;
      case 'strict':
        combined.features = [...featuresA].filter(f => featuresB.has(f));
        break;
    }
  }

  // Only with price
  combined.onlyWithPrice = a.onlyWithPrice || b.onlyWithPrice;

  // Free text - concatenate if both exist
  if (a.freeText || b.freeText) {
    combined.freeText = [a.freeText, b.freeText].filter(Boolean).join(' ');
  }

  return { criteria: combined, weights };
}

