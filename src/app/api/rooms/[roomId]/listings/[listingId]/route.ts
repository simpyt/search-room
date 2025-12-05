import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { isUserMemberOfRoom } from '@/lib/db/rooms';
import {
  getListing,
  updateListingStatus,
  markListingAsSeen,
} from '@/lib/db/listings';
import {
  logListingStatusChanged,
  logListingVisitScheduled,
} from '@/lib/db/activities';
import type { ListingStatus } from '@/lib/types';

type RouteParams = { params: Promise<{ roomId: string; listingId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId, listingId } = await params;

    const isMember = await isUserMemberOfRoom(roomId, user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    const listing = await getListing(roomId, listingId);

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Mark as seen by this user
    const updatedListing = await markListingAsSeen(roomId, listingId, user.id);

    return NextResponse.json({ listing: updatedListing || listing });
  } catch (error) {
    console.error('Get listing error:', error);
    return NextResponse.json(
      { error: 'Failed to get listing' },
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

    const { roomId, listingId } = await params;

    const isMember = await isUserMemberOfRoom(roomId, user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    const body = await request.json();
    const { status, visitPlannedAt } = body as {
      status: ListingStatus;
      visitPlannedAt?: string | null;
    };

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    if (status === 'VISIT_PLANNED' && !visitPlannedAt) {
      return NextResponse.json(
        { error: 'Visit date and time are required for planned visits' },
        { status: 400 }
      );
    }

    // Get current listing for logging
    const currentListing = await getListing(roomId, listingId);
    if (!currentListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const previousStatus = currentListing.status;

    const listing = await updateListingStatus(
      roomId,
      listingId,
      status,
      visitPlannedAt
    );

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Log status change
    await logListingStatusChanged(
      roomId,
      user.id,
      listingId,
      listing.title,
      previousStatus,
      status
    );

    if (status === 'VISIT_PLANNED' && visitPlannedAt) {
      await logListingVisitScheduled(
        roomId,
        user.id,
        listingId,
        listing.title,
        visitPlannedAt
      );
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Update listing error:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

