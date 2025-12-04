import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { isUserMemberOfRoom, getRoomMembers } from '@/lib/db/rooms';
import { getAllUsersCriteria } from '@/lib/db/criteria';
import {
  saveCompatibilitySnapshot,
  getLatestCompatibility,
} from '@/lib/db/compatibility';
import { logCompatibilityComputed } from '@/lib/db/activities';
import { computeCompatibility } from '@/lib/ai/openai';

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

    const compatibility = await getLatestCompatibility(roomId);

    return NextResponse.json({ compatibility });
  } catch (error) {
    console.error('Get compatibility error:', error);
    return NextResponse.json(
      { error: 'Failed to get compatibility' },
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

    // Get all users' criteria
    const usersCriteria = await getAllUsersCriteria(roomId);

    // Need at least 2 users with criteria to compute compatibility
    const criteriaEntries = Object.entries(usersCriteria).filter(([, c]) => c !== null);

    if (criteriaEntries.length < 2) {
      // If less than 2 users have criteria, return 100% compatibility
      const snapshot = await saveCompatibilitySnapshot(
        roomId,
        100,
        'Only one user has set criteria. Compatibility will be calculated when both users have set their preferences.',
        criteriaEntries.map(([, c]) => c!.timestamp)
      );

      await logCompatibilityComputed(
        roomId,
        snapshot.timestamp,
        snapshot.scorePercent,
        snapshot.level
      );

      return NextResponse.json({ compatibility: snapshot });
    }

    // Get the two users' criteria
    const [criteriaA, criteriaB] = criteriaEntries.map(([, c]) => c!);

    // Compute compatibility using AI
    const { scorePercent, comment } = await computeCompatibility(
      criteriaA,
      criteriaB
    );

    // Save the snapshot
    const snapshot = await saveCompatibilitySnapshot(
      roomId,
      scorePercent,
      comment,
      [criteriaA.timestamp, criteriaB.timestamp]
    );

    await logCompatibilityComputed(
      roomId,
      snapshot.timestamp,
      snapshot.scorePercent,
      snapshot.level
    );

    return NextResponse.json({ compatibility: snapshot });
  } catch (error) {
    console.error('Compute compatibility error:', error);
    return NextResponse.json(
      { error: 'Failed to compute compatibility' },
      { status: 500 }
    );
  }
}

