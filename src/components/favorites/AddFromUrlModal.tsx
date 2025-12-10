'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { isHomegateTheme } from '@/lib/theme';

interface ParsedListing {
  title: string;
  location: string;
  address: string | null;
  price: number | null;
  currency: string;
  rooms: number | null;
  livingSpace: number | null;
  yearBuilt: number | null;
  features: string[];
  imageUrl: string | null;
  sourceBrand: string;
  externalId: string;
  externalUrl: string;
}

interface AddFromUrlModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  onSuccess: () => void;
}

export function AddFromUrlModal({
  open,
  onOpenChange,
  roomId,
  onSuccess,
}: AddFromUrlModalProps) {
  const hg = isHomegateTheme();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listing, setListing] = useState<ParsedListing | null>(null);

  const handleFetch = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setListing(null);

    try {
      const res = await fetch(`/api/rooms/${roomId}/listings/from-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch listing');
        return;
      }

      setListing(data.listing);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!listing) return;

    setAdding(true);

    try {
      const res = await fetch(`/api/rooms/${roomId}/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          externalId: listing.externalId,
          title: listing.title,
          location: listing.location,
          address: listing.address,
          price: listing.price,
          currency: listing.currency,
          rooms: listing.rooms,
          livingSpace: listing.livingSpace,
          yearBuilt: listing.yearBuilt,
          features: listing.features,
          imageUrl: listing.imageUrl,
          externalUrl: listing.externalUrl,
          sourceBrand: listing.sourceBrand,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          toast.error('This property is already in your favorites');
        } else {
          toast.error(data.error || 'Failed to add listing');
        }
        return;
      }

      toast.success('Property added to favorites!');
      handleClose();
      onSuccess();
    } catch {
      toast.error('Failed to add listing');
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    setUrl('');
    setError(null);
    setListing(null);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && url.trim()) {
      handleFetch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`sm:max-w-lg ${hg ? 'bg-white' : 'bg-slate-900 border-slate-700'}`}>
        <DialogHeader>
          <DialogTitle className={hg ? 'text-gray-900' : 'text-white'}>
            Add from URL
          </DialogTitle>
          <DialogDescription className={hg ? 'text-gray-500' : 'text-slate-400'}>
            Paste a property listing URL and we&apos;ll extract the details automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* URL Input */}
          <div className="flex gap-2">
            <Input
              placeholder="https://www.homegate.ch/rent/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className={hg ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'}
            />
            <Button
              onClick={handleFetch}
              disabled={loading || !url.trim()}
              className={hg ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white' : 'bg-sky-600 hover:bg-sky-700'}
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'Fetch'
              )}
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <div className={`flex items-start gap-3 p-4 rounded-lg ${
              hg ? 'bg-red-50 border border-red-200' : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-5 w-5 flex-shrink-0 mt-0.5 ${hg ? 'text-red-600' : 'text-red-400'}`}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="flex-1">
                <p className={`text-sm font-medium ${hg ? 'text-red-800' : 'text-red-300'}`}>
                  Could not fetch listing
                </p>
                <p className={`text-sm mt-1 ${hg ? 'text-red-600' : 'text-red-400'}`}>
                  {error}
                </p>
                {error.includes('browser extension') && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className={`mt-3 ${hg ? 'border-red-300 text-red-700 hover:bg-red-100' : 'border-red-500/50 text-red-300 hover:bg-red-500/20'}`}
                  >
                    <Link href="/extension">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 mr-2"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" x2="21" y1="14" y2="3" />
                      </svg>
                      Get Browser Extension
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className={`flex flex-col items-center justify-center py-8 ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mb-3 ${hg ? 'border-[#e5007d]' : 'border-sky-500'}`} />
              <p className="text-sm">Fetching and analyzing page...</p>
              <p className="text-xs mt-1 opacity-70">This may take a few seconds</p>
            </div>
          )}

          {/* Listing Preview */}
          {listing && !loading && (
            <div className={`rounded-lg border overflow-hidden ${
              hg ? 'bg-gray-50 border-gray-200' : 'bg-slate-800/50 border-slate-700'
            }`}>
              {/* Image */}
              {listing.imageUrl && (
                <div className="relative h-40 w-full bg-gray-200">
                  <Image
                    src={listing.imageUrl}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              {/* Details */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className={`font-semibold ${hg ? 'text-gray-900' : 'text-white'}`}>
                    {listing.title}
                  </h3>
                  <p className={`text-sm ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                    {listing.location}
                    {listing.address && ` · ${listing.address}`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {listing.price && (
                    <Badge className={hg ? 'bg-[#e5007d]/10 text-[#e5007d]' : 'bg-sky-500/20 text-sky-400'}>
                      {listing.currency} {listing.price.toLocaleString()}
                    </Badge>
                  )}
                  {listing.rooms && (
                    <Badge variant="outline" className={hg ? 'border-gray-200' : 'border-slate-600'}>
                      {listing.rooms} rooms
                    </Badge>
                  )}
                  {listing.livingSpace && (
                    <Badge variant="outline" className={hg ? 'border-gray-200' : 'border-slate-600'}>
                      {listing.livingSpace} m²
                    </Badge>
                  )}
                  {listing.yearBuilt && (
                    <Badge variant="outline" className={hg ? 'border-gray-200' : 'border-slate-600'}>
                      Built {listing.yearBuilt}
                    </Badge>
                  )}
                </div>

                {listing.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {listing.features.slice(0, 5).map((feature, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          hg ? 'bg-gray-200 text-gray-600' : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {feature}
                      </span>
                    ))}
                    {listing.features.length > 5 && (
                      <span className={`text-xs ${hg ? 'text-gray-400' : 'text-slate-500'}`}>
                        +{listing.features.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                <div className={`flex items-center gap-2 pt-2 border-t ${hg ? 'border-gray-200' : 'border-slate-700'}`}>
                  <span className={`text-xs ${hg ? 'text-gray-400' : 'text-slate-500'}`}>
                    Source: {listing.sourceBrand}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className={hg ? 'border-gray-200' : 'border-slate-700'}
          >
            Cancel
          </Button>
          {listing && (
            <Button
              onClick={handleAdd}
              disabled={adding}
              className={hg ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white' : 'bg-sky-600 hover:bg-sky-700'}
            >
              {adding ? 'Adding...' : 'Add to Favorites'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}





