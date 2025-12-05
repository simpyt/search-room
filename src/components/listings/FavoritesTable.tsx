'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Listing, ListingStatus } from '@/lib/types';
import {
  LISTING_STATUSES,
  LISTING_STATUS_LABELS,
  LISTING_STATUS_COLORS,
  USERS,
} from '@/lib/types';
import { toast } from 'sonner';
import { isHomegateTheme } from '@/lib/theme';

interface FavoritesTableProps {
  favorites: Listing[];
  onStatusChange: () => void;
  roomId: string;
}

export function FavoritesTable({
  favorites,
  onStatusChange,
  roomId,
}: FavoritesTableProps) {
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className={`hover:bg-transparent ${hg ? 'border-gray-200' : 'border-slate-700/50'}`}>
            <TableHead className={hg ? 'text-gray-500' : 'text-slate-400'}>Property</TableHead>
            <TableHead className={hg ? 'text-gray-500' : 'text-slate-400'}>Price</TableHead>
            <TableHead className={hg ? 'text-gray-500' : 'text-slate-400'}>Details</TableHead>
            <TableHead className={hg ? 'text-gray-500' : 'text-slate-400'}>Added by</TableHead>
            <TableHead className={hg ? 'text-gray-500' : 'text-slate-400'}>Status</TableHead>
            <TableHead className={`w-[50px] ${hg ? 'text-gray-500' : 'text-slate-400'}`}></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {favorites.map((listing) => {
            const addedBy = USERS[listing.addedByUserId];

            return (
              <TableRow
                key={listing.listingId}
                className={hg ? 'border-gray-200 hover:bg-gray-50' : 'border-slate-700/50 hover:bg-slate-800/30'}
              >
                <TableCell>
                  <Link
                    href={`/rooms/${roomId}/listings/${listing.listingId}`}
                    className={`transition-colors ${hg ? 'hover:text-[#e5007d]' : 'hover:text-sky-400'}`}
                  >
                    <div className={`font-medium line-clamp-1 ${hg ? 'text-gray-900' : 'text-white'}`}>
                      {listing.title}
                    </div>
                    <div className={`text-sm ${hg ? 'text-gray-500' : 'text-slate-400'}`}>{listing.location}</div>
                  </Link>
                </TableCell>
                <TableCell>
                  {listing.price ? (
                    <span className={hg ? 'text-gray-900' : 'text-white'}>
                      CHF {listing.price.toLocaleString()}
                    </span>
                  ) : (
                    <span className={hg ? 'text-gray-400' : 'text-slate-500'}>-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {listing.rooms && (
                      <Badge variant="outline" className={`text-xs ${hg ? 'border-gray-300' : 'border-slate-600'}`}>
                        {listing.rooms} rooms
                      </Badge>
                    )}
                    {listing.livingSpace && (
                      <Badge variant="outline" className={`text-xs ${hg ? 'border-gray-300' : 'border-slate-600'}`}>
                        {listing.livingSpace} m²
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback
                        style={{ backgroundColor: addedBy?.avatarColor }}
                        className="text-xs text-white"
                      >
                        {addedBy?.name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`text-sm ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
                      {addedBy?.name || listing.addedByUserId}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={listing.status}
                    onValueChange={(v) =>
                      handleStatusChange(listing, v as ListingStatus)
                    }
                    disabled={updating === listing.listingId}
                  >
                    <SelectTrigger className={`w-[140px] h-8 text-xs ${hg ? 'bg-white border-gray-300' : 'bg-slate-800/50 border-slate-700'}`}>
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
                </TableCell>
                <TableCell>
                  <Link href={`/rooms/${roomId}/listings/${listing.listingId}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

