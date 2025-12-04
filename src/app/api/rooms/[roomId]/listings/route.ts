import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { isUserMemberOfRoom } from '@/lib/db/rooms';
import {
  createListing,
  getRoomListings,
  findListingByExternalId,
} from '@/lib/db/listings';
import { logListingPinned } from '@/lib/db/activities';

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

    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    const listings = await getRoomListings(roomId, includeDeleted);

    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Get listings error:', error);
    return NextResponse.json(
      { error: 'Failed to get listings' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

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
    const {
      externalId,
      title,
      location,
      address,
      price,
      currency,
      rooms,
      livingSpace,
      yearBuilt,
      features,
      imageUrl,
      externalUrl,
      sourceBrand = 'homegate',
    } = body;

    if (!title || !location) {
      return NextResponse.json(
        { error: 'Title and location are required' },
        { status: 400 }
      );
    }

    // Check if already pinned (by external ID)
    if (externalId) {
      const existing = await findListingByExternalId(roomId, externalId);
      if (existing) {
        return NextResponse.json(
          { error: 'Listing already exists', existingId: existing.listingId },
          { status: 409 }
        );
      }
    }

    const listing = await createListing({
      roomId,
      sourceBrand,
      externalId,
      title,
      location,
      address,
      price,
      currency,
      rooms,
      livingSpace,
      yearBuilt,
      features,
      imageUrl,
      externalUrl,
      addedByUserId: user.id,
    });

    await logListingPinned(roomId, user.id, listing.listingId, title);

    return NextResponse.json({ listingId: listing.listingId, listing }, { status: 201 });
  } catch (error) {
    console.error('Create listing error:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}

