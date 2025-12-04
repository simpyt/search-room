'use client';

import { useState, useEffect } from 'react';
import { useRoom } from '@/app/rooms/[roomId]/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CriteriaForm } from '@/components/criteria/CriteriaForm';
import { ResultsGrid } from '@/components/listings/ResultsGrid';
import { FavoritesTable } from '@/components/listings/FavoritesTable';
import { FavoritesGrid } from '@/components/listings/FavoritesGrid';
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
  const [myFavoritesView, setMyFavoritesView] = useState<'list' | 'tiles'>('list');
  const [partnerFavoritesView, setPartnerFavoritesView] = useState<'list' | 'tiles'>('list');

  const roomId = room?.roomId;
  const partnerId = room?.members.find((m) => m.userId !== user?.id)?.userId;
  const partnerName = partnerId ? USERS[partnerId]?.name : null;

  const fetchData = async () => {
    if (!roomId || !user) return;

    setLoading(true);
    try {
      const [criteriaRes, listingsRes] = await Promise.all([
        fetch(`/api/rooms/${roomId}/criteria`),
        fetch(`/api/rooms/${roomId}/listings`),
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
                {myFavorites.length} {myFavorites.length === 1 ? 'property' : 'properties'} you added
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${myFavoritesView === 'list' ? (hg ? 'bg-gray-100 text-gray-900' : 'bg-slate-700 text-white') : (hg ? 'text-gray-500 hover:text-gray-700' : 'text-slate-400 hover:text-white')}`}
                onClick={() => setMyFavoritesView('list')}
                title="List view"
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
                  <line x1="8" x2="21" y1="6" y2="6" />
                  <line x1="8" x2="21" y1="12" y2="12" />
                  <line x1="8" x2="21" y1="18" y2="18" />
                  <line x1="3" x2="3.01" y1="6" y2="6" />
                  <line x1="3" x2="3.01" y1="12" y2="12" />
                  <line x1="3" x2="3.01" y1="18" y2="18" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${myFavoritesView === 'tiles' ? (hg ? 'bg-gray-100 text-gray-900' : 'bg-slate-700 text-white') : (hg ? 'text-gray-500 hover:text-gray-700' : 'text-slate-400 hover:text-white')}`}
                onClick={() => setMyFavoritesView('tiles')}
                title="Tiles view"
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
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {myFavoritesView === 'list' ? (
            <FavoritesTable
              favorites={myFavorites}
              onStatusChange={fetchData}
              roomId={roomId!}
            />
          ) : (
            <FavoritesGrid
              favorites={myFavorites}
              onStatusChange={fetchData}
              roomId={roomId!}
            />
          )}
        </CardContent>
      </Card>

      {/* Partner's Favorites */}
      {partnerFavorites.length > 0 && (
        <Card className={hg ? 'border-gray-200 bg-white' : 'border-slate-700/50 bg-slate-900/50'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={hg ? 'text-gray-900' : 'text-white'}>
                  {partnerName ? `${partnerName}'s Favorites` : "Partner's Favorites"}
                </CardTitle>
                <CardDescription>
                  {partnerFavorites.length} {partnerFavorites.length === 1 ? 'property' : 'properties'} added by your partner
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-9 w-9 ${partnerFavoritesView === 'list' ? (hg ? 'bg-gray-100 text-gray-900' : 'bg-slate-700 text-white') : (hg ? 'text-gray-500 hover:text-gray-700' : 'text-slate-400 hover:text-white')}`}
                  onClick={() => setPartnerFavoritesView('list')}
                  title="List view"
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
                    <line x1="8" x2="21" y1="6" y2="6" />
                    <line x1="8" x2="21" y1="12" y2="12" />
                    <line x1="8" x2="21" y1="18" y2="18" />
                    <line x1="3" x2="3.01" y1="6" y2="6" />
                    <line x1="3" x2="3.01" y1="12" y2="12" />
                    <line x1="3" x2="3.01" y1="18" y2="18" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-9 w-9 ${partnerFavoritesView === 'tiles' ? (hg ? 'bg-gray-100 text-gray-900' : 'bg-slate-700 text-white') : (hg ? 'text-gray-500 hover:text-gray-700' : 'text-slate-400 hover:text-white')}`}
                  onClick={() => setPartnerFavoritesView('tiles')}
                  title="Tiles view"
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
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {partnerFavoritesView === 'list' ? (
              <FavoritesTable
                favorites={partnerFavorites}
                onStatusChange={fetchData}
                roomId={roomId!}
              />
            ) : (
              <FavoritesGrid
                favorites={partnerFavorites}
                onStatusChange={fetchData}
                roomId={roomId!}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

