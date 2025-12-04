import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getRoomWithMembers,
  isUserMemberOfRoom,
  addMember,
  updateRoom,
  deleteRoom,
  getUserRooms,
} from '@/lib/db/rooms';
import { logMemberJoined } from '@/lib/db/activities';
import { USERS } from '@/lib/types';
import { docClient, TABLE_NAME, keys } from '@/lib/db/client';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';

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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = await params;

    // Check if user is a member
    const isMember = await isUserMemberOfRoom(roomId, user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Not a member of this room' }, { status: 403 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }

    const room = await updateRoom(roomId, { name: name.trim() });
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Update room error:', error);
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = await params;

    // Check if user is a member
    const isMember = await isUserMemberOfRoom(roomId, user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Not a member of this room' }, { status: 403 });
    }

    // Get all user rooms to delete their UserRoom mappings
    const room = await getRoomWithMembers(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Delete UserRoom mappings for all members
    for (const member of room.members) {
      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: keys.userRoom(member.userId, roomId),
        })
      );
    }

    // Delete the room and all related data
    await deleteRoom(roomId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete room error:', error);
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    );
  }
}

