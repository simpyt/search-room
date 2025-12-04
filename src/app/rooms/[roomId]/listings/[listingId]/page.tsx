'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { StatusTimeline } from '@/components/listings/StatusTimeline';
import { CriteriaConformity } from '@/components/listings/CriteriaConformity';
import type { Listing, ListingStatus, UserCriteria } from '@/lib/types';
import {
  LISTING_STATUSES,
  LISTING_STATUS_LABELS,
  LISTING_STATUS_COLORS,
  USERS,
} from '@/lib/types';
import { toast } from 'sonner';
import { isHomegateTheme } from '@/lib/theme';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const listingId = params.listingId as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [usersCriteria, setUsersCriteria] = useState<Record<string, UserCriteria | null>>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [listingRes, criteriaRes] = await Promise.all([
          fetch(`/api/rooms/${roomId}/listings/${listingId}`),
          fetch(`/api/rooms/${roomId}/criteria`),
        ]);

        if (listingRes.ok) {
          const data = await listingRes.json();
          setListing(data.listing);
        } else {
          toast.error('Listing not found');
          router.push(`/rooms/${roomId}`);
        }

        if (criteriaRes.ok) {
          const data = await criteriaRes.json();
          setUsersCriteria(data.usersCriteria || {});
        }
      } catch (error) {
        console.error('Failed to fetch listing:', error);
        toast.error('Failed to load listing');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roomId, listingId, router]);

  const handleStatusChange = async (newStatus: ListingStatus) => {
    if (!listing) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to update status');
        return;
      }

      const data = await res.json();
      setListing(data.listing);
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const hg = isHomegateTheme();

  const getBrandColor = (sourceBrand: string | undefined) => {
    switch (sourceBrand) {
      case 'homegate':
        return { bg: '#e5007d', hover: '#ae0061' };
      case 'immoscout24':
        return { bg: '#7DAED3', hover: '#5d8db3' };
      case 'facebook':
        return { bg: '#1877F2', hover: '#1465d9' };
      case 'anibis':
        return { bg: '#0074D9', hover: '#005ba6' };
      case 'ricardo':
        return { bg: '#FF4500', hover: '#cc3700' };
      case 'comparis':
        return { bg: '#00A651', hover: '#008541' };
      case 'tutti':
        return { bg: '#FF6600', hover: '#cc5200' };
      default:
        return hg ? { bg: '#e5007d', hover: '#ae0061' } : { bg: '#0ea5e9', hover: '#0284c7' };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${hg ? 'border-[#e5007d]' : 'border-sky-500'}`} />
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  const addedBy = USERS[listing.addedByUserId];

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back button */}
      <Link
        href={`/rooms/${roomId}`}
        className={`inline-flex items-center gap-2 mb-6 ${
          hg ? 'text-gray-500 hover:text-gray-900' : 'text-slate-400 hover:text-white'
        }`}
      >
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
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Search Room
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>{listing.title}</h1>
        <div className={`flex items-center gap-4 ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
          <span>{listing.location}</span>
          {listing.address && (
            <>
              <span>•</span>
              <span>{listing.address}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <Card className={`overflow-hidden ${hg ? 'border-gray-200 bg-white' : 'border-slate-700/50 bg-slate-900/50'} py-0`}>
            <div className={`aspect-video relative ${hg ? 'bg-gray-100' : 'bg-slate-800'}`}>
              {listing.imageUrl ? (
                <Image
                  src={listing.imageUrl}
                  alt={listing.title}
                  fill
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-24 w-24 ${hg ? 'text-gray-300' : 'text-slate-600'}`}
                  >
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
              )}
            </div>
          </Card>

          {/* Status Timeline + Update */}
          <Card className={hg ? 'border-gray-200 bg-white' : 'border-slate-700/50 bg-slate-900/50'}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className={hg ? 'text-gray-900' : 'text-white'}>Status</CardTitle>
              <Select
                value={listing.status}
                onValueChange={(v) => handleStatusChange(v as ListingStatus)}
                disabled={updating}
              >
                <SelectTrigger className={`w-auto gap-2 ${LISTING_STATUS_COLORS[listing.status]} border-transparent text-white font-medium [&_svg]:text-white`}>
                  <SelectValue>
                    {LISTING_STATUS_LABELS[listing.status]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {LISTING_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      <Badge
                        variant="outline"
                        className={`${LISTING_STATUS_COLORS[status]} border-transparent text-white`}
                      >
                        {LISTING_STATUS_LABELS[status]}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <StatusTimeline currentStatus={listing.status} />
            </CardContent>
          </Card>

          {/* Criteria Conformity */}
          <Card className={hg ? 'border-gray-200 bg-white' : 'border-slate-700/50 bg-slate-900/50'}>
            <CardHeader>
              <CardTitle className={hg ? 'text-gray-900' : 'text-white'}>Criteria Match</CardTitle>
            </CardHeader>
            <CardContent>
              <CriteriaConformity listing={listing} usersCriteria={usersCriteria} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key details */}
          <Card className={hg ? 'border-gray-200 bg-white' : 'border-slate-700/50 bg-slate-900/50'}>
            <CardHeader>
              <CardTitle className={hg ? 'text-gray-900' : 'text-white'}>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {listing.price && (
                <div className="flex justify-between items-center">
                  <span className={hg ? 'text-gray-500' : 'text-slate-400'}>Price</span>
                  <span className={`text-xl font-bold ${hg ? 'text-gray-900' : 'text-white'}`}>
                    CHF {listing.price.toLocaleString()}
                  </span>
                </div>
              )}

              {listing.rooms && (
                <div className="flex justify-between items-center">
                  <span className={hg ? 'text-gray-500' : 'text-slate-400'}>Rooms</span>
                  <span className={hg ? 'text-gray-900' : 'text-white'}>{listing.rooms}</span>
                </div>
              )}

              {listing.livingSpace && (
                <div className="flex justify-between items-center">
                  <span className={hg ? 'text-gray-500' : 'text-slate-400'}>Living Space</span>
                  <span className={hg ? 'text-gray-900' : 'text-white'}>{listing.livingSpace} m²</span>
                </div>
              )}

              {listing.yearBuilt && (
                <div className="flex justify-between items-center">
                  <span className={hg ? 'text-gray-500' : 'text-slate-400'}>Year Built</span>
                  <span className={hg ? 'text-gray-900' : 'text-white'}>{listing.yearBuilt}</span>
                </div>
              )}

              <div className={`pt-4 border-t ${hg ? 'border-gray-200' : 'border-slate-700/50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm ${hg ? 'text-gray-500' : 'text-slate-400'}`}>Added by</span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback
                      style={{ backgroundColor: addedBy?.avatarColor }}
                      className="text-xs text-white"
                    >
                      {addedBy?.name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className={hg ? 'text-gray-900' : 'text-white'}>{addedBy?.name || listing.addedByUserId}</span>
                </div>
              </div>

              <div className={`pt-4 border-t ${hg ? 'border-gray-200' : 'border-slate-700/50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm ${hg ? 'text-gray-500' : 'text-slate-400'}`}>Seen by</span>
                </div>
                <div className="flex gap-1">
                  {listing.seenBy.map((userId) => {
                    const seenUser = USERS[userId];
                    return (
                      <Avatar key={userId} className="h-6 w-6">
                        <AvatarFallback
                          style={{ backgroundColor: seenUser?.avatarColor }}
                          className="text-xs text-white"
                        >
                          {seenUser?.name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className={hg ? 'border-gray-200 bg-white' : 'border-slate-700/50 bg-slate-900/50'}>
            <CardContent className="pt-6 space-y-3">
              {listing.externalUrl && (() => {
                const brandColors = getBrandColor(listing.sourceBrand);
                return (
                  <Button
                    asChild
                    className="w-full text-white transition-colors bg-[var(--brand-bg)] hover:bg-[var(--brand-hover)]"
                    style={{ '--brand-bg': brandColors.bg, '--brand-hover': brandColors.hover } as React.CSSProperties}
                  >
                    <a
                      href={listing.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on {listing.sourceBrand === 'homegate' ? 'Homegate' : listing.sourceBrand === 'immoscout24' ? 'Immoscout24' : listing.sourceBrand === 'anibis' ? 'Anibis' : listing.sourceBrand === 'facebook' ? 'Facebook' : listing.sourceBrand === 'ricardo' ? 'Ricardo' : listing.sourceBrand === 'comparis' ? 'Comparis' : listing.sourceBrand === 'tutti' ? 'Tutti' : 'Original Site'}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 ml-2"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" x2="21" y1="14" y2="3" />
                    </svg>
                  </a>
                </Button>
                );
              })()}

              <Button
                variant="outline"
                className={`w-full ${hg ? 'border-gray-300 hover:bg-gray-50' : 'border-slate-700 hover:bg-slate-800'}`}
                onClick={() => router.push(`/rooms/${roomId}?discuss=${encodeURIComponent(listing.title)}`)}
              >
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
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Discuss in Chat
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

