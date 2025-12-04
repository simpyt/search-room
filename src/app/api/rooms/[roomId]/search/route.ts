import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { isUserMemberOfRoom } from '@/lib/db/rooms';
import {
  getLatestUserCriteria,
  getAllUsersCriteria,
  combineCriteria,
  saveCombinedCriteria,
} from '@/lib/db/criteria';
import { logSearchExecuted } from '@/lib/db/activities';
import { searchHomegate } from '@/lib/homegate/client';
import type { CombineMode } from '@/lib/types';

type RouteParams = { params: Promise<{ roomId: string }> };

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

    const { searchParams } = new URL(request.url);
    const isPersonal = searchParams.get('personal') === 'true';

    const body = await request.json();
    const combineMode: CombineMode = body.combineMode || 'mixed';

    let criteriaToUse;
    let combinedCriteriaRecord = null;

    if (isPersonal) {
      // Use only the current user's criteria
      const userCriteria = await getLatestUserCriteria(roomId, user.id);
      if (!userCriteria) {
        return NextResponse.json(
          { error: 'No criteria set. Please set your search criteria first.' },
          { status: 400 }
        );
      }
      criteriaToUse = userCriteria.criteria;
    } else {
      // Combine criteria from all users
      const usersCriteria = await getAllUsersCriteria(roomId);
      const criteriaEntries = Object.entries(usersCriteria).filter(([, c]) => c !== null);

      if (criteriaEntries.length === 0) {
        return NextResponse.json(
          { error: 'No criteria set. Please set your search criteria first.' },
          { status: 400 }
        );
      }

      if (criteriaEntries.length === 1) {
        criteriaToUse = criteriaEntries[0][1]!.criteria;
      } else {
        const [criteriaA, criteriaB] = criteriaEntries.map(([, c]) => c);
        const combined = combineCriteria(criteriaA, criteriaB, combineMode);
        criteriaToUse = combined.criteria;

        // Save combined criteria
        combinedCriteriaRecord = await saveCombinedCriteria(
          roomId,
          combined.criteria,
          combined.weights,
          criteriaEntries.map(([userId]) => userId),
          combineMode
        );
      }
    }

    // Search Homegate
    const searchResponse = await searchHomegate(criteriaToUse);

    // Log the search
    await logSearchExecuted(roomId, user.id, searchResponse.results.length);

    return NextResponse.json({
      results: searchResponse.results,
      totalCount: searchResponse.totalCount,
      combinedCriteria: combinedCriteriaRecord,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

