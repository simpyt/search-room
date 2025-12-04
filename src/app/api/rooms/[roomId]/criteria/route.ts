import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { isUserMemberOfRoom } from '@/lib/db/rooms';
import {
  saveUserCriteria,
  getAllUsersCriteria,
  getLatestCombinedCriteria,
} from '@/lib/db/criteria';
import { logCriteriaUpdated } from '@/lib/db/activities';
import type { SearchCriteria, CriteriaWeights } from '@/lib/types';

type RouteParams = { params: Promise<{ roomId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = await params;

    const isMember = await isUserMemberOfRoom(roomId, user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    const [usersCriteria, combinedCriteria] = await Promise.all([
      getAllUsersCriteria(roomId),
      getLatestCombinedCriteria(roomId),
    ]);

    return NextResponse.json({
      usersCriteria,
      combinedCriteria,
    });
  } catch (error) {
    console.error('Get criteria error:', error);
    return NextResponse.json(
      { error: 'Failed to get criteria' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = await params;

    const isMember = await isUserMemberOfRoom(roomId, user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    const body = await request.json();
    const { criteria, weights }: { criteria: SearchCriteria; weights: CriteriaWeights } = body;

    if (!criteria) {
      return NextResponse.json(
        { error: 'Criteria is required' },
        { status: 400 }
      );
    }

    const userCriteria = await saveUserCriteria(
      roomId,
      user.id,
      criteria,
      weights || {},
      'manual'
    );

    // Generate summary for activity log
    const summary = generateCriteriaSummary(criteria);
    await logCriteriaUpdated(roomId, user.id, userCriteria.timestamp, summary);

    return NextResponse.json({ criteria: userCriteria });
  } catch (error) {
    console.error('Save criteria error:', error);
    return NextResponse.json(
      { error: 'Failed to save criteria' },
      { status: 500 }
    );
  }
}

function generateCriteriaSummary(criteria: SearchCriteria): string {
  const parts: string[] = [];

  if (criteria.location) {
    parts.push(criteria.location);
  }

  if (criteria.priceTo) {
    parts.push(`up to CHF ${criteria.priceTo.toLocaleString()}`);
  }

  if (criteria.roomsFrom || criteria.roomsTo) {
    const rooms = criteria.roomsFrom && criteria.roomsTo
      ? `${criteria.roomsFrom}-${criteria.roomsTo} rooms`
      : criteria.roomsFrom
      ? `${criteria.roomsFrom}+ rooms`
      : `up to ${criteria.roomsTo} rooms`;
    parts.push(rooms);
  }

  return parts.length > 0 ? parts.join(', ') : 'Updated criteria';
}

