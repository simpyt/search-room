'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRoom } from '@/app/rooms/[roomId]/RoomContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CriteriaForm } from '@/components/criteria/CriteriaForm';
import { ResultsGrid } from '@/components/listings/ResultsGrid';
import { FavoritesTable } from '@/components/listings/FavoritesTable';
import { FavoritesGrid } from '@/components/listings/FavoritesGrid';
import { FavoritesKanban } from '@/components/listings/FavoritesKanban';
import type {
  UserCriteria,
  SearchCriteria,
  CriteriaWeights,
  Listing,
} from '@/lib/types';
import { USERS } from '@/lib/types';
import { toast } from 'sonner';
import { isHomegateTheme } from '@/lib/theme';

interface SearchResult {
  id: string;
  title: string;
  location: string;
  price?: number;
  rooms?: number;
  livingSpace?: number;
  imageUrl?: string;
  externalUrl?: string;
}

export function MyView() {
  const { room, user, refreshActivities } = useRoom();
  const [myCriteria, setMyCriteria] = useState<UserCriteria | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [criteriaExpanded, setCriteriaExpanded] = useState(false);
  const [myFavoritesView, setMyFavoritesView] = useState<'list' | 'tiles' | 'kanban'>('list');
  const [partnerFavoritesView, setPartnerFavoritesView] = useState<'list' | 'tiles' | 'kanban'>('list');
  const [showMyArchived, setShowMyArchived] = useState(false);
  const [showPartnerArchived, setShowPartnerArchived] = useState(false);

  const roomId = room?.roomId;
  const partnerId = room?.members.find((m) => m.userId !== user?.id)?.userId;
  const partnerName = partnerId ? USERS[partnerId]?.name : null;

  const fetchData = async () => {
    if (!roomId || !user) return;

    setLoading(true);
    try {
      const [criteriaRes, listingsRes] = await Promise.all([
        fetch(`/api/rooms/${roomId}/criteria`),
        fetch(`/api/rooms/${roomId}/listings?includeDeleted=true`),
      ]);

      if (criteriaRes.ok) {
        const data = await criteriaRes.json();
        setMyCriteria(data.usersCriteria?.[user.id] || null);
      }

      if (listingsRes.ok) {
        const data = await listingsRes.json();
        setFavorites(data.listings || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user?.id]);

  const handleSaveCriteria = async (criteria: SearchCriteria, weights: CriteriaWeights) => {
    if (!roomId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/criteria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria, weights }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to save criteria');
        return;
      }

      toast.success('Criteria saved');
      fetchData();
      refreshActivities();
    } catch (error) {
      toast.error('Failed to save criteria');
    } finally {
      setSaving(false);
    }
  };

  const handleSearchPersonal = async () => {
    if (!roomId) return;

    setSearching(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/search?personal=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Search failed');
        return;
      }

      const data = await res.json();
      setResults(data.results || []);
      toast.success(`Found ${data.results?.length || 0} results`);
      refreshActivities();
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handlePinListing = async (result: SearchResult) => {
    if (!roomId) return;

    try {
      const res = await fetch(`/api/rooms/${roomId}/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          externalId: result.id,
          title: result.title,
          location: result.location,
          price: result.price,
          rooms: result.rooms,
          livingSpace: result.livingSpace,
          imageUrl: result.imageUrl,
          externalUrl: result.externalUrl,
          sourceBrand: 'homegate',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to pin listing');
        return;
      }

      toast.success('Added to favorites');
      fetchData();
      refreshActivities();
    } catch (error) {
      toast.error('Failed to pin listing');
    }
  };

  // Filter favorites to show who added what
  const myFavorites = favorites.filter((f) => f.addedByUserId === user?.id);
  const partnerFavorites = favorites.filter((f) => f.addedByUserId !== user?.id);
  const hg = isHomegateTheme();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${hg ? 'border-[#e5007d]' : 'border-sky-500'}`} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* My Criteria - Collapsible */}
      <Card className={hg ? 'border-gray-200 bg-white' : 'border-slate-700/50 bg-slate-900/50'}>
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => setCriteriaExpanded(!criteriaExpanded)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle className={hg ? 'text-gray-900' : 'text-white'}>My Search Criteria</CardTitle>
              <CardDescription>
                {criteriaExpanded
                  ? 'Set your preferences and priorities with weights'
                  : myCriteria
                    ? `${myCriteria.criteria.location || 'Any location'} • ${myCriteria.criteria.priceTo ? `≤${myCriteria.criteria.priceTo.toLocaleString()} CHF` : 'Any price'} • ${myCriteria.criteria.roomsFrom ? `${myCriteria.criteria.roomsFrom}+ rooms` : 'Any rooms'}`
                    : 'Click to set your preferences'
                }
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`flex-shrink-0 ${hg ? 'text-gray-500 hover:text-gray-700' : 'text-slate-400 hover:text-white'}`}
              onClick={(e) => {
                e.stopPropagation();
                setCriteriaExpanded(!criteriaExpanded);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-5 w-5 transition-transform duration-200 ${criteriaExpanded ? 'rotate-180' : ''}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Button>
          </div>
        </CardHeader>
        {criteriaExpanded && (
          <CardContent>
            <CriteriaForm
              initialCriteria={myCriteria?.criteria}
              initialWeights={myCriteria?.weights}
              onSubmit={handleSaveCriteria}
              submitLabel="Save My Criteria"
              showWeights={true}
              loading={saving}
            />
          </CardContent>
        )}
      </Card>

      {/* Personal Search */}
      <Card className={hg ? 'border-gray-200 bg-white' : 'border-slate-700/50 bg-slate-900/50'}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle className={hg ? 'text-gray-900' : 'text-white'}>My Search Results</CardTitle>
              <CardDescription>Results based on your personal criteria</CardDescription>
            </div>
            <Button
              onClick={handleSearchPersonal}
              disabled={searching || !myCriteria}
              className={`flex-shrink-0 ${hg
                ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white'
                : 'bg-sky-600 hover:bg-sky-700'
              }`}
            >
              {searching ? 'Searching...' : 'Search with My Criteria'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!myCriteria ? (
            <p className={`text-center py-8 ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
              Set your criteria above to search
            </p>
          ) : results.length > 0 ? (
            <ResultsGrid
              results={results}
              favorites={favorites}
              onPin={handlePinListing}
            />
          ) : (
            <p className={`text-center py-8 ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
              Click &quot;Search with My Criteria&quot; to find properties
            </p>
          )}
        </CardContent>
      </Card>

      {/* My Favorites */}
      <Card className={hg ? 'border-gray-200 bg-white' : 'border-slate-700/50 bg-slate-900/50'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={hg ? 'text-gray-900' : 'text-white'}>My Favorites</CardTitle>
              <CardDescription>
                {myFavorites.filter(f => f.status !== 'DELETED').length} {myFavorites.filter(f => f.status !== 'DELETED').length === 1 ? 'property' : 'properties'} you added
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* View Toggle Group */}
              <div className={`inline-flex rounded-lg p-0.5 ${hg ? 'bg-gray-100' : 'bg-slate-800/80'}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-md ${myFavoritesView === 'list' ? (hg ? 'bg-white text-gray-900 shadow-sm' : 'bg-slate-600 text-white') : (hg ? 'text-gray-500 hover:text-gray-700 hover:bg-transparent' : 'text-slate-400 hover:text-white hover:bg-transparent')}`}
                  onClick={() => setMyFavoritesView('list')}
                  title="List view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" />
                    <line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-md ${myFavoritesView === 'tiles' ? (hg ? 'bg-white text-gray-900 shadow-sm' : 'bg-slate-600 text-white') : (hg ? 'text-gray-500 hover:text-gray-700 hover:bg-transparent' : 'text-slate-400 hover:text-white hover:bg-transparent')}`}
                  onClick={() => setMyFavoritesView('tiles')}
                  title="Grid view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-md ${myFavoritesView === 'kanban' ? (hg ? 'bg-white text-gray-900 shadow-sm' : 'bg-slate-600 text-white') : (hg ? 'text-gray-500 hover:text-gray-700 hover:bg-transparent' : 'text-slate-400 hover:text-white hover:bg-transparent')}`}
                  onClick={() => setMyFavoritesView('kanban')}
                  title="Kanban view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="12" rx="1" /><rect x="17" y="3" width="5" height="8" rx="1" />
                  </svg>
                </Button>
              </div>

              {/* Expand to full page */}
              <Link href={`/rooms/${roomId}/favorites`}>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-9 w-9 ${hg ? 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50' : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'}`}
                  title="Open full page"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" x2="14" y1="3" y2="10" />
                    <line x1="3" x2="10" y1="21" y2="14" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {myFavoritesView === 'list' && (
            <FavoritesTable
              favorites={myFavorites.filter(f => f.status !== 'DELETED')}
              onStatusChange={fetchData}
              roomId={roomId!}
            />
          )}
          {myFavoritesView === 'tiles' && (
            <FavoritesGrid
              favorites={myFavorites.filter(f => f.status !== 'DELETED')}
              onStatusChange={fetchData}
              roomId={roomId!}
            />
          )}
          {myFavoritesView === 'kanban' && (
            <FavoritesKanban
              favorites={myFavorites.filter(f => f.status !== 'DELETED')}
              onStatusChange={fetchData}
              roomId={roomId!}
            />
          )}

          {/* Archived Section */}
          {myFavorites.filter(f => f.status === 'DELETED').length > 0 && (
            <div className={`border-t pt-4 ${hg ? 'border-gray-200' : 'border-slate-700/50'}`}>
              <button
                onClick={() => setShowMyArchived(!showMyArchived)}
                className={`flex items-center gap-2 text-sm ${hg ? 'text-gray-500 hover:text-gray-700' : 'text-slate-400 hover:text-slate-200'} transition-colors`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 transition-transform ${showMyArchived ? 'rotate-90' : ''}`}>
                  <path d="m9 18 6-6-6-6" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect width="20" height="5" x="2" y="3" rx="1" />
                  <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                  <path d="M10 12h4" />
                </svg>
                Archived ({myFavorites.filter(f => f.status === 'DELETED').length})
              </button>
              {showMyArchived && (
                <div className="mt-3">
                  <FavoritesTable
                    favorites={myFavorites.filter(f => f.status === 'DELETED')}
                    onStatusChange={fetchData}
                    roomId={roomId!}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partner's Favorites */}
      {partnerFavorites.filter(f => f.status !== 'DELETED').length > 0 && (
        <Card className={hg ? 'border-gray-200 bg-white' : 'border-slate-700/50 bg-slate-900/50'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={hg ? 'text-gray-900' : 'text-white'}>
                  {partnerName ? `${partnerName}'s Favorites` : "Partner's Favorites"}
                </CardTitle>
                <CardDescription>
                  {partnerFavorites.filter(f => f.status !== 'DELETED').length} {partnerFavorites.filter(f => f.status !== 'DELETED').length === 1 ? 'property' : 'properties'} added by your partner
                </CardDescription>
              </div>
              <div className={`inline-flex rounded-lg p-0.5 ${hg ? 'bg-gray-100' : 'bg-slate-800/80'}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-md ${partnerFavoritesView === 'list' ? (hg ? 'bg-white text-gray-900 shadow-sm' : 'bg-slate-600 text-white') : (hg ? 'text-gray-500 hover:text-gray-700 hover:bg-transparent' : 'text-slate-400 hover:text-white hover:bg-transparent')}`}
                  onClick={() => setPartnerFavoritesView('list')}
                  title="List view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" />
                    <line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-md ${partnerFavoritesView === 'tiles' ? (hg ? 'bg-white text-gray-900 shadow-sm' : 'bg-slate-600 text-white') : (hg ? 'text-gray-500 hover:text-gray-700 hover:bg-transparent' : 'text-slate-400 hover:text-white hover:bg-transparent')}`}
                  onClick={() => setPartnerFavoritesView('tiles')}
                  title="Grid view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-md ${partnerFavoritesView === 'kanban' ? (hg ? 'bg-white text-gray-900 shadow-sm' : 'bg-slate-600 text-white') : (hg ? 'text-gray-500 hover:text-gray-700 hover:bg-transparent' : 'text-slate-400 hover:text-white hover:bg-transparent')}`}
                  onClick={() => setPartnerFavoritesView('kanban')}
                  title="Kanban view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="12" rx="1" /><rect x="17" y="3" width="5" height="8" rx="1" />
                  </svg>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {partnerFavoritesView === 'list' && (
              <FavoritesTable
                favorites={partnerFavorites.filter(f => f.status !== 'DELETED')}
                onStatusChange={fetchData}
                roomId={roomId!}
              />
            )}
            {partnerFavoritesView === 'tiles' && (
              <FavoritesGrid
                favorites={partnerFavorites.filter(f => f.status !== 'DELETED')}
                onStatusChange={fetchData}
                roomId={roomId!}
              />
            )}
            {partnerFavoritesView === 'kanban' && (
              <FavoritesKanban
                favorites={partnerFavorites.filter(f => f.status !== 'DELETED')}
                onStatusChange={fetchData}
                roomId={roomId!}
              />
            )}

            {/* Archived Section */}
            {partnerFavorites.filter(f => f.status === 'DELETED').length > 0 && (
              <div className={`border-t pt-4 ${hg ? 'border-gray-200' : 'border-slate-700/50'}`}>
                <button
                  onClick={() => setShowPartnerArchived(!showPartnerArchived)}
                  className={`flex items-center gap-2 text-sm ${hg ? 'text-gray-500 hover:text-gray-700' : 'text-slate-400 hover:text-slate-200'} transition-colors`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 transition-transform ${showPartnerArchived ? 'rotate-90' : ''}`}>
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <rect width="20" height="5" x="2" y="3" rx="1" />
                    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                    <path d="M10 12h4" />
                  </svg>
                  Archived ({partnerFavorites.filter(f => f.status === 'DELETED').length})
                </button>
                {showPartnerArchived && (
                  <div className="mt-3">
                    <FavoritesTable
                      favorites={partnerFavorites.filter(f => f.status === 'DELETED')}
                      onStatusChange={fetchData}
                      roomId={roomId!}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

