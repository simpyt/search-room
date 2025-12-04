import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getRoom, isUserMemberOfRoom, addMember } from '@/lib/db/rooms';
import { logMemberJoined } from '@/lib/db/activities';
import { USERS } from '@/lib/types';

type RouteParams = { params: Promise<{ roomId: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = await params;
    const room = await getRoom(roomId);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const isMember = await isUserMemberOfRoom(roomId, user.id);
    if (isMember) {
      return NextResponse.json({ message: 'Already a member' });
    }

    const member = await addMember(roomId, user.id, 'member');
    await logMemberJoined(roomId, user.id, USERS[user.id]?.name || user.id);

    return NextResponse.json({ member });
  } catch (error) {
    console.error('Join room error:', error);
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    );
  }
}

