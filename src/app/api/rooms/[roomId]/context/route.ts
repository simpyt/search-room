import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { isUserMemberOfRoom, updateRoomContext, getRoom } from '@/lib/db/rooms';
import { generateCriteriaAndContextFromDescription } from '@/lib/ai/openai';

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

    const room = await getRoom(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({
      context: room.context || null,
    });
  } catch (error) {
    console.error('Get room context error:', error);
    return NextResponse.json(
      { error: 'Failed to get room context' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const { description, useAI = true } = body;

    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    let context: {
      description: string;
      familySize?: number;
      profession?: string;
      workLocation?: string;
      preferences?: string[];
    };

    if (useAI) {
      // Use AI to extract structured data
      const result = await generateCriteriaAndContextFromDescription(description.trim());
      context = result.context;
    } else {
      // Just save the raw description
      context = { description: description.trim() };
    }

    const updatedRoom = await updateRoomContext(roomId, context, user.id);

    if (!updatedRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({
      context: updatedRoom.context,
    });
  } catch (error) {
    console.error('Update room context error:', error);
    return NextResponse.json(
      { error: 'Failed to update room context' },
      { status: 500 }
    );
  }
}



