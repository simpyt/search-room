import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { isUserMemberOfRoom, getRoom } from '@/lib/db/rooms';
import { logChatMessage, getRoomActivities } from '@/lib/db/activities';
import { getAllUsersCriteria, getLatestCombinedCriteria } from '@/lib/db/criteria';
import { getLatestCompatibility } from '@/lib/db/compatibility';
import { getRoomListings } from '@/lib/db/listings';
import { generateAIResponse, type ChatMessage } from '@/lib/ai/openai';
import type { ChatMessageActivity } from '@/lib/types';

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
    const { message, listingContext } = body;

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
      // Get context for AI (including conversation history)
      const [room, usersCriteria, combinedCriteria, compatibility, listings, activities] =
        await Promise.all([
          getRoom(roomId),
          getAllUsersCriteria(roomId),
          getLatestCombinedCriteria(roomId),
          getLatestCompatibility(roomId),
          getRoomListings(roomId),
          getRoomActivities(roomId, 30), // Fetch recent activities
        ]);

      // Extract chat messages and convert to conversation history format
      const conversationHistory: ChatMessage[] = activities
        .filter((a): a is ChatMessageActivity => a.type === 'ChatMessage')
        .reverse() // Activities come newest-first, we need oldest-first
        .slice(-15) // Keep last 15 messages for context
        .map((a) => ({
          role: a.senderType === 'ai_copilot' ? 'assistant' : 'user',
          content: a.text,
        })) as ChatMessage[];

      // If discussing a specific listing, find it for full context
      let discussedListing = null;
      if (listingContext?.listingId) {
        discussedListing = listings.find(l => l.listingId === listingContext.listingId) || listingContext;
      }

      const context = {
        usersCriteria,
        combinedCriteria,
        compatibility,
        favoritesCount: listings.length,
        userMessage: message.replace(/^@?ai[,:]?\s/i, '').trim(),
        roomContext: room?.context,
        conversationHistory,
        discussedListing,
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

