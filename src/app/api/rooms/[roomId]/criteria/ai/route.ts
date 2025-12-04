import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { isUserMemberOfRoom } from '@/lib/db/rooms';
import {
  saveUserCriteria,
  getLatestUserCriteria,
  saveCombinedCriteria,
} from '@/lib/db/criteria';
import { logAICriteriaProposed } from '@/lib/db/activities';
import { generateCriteriaFromPrompt } from '@/lib/ai/openai';

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

    const body = await request.json();
    const { prompt, applyToUser } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Get existing criteria for context
    const existingCriteria = await getLatestUserCriteria(roomId, user.id);

    // Generate criteria from prompt
    const { criteria, weights, explanation } = await generateCriteriaFromPrompt(
      prompt,
      existingCriteria?.criteria
    );

    // Save as user criteria if applyToUser is set
    if (applyToUser) {
      const userCriteria = await saveUserCriteria(
        roomId,
        applyToUser,
        criteria,
        weights,
        'ai_proposed'
      );

      // Also update combined criteria
      await saveCombinedCriteria(
        roomId,
        criteria,
        weights,
        [applyToUser],
        'mixed'
      );

      await logAICriteriaProposed(roomId, userCriteria.timestamp, explanation);
    }

    return NextResponse.json({
      criteria,
      weights,
      explanation,
    });
  } catch (error) {
    console.error('AI criteria error:', error);
    return NextResponse.json(
      { error: 'Failed to generate criteria' },
      { status: 500 }
    );
  }
}

