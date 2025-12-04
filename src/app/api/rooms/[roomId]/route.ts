import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getRoomWithMembers, isUserMemberOfRoom, addMember } from '@/lib/db/rooms';
import { logMemberJoined } from '@/lib/db/activities';
import { USERS } from '@/lib/types';

type RouteParams = { params: Promise<{ roomId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = await params;
    const room = await getRoomWithMembers(roomId);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if user is a member, if not and it's the other user, auto-join
    const isMember = await isUserMemberOfRoom(roomId, user.id);

    if (!isMember) {
      // For POC: auto-join the other user if they access the room
      await addMember(roomId, user.id, 'member');
      await logMemberJoined(roomId, user.id, USERS[user.id]?.name || user.id);

      // Refresh room data
      const updatedRoom = await getRoomWithMembers(roomId);
      return NextResponse.json({ room: updatedRoom });
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Get room error:', error);
    return NextResponse.json(
      { error: 'Failed to get room' },
      { status: 500 }
    );
  }
}

