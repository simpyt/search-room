import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { isUserMemberOfRoom } from '@/lib/db/rooms';
import { parseListingFromContent } from '@/lib/ai/listing-parser';

type RouteParams = { params: Promise<{ roomId: string }> };

/**
 * Parse a listing from a URL
 * Fetches the page content server-side and uses AI to extract listing data
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = await params;

    const isMember = await isUserMemberOfRoom(roomId, user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Not a member of this room' }, { status: 403 });
    }

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Fetch the page content
    let html: string;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch page (${response.status})` },
          { status: 422 }
        );
      }

      html = await response.text();
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Could not fetch the page. The website may be blocking requests or unavailable.' },
        { status: 422 }
      );
    }

    // Extract JSON-LD data if present
    let jsonLd: object | null = null;
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        jsonLd = JSON.parse(jsonLdMatch[1]);
      } catch {
        // Ignore JSON-LD parse errors
      }
    }

    // Extract Open Graph data
    const ogData: Record<string, string> = {};
    const ogMatches = html.matchAll(/<meta[^>]*property=["']og:([^"']+)["'][^>]*content=["']([^"']*)["'][^>]*>/gi);
    for (const match of ogMatches) {
      ogData[match[1]] = match[2];
    }
    // Also try reversed attribute order
    const ogMatchesReversed = html.matchAll(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:([^"']+)["'][^>]*>/gi);
    for (const match of ogMatchesReversed) {
      ogData[match[2]] = match[1];
    }

    // Parse the listing using AI
    try {
      const listing = await parseListingFromContent({
        url,
        content: html,
        jsonLd,
        ogData: Object.keys(ogData).length > 0 ? ogData : undefined,
      });

      return NextResponse.json({
        listing: {
          ...listing,
          externalUrl: url,
        },
      });
    } catch (parseError) {
      console.error('Parse error:', parseError);
      return NextResponse.json(
        { error: 'Could not extract listing information from this page. Make sure you are on a property listing page.' },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error('From-URL error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
