import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { parseListingFromContent } from '@/lib/ai/listing-parser';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url, content, jsonLd, ogData } = body;

    if (!url || !content) {
      return NextResponse.json(
        { error: 'URL and content are required' },
        { status: 400 }
      );
    }

    try {
      const listing = await parseListingFromContent({
        url,
        content,
        jsonLd,
        ogData,
      });

      return NextResponse.json({ listing });
    } catch (parseError) {
      console.error('Parse error:', parseError);
      return NextResponse.json(
        { error: 'Could not parse listing' },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error('Extension parse error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

