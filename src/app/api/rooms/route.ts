import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createRoom, getUserRooms, getRoom } from '@/lib/db/rooms';
import { saveUserCriteria, saveCombinedCriteria } from '@/lib/db/criteria';
import { logRoomCreated } from '@/lib/db/activities';
import type { SearchCriteria, CriteriaWeights } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      searchType = 'buy',
      criteria,
      weights,
    }: {
      name: string;
      searchType?: 'buy' | 'rent';
      criteria?: SearchCriteria;
      weights?: CriteriaWeights;
    } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }

    // Create the room
    const room = await createRoom(name.trim(), user.id, searchType);

    // Log room creation
    await logRoomCreated(room.roomId, user.id, room.name);

    // If initial criteria provided, save them
    if (criteria) {
      await saveUserCriteria(
        room.roomId,
        user.id,
        criteria,
        weights || {},
        'manual'
      );

      // Also save as combined criteria initially
      await saveCombinedCriteria(
        room.roomId,
        criteria,
        weights || {},
        [user.id],
        'all'
      );
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roomIds = await getUserRooms(user.id);
    const rooms = await Promise.all(
      roomIds.map((roomId) => getRoom(roomId))
    );

    return NextResponse.json({
      rooms: rooms.filter(Boolean),
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    return NextResponse.json(
      { error: 'Failed to get rooms' },
      { status: 500 }
    );
  }
}

