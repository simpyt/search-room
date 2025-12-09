'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { Listing, ListingStatus } from '@/lib/types';
import {
  LISTING_STATUS_LABELS,
  LISTING_STATUS_COLORS,
  USERS,
} from '@/lib/types';
import { toast } from 'sonner';
import { isHomegateTheme } from '@/lib/theme';

// Kanban columns - excludes DELETED
const KANBAN_STATUSES: ListingStatus[] = [
  'UNSEEN',
  'SEEN',
  'VISIT_PLANNED',
  'VISITED',
  'APPLIED',
  'ACCEPTED',
  'REJECTED',
];

interface FavoritesKanbanProps {
  favorites: Listing[];
  onStatusChange: () => void;
  roomId: string;
}

export function FavoritesKanban({
  favorites,
  onStatusChange,
  roomId,
}: FavoritesKanbanProps) {
  const [updating, setUpdating] = useState<string | null>(null);
  const hg = isHomegateTheme();

  const handleStatusChange = async (
    listing: Listing,
    newStatus: ListingStatus
  ) => {
    setUpdating(listing.listingId);

    let visitPlannedAt: string | null | undefined = undefined;

    if (newStatus === 'VISIT_PLANNED') {
      const input = window.prompt(
        'When is the visit planned? Please enter date and time (e.g. 2024-06-15 14:30)'
      );

      if (!input) {
        setUpdating(null);
        toast.info('Visit date was not saved');
        return;
      }

      const parsedDate = new Date(input);
      if (isNaN(parsedDate.getTime())) {
        setUpdating(null);
        toast.error('Please enter a valid date and time');
        return;
      }

      visitPlannedAt = parsedDate.toISOString();
    } else if (listing.visitPlannedAt) {
      visitPlannedAt = null;
    }

    try {
      const res = await fetch(
        `/api/rooms/${roomId}/listings/${listing.listingId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, visitPlannedAt }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to update status');
        return;
      }

      toast.success('Status updated');
      onStatusChange();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find the listing that was dragged
    const listing = favorites.find((f) => f.listingId === draggableId);
    if (!listing) return;

    const newStatus = destination.droppableId as ListingStatus;

    // Only update if status actually changed
    if (listing.status !== newStatus) {
      handleStatusChange(listing, newStatus);
    }
  };

  // Group favorites by status
  const favoritesByStatus = KANBAN_STATUSES.reduce(
    (acc, status) => {
      acc[status] = favorites.filter((f) => f.status === status);
      return acc;
    },
    {} as Record<ListingStatus, Listing[]>
  );

  if (favorites.length === 0) {
    return (
      <div
        className={`text-center py-12 ${hg ? 'text-gray-500' : 'text-slate-400'}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-12 w-12 mx-auto mb-3 opacity-50"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
        <p>No favorites yet</p>
        <p className="text-xs mt-1">
          Pin properties from search results to save them
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 pb-4 min-w-max">
          {KANBAN_STATUSES.map((status) => (
            <div
              key={status}
              className={`w-[280px] flex-shrink-0 rounded-lg ${
                hg ? 'bg-gray-50' : 'bg-slate-800/30'
              }`}
            >
              {/* Column Header */}
              <div
                className={`px-3 py-2.5 border-b ${
                  hg ? 'border-gray-200' : 'border-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${LISTING_STATUS_COLORS[status]}`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        hg ? 'text-gray-700' : 'text-slate-200'
                      }`}
                    >
                      {LISTING_STATUS_LABELS[status]}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs px-1.5 py-0 ${
                      hg
                        ? 'border-gray-300 text-gray-500'
                        : 'border-slate-600 text-slate-400'
                    }`}
                  >
                    {favoritesByStatus[status].length}
                  </Badge>
                </div>
              </div>

              {/* Droppable Column */}
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-2 min-h-[200px] transition-colors ${
                      snapshot.isDraggingOver
                        ? hg
                          ? 'bg-gray-100'
                          : 'bg-slate-700/30'
                        : ''
                    }`}
                  >
                    {favoritesByStatus[status].map((listing, index) => (
                      <Draggable
                        key={listing.listingId}
                        draggableId={listing.listingId}
                        index={index}
                        isDragDisabled={updating === listing.listingId}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-2 last:mb-0 ${
                              snapshot.isDragging ? 'rotate-2' : ''
                            }`}
                          >
                            <KanbanCard
                              listing={listing}
                              roomId={roomId}
                              isUpdating={updating === listing.listingId}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

interface KanbanCardProps {
  listing: Listing;
  roomId: string;
  isUpdating: boolean;
}

function KanbanCard({ listing, roomId, isUpdating }: KanbanCardProps) {
  const hg = isHomegateTheme();
  const addedBy = USERS[listing.addedByUserId];

  return (
    <Link href={`/rooms/${roomId}/listings/${listing.listingId}`}>
      <div
        className={`rounded-lg overflow-hidden transition-all cursor-grab active:cursor-grabbing ${
          hg
            ? 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
            : 'bg-slate-800/80 border border-slate-700/50 hover:border-slate-600 hover:shadow-lg'
        } ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* Image */}
        <div className="aspect-[16/9] relative overflow-hidden">
          {listing.imageUrl ? (
            <Image
              src={listing.imageUrl}
              alt={listing.title}
              fill
              sizes="280px"
              className="object-cover"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center ${
                hg
                  ? 'bg-gradient-to-br from-gray-100 to-gray-200'
                  : 'bg-gradient-to-br from-slate-700 to-slate-800'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className={`h-8 w-8 ${hg ? 'text-gray-400' : 'text-slate-500'}`}
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          )}
          {/* Price overlay */}
          {listing.price && (
            <div className="absolute bottom-1.5 left-1.5">
              <div className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm">
                <span className="text-xs font-semibold text-white">
                  CHF {listing.price.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2.5">
          <h4
            className={`text-sm font-medium line-clamp-2 leading-tight ${
              hg ? 'text-gray-900' : 'text-white'
            }`}
          >
            {listing.title}
          </h4>
          <p
            className={`text-xs mt-1 flex items-center gap-1 ${
              hg ? 'text-gray-500' : 'text-slate-400'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-3 w-3 flex-shrink-0"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="truncate">{listing.location}</span>
          </p>

          {/* Details row */}
          <div
            className={`flex items-center gap-2 mt-2 text-xs ${
              hg ? 'text-gray-600' : 'text-slate-300'
            }`}
          >
            {listing.rooms && <span>{listing.rooms} rooms</span>}
            {listing.rooms && listing.livingSpace && (
              <span className={hg ? 'text-gray-300' : 'text-slate-600'}>•</span>
            )}
            {listing.livingSpace && <span>{listing.livingSpace} m²</span>}
          </div>

          {/* Added by */}
          <div className="flex items-center gap-1.5 mt-2">
            <Avatar className="h-4 w-4">
              <AvatarFallback
                style={{ backgroundColor: addedBy?.avatarColor }}
                className="text-[8px] text-white"
              >
                {addedBy?.name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <span
              className={`text-[10px] ${hg ? 'text-gray-400' : 'text-slate-500'}`}
            >
              {addedBy?.name || listing.addedByUserId}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}



