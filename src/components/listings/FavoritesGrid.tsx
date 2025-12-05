'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Listing, ListingStatus } from '@/lib/types';
import {
  LISTING_STATUSES,
  LISTING_STATUS_LABELS,
  LISTING_STATUS_COLORS,
  USERS,
} from '@/lib/types';
import { toast } from 'sonner';
import { isHomegateTheme } from '@/lib/theme';

interface FavoritesGridProps {
  favorites: Listing[];
  onStatusChange: () => void;
  roomId: string;
}

export function FavoritesGrid({
  favorites,
  onStatusChange,
  roomId,
}: FavoritesGridProps) {
  const [updating, setUpdating] = useState<string | null>(null);
  const hg = isHomegateTheme();

  const handleStatusChange = async (listing: Listing, newStatus: ListingStatus) => {
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
      const res = await fetch(`/api/rooms/${roomId}/listings/${listing.listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, visitPlannedAt }),
      });

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

  if (favorites.length === 0) {
    return (
      <div className={`text-center py-8 ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
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
        <p className="text-xs mt-1">Pin properties from search results to save them</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {favorites.map((listing, index) => {
        const addedBy = USERS[listing.addedByUserId];

        return (
          <Card
            key={listing.listingId}
            className={`group relative border-0 overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl animate-in fade-in slide-in-from-bottom-4 py-0 ${
              hg
                ? 'bg-white border border-gray-200 hover:shadow-[#e5007d]/10'
                : 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 hover:shadow-sky-500/10'
            }`}
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
          >
            {/* Image container */}
            <div className="aspect-[16/10] relative overflow-hidden">
              {listing.imageUrl ? (
                <>
                  <Image
                    src={listing.imageUrl}
                    alt={listing.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t opacity-60 ${
                    hg
                      ? 'from-black/50 via-black/10 to-transparent'
                      : 'from-slate-900 via-slate-900/20 to-transparent'
                  }`} />
                </>
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${
                  hg
                    ? 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100'
                    : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900'
                }`}>
                  <div className="relative">
                    <div className={`absolute inset-0 blur-2xl rounded-full ${hg ? 'bg-[#e5007d]/20' : 'bg-sky-500/20'}`} />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`h-14 w-14 relative ${hg ? 'text-gray-400' : 'text-slate-500'}`}
                    >
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Status badge */}
              <div className="absolute top-3 left-3">
                <Badge
                  variant="outline"
                  className={`${LISTING_STATUS_COLORS[listing.status]} border-transparent text-white text-xs px-2 py-0.5`}
                >
                  {LISTING_STATUS_LABELS[listing.status]}
                </Badge>
              </div>

              {/* Price overlay on image */}
              {listing.price && (
                <div className="absolute bottom-3 left-3">
                  <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md">
                    <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      CHF {listing.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <CardContent className="p-4 pt-3">
              <Link href={`/rooms/${roomId}/listings/${listing.listingId}`}>
                <h3 className={`font-semibold line-clamp-2 mb-1.5 transition-colors ${
                  hg
                    ? 'text-gray-900 group-hover:text-[#e5007d]'
                    : 'text-white group-hover:text-sky-300'
                }`}>
                  {listing.title}
                </h3>
              </Link>
              <p className={`text-sm mb-3 flex items-center gap-1.5 ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`h-3.5 w-3.5 ${hg ? 'text-gray-400' : 'text-slate-500'}`}
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {listing.location}
              </p>

              {/* Property details */}
              <div className="flex items-center gap-3 text-sm mb-3">
                {listing.rooms && (
                  <div className={`flex items-center gap-1.5 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`h-4 w-4 ${hg ? 'text-gray-400' : 'text-slate-500'}`}
                    >
                      <path d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" />
                      <path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
                      <path d="M3 20h18" />
                    </svg>
                    <span>{listing.rooms} rooms</span>
                  </div>
                )}
                {listing.livingSpace && (
                  <div className={`flex items-center gap-1.5 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`h-4 w-4 ${hg ? 'text-gray-400' : 'text-slate-500'}`}
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M9 21V9" />
                    </svg>
                    <span>{listing.livingSpace} m²</span>
                  </div>
                )}
              </div>

              {/* Added by */}
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="h-5 w-5">
                  <AvatarFallback
                    style={{ backgroundColor: addedBy?.avatarColor }}
                    className="text-[10px] text-white"
                  >
                    {addedBy?.name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                  {addedBy?.name || listing.addedByUserId}
                </span>
              </div>

              {/* Status selector */}
              <Select
                value={listing.status}
                onValueChange={(v) => handleStatusChange(listing, v as ListingStatus)}
                disabled={updating === listing.listingId}
              >
                <SelectTrigger className={`w-full h-8 text-xs ${hg ? 'bg-white border-gray-300' : 'bg-slate-800/50 border-slate-700'}`}>
                  <SelectValue>
                    <Badge
                      variant="outline"
                      className={`${LISTING_STATUS_COLORS[listing.status]} border-transparent text-white text-xs`}
                    >
                      {LISTING_STATUS_LABELS[listing.status]}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {LISTING_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      <Badge
                        variant="outline"
                        className={`${LISTING_STATUS_COLORS[status]} border-transparent text-white text-xs`}
                      >
                        {LISTING_STATUS_LABELS[status]}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}



