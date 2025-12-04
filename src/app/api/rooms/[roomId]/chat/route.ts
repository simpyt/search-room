import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { isUserMemberOfRoom } from '@/lib/db/rooms';
import { logChatMessage } from '@/lib/db/activities';
import { getAllUsersCriteria, getLatestCombinedCriteria } from '@/lib/db/criteria';
import { getLatestCompatibility } from '@/lib/db/compatibility';
import { getRoomListings } from '@/lib/db/listings';
import { generateAIResponse } from '@/lib/ai/openai';

type RouteParams = { params: Promise<{ roomId: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = await params;

    // Check membership
    const isMember = await isUserMemberOfRoom(roomId, user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Log the user's message
    await logChatMessage(roomId, user.id, 'user', message);

    // Check if this is an AI request (starts with "AI" or "@AI")
    const isAIRequest = /^@?ai[,:]?\s/i.test(message);

    if (isAIRequest) {
      // Get context for AI
      const [usersCriteria, combinedCriteria, compatibility, listings] =
        await Promise.all([
          getAllUsersCriteria(roomId),
          getLatestCombinedCriteria(roomId),
          getLatestCompatibility(roomId),
          getRoomListings(roomId),
        ]);

      const context = {
        usersCriteria,
        combinedCriteria,
        compatibility,
        favoritesCount: listings.length,
        userMessage: message.replace(/^@?ai[,:]?\s/i, '').trim(),
      };

      // Generate AI response
      const aiResponse = await generateAIResponse(context, user.name);

      // Log AI response
      await logChatMessage(roomId, 'ai_copilot', 'ai_copilot', aiResponse);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

