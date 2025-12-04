import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generateCriteriaAndContextFromDescription } from '@/lib/ai/openai';

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { description } = body;

    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const result = await generateCriteriaAndContextFromDescription(description.trim());

    return NextResponse.json({
      criteria: result.criteria,
      weights: result.weights,
      context: result.context,
      explanation: result.explanation,
    });
  } catch (error) {
    console.error('Context extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze description' },
      { status: 500 }
    );
  }
}

