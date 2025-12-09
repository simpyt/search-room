'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRoom } from '@/app/rooms/[roomId]/RoomContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CriteriaDiff } from '@/components/criteria/CriteriaDiff';
import { CompatibilityCard } from '@/components/compatibility/CompatibilityCard';
import { ResultsGrid } from '@/components/listings/ResultsGrid';
import { FavoritesTable } from '@/components/listings/FavoritesTable';
import { FavoritesGrid } from '@/components/listings/FavoritesGrid';
import { FavoritesKanban } from '@/components/listings/FavoritesKanban';
import { AddFromUrlModal, SearchExplainerModal } from '@/components/favorites';
import type {
  UserCriteria,
  CombinedCriteria,
  CompatibilitySnapshot,
  Listing,
  CombineMode,
} from '@/lib/types';
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

export function TogetherView() {
  const router = useRouter();
  const { room, user, refreshActivities } = useRoom();
  const [usersCriteria, setUsersCriteria] = useState<Record<string, UserCriteria | null>>({});
  const [combinedCriteria, setCombinedCriteria] = useState<CombinedCriteria | null>(null);
  const [compatibility, setCompatibility] = useState<CompatibilitySnapshot | null>(null);
  const [combineMode, setCombineMode] = useState<CombineMode>('mixed');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [criteriaExpanded, setCriteriaExpanded] = useState(false);
  const [favoritesView, setFavoritesView] = useState<'list' | 'tiles' | 'kanban'>('list');
  const [addUrlModalOpen, setAddUrlModalOpen] = useState(false);
  const [searchExplainerOpen, setSearchExplainerOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const roomId = room?.roomId;

  const fetchData = async () => {
    if (!roomId) return;
    
    setLoading(true);
    try {
      const [criteriaRes, compatRes, listingsRes] = await Promise.all([
        fetch(`/api/rooms/${roomId}/criteria`),
        fetch(`/api/rooms/${roomId}/compatibility`),
        fetch(`/api/rooms/${roomId}/listings?includeDeleted=true`),
      ]);

      if (criteriaRes.ok) {
        const data = await criteriaRes.json();
        setUsersCriteria(data.usersCriteria || {});
        setCombinedCriteria(data.combinedCriteria || null);
      }

      if (compatRes.ok) {
        const data = await compatRes.json();
        setCompatibility(data.compatibility || null);
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
  }, [roomId]);

  const handleSearch = async () => {
    if (!roomId) return;

    setSearching(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ combineMode }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Search failed');
        return;
      }

      const data = await res.json();
      setResults(data.results || []);
      setCombinedCriteria(data.combinedCriteria || null);
      toast.success(`Found ${data.results?.length || 0} results`);
      refreshActivities();
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleRecalculateCompatibility = async () => {
    if (!roomId) return;

    try {
      const res = await fetch(`/api/rooms/${roomId}/compatibility`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to calculate compatibility');
        return;
      }

      const data = await res.json();
      setCompatibility(data.compatibility);
      toast.success('Compatibility recalculated');
      refreshActivities();
    } catch (error) {
      toast.error('Failed to calculate compatibility');
    }
  };

  const handleAIBuildCriteria = async () => {
    if (!roomId || !aiPrompt.trim()) return;

    setAiLoading(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/criteria/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, applyToUser: user?.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'AI failed to generate criteria');
        return;
      }

      const data = await res.json();
      toast.success(data.explanation || 'Criteria generated!');
      setAiPrompt('');
      fetchData();
      refreshActivities();
    } catch (error) {
      toast.error('AI failed to generate criteria');
    } finally {
      setAiLoading(false);
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

  const hg = isHomegateTheme();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${hg ? 'border-[#e5007d]' : 'border-sky-500'}`} />
      </div>
    );
  }

  // Generate criteria summary for collapsed state
  const getCriteriaSummary = () => {
    const userIds = Object.keys(usersCriteria);
    const criteriaCount = userIds.filter(id => usersCriteria[id]).length;
    if (criteriaCount === 0) return 'No criteria set yet';
    if (combinedCriteria) {
      const c = combinedCriteria.criteria;
      return `${c.location || 'Any location'} • ${c.priceTo ? `≤${c.priceTo.toLocaleString()} CHF` : 'Any price'} • ${c.roomsFrom ? `${c.roomsFrom}+ rooms` : 'Any rooms'}`;
    }
    return `${criteriaCount} member${criteriaCount > 1 ? 's' : ''} have set criteria`;
  };

  return (
    <div className="space-y-6">
      {/* Compatibility Card - Collapsible */}
      <CompatibilityCard
        compatibility={compatibility}
        onRecalculate={handleRecalculateCompatibility}
        collapsible
        defaultExpanded={false}
      />

      {/* Criteria Comparison - Collapsible */}
      <Card className={hg ? 'border-gray-200 bg-white' : 'border-slate-700/50 bg-slate-900/50'}>
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => setCriteriaExpanded(!criteriaExpanded)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle className={hg ? 'text-gray-900' : 'text-white'}>Search Criteria</CardTitle>
              <CardDescription>
                {criteriaExpanded ? 'Compare and combine your preferences' : getCriteriaSummary()}
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
          <CardContent className="space-y-4">
            <CriteriaDiff usersCriteria={usersCriteria} combinedCriteria={combinedCriteria} />

            {/* AI Prompt */}
            <div className={`p-4 rounded-lg border ${
              hg
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-emerald-500/5 border-emerald-500/20'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${hg ? 'text-emerald-700' : 'text-emerald-400'}`}>
                AI Assistant
              </h4>
              <Textarea
                placeholder="Describe what you're looking for... e.g., 'We want a 4.5 room apartment near Fribourg, under 1.2M, ideally with a balcony and parking.'"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className={hg
                  ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 min-h-[80px]'
                  : 'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[80px]'
                }
              />
              <Button
                onClick={handleAIBuildCriteria}
                disabled={!aiPrompt.trim() || aiLoading}
                className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {aiLoading ? 'Generating...' : 'Ask AI to Build Criteria'}
              </Button>
            </div>

            {/* Search Controls */}
            <div className={`flex flex-wrap items-center justify-between gap-4 pt-4 border-t ${hg ? 'border-gray-200' : 'border-slate-700/50'}`}>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${hg ? 'text-gray-500' : 'text-slate-400'}`}>Combine mode:</span>
                <Select value={combineMode} onValueChange={(v) => setCombineMode(v as CombineMode)}>
                  <SelectTrigger className={`w-[180px] ${
                    hg
                      ? 'bg-white border-gray-300'
                      : 'bg-slate-800/50 border-slate-700'
                  }`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Inclusive (OR)</SelectItem>
                    <SelectItem value="mixed">Balanced</SelectItem>
                    <SelectItem value="strict">Strict (AND)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSearch}
                disabled={searching}
                className={`flex-shrink-0 ${hg
                  ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white'
                  : 'bg-sky-600 hover:bg-sky-700'
                }`}
              >
                {searching ? 'Searching...' : 'Search Properties'}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <Card className={hg ? 'border-gray-200 bg-white' : 'border-slate-700/50 bg-slate-900/50'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={hg ? 'text-gray-900' : 'text-white'}>Search Results</CardTitle>
                <CardDescription>{results.length} properties found</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResultsGrid
              results={results}
              favorites={favorites}
              onPin={handlePinListing}
            />
          </CardContent>
        </Card>
      )}

      {/* Favorites */}
      <Card className={hg ? 'border-gray-200 bg-white' : 'border-slate-700/50 bg-slate-900/50'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={hg ? 'text-gray-900' : 'text-white'}>Favorites</CardTitle>
              <CardDescription>
                {favorites.filter(f => f.status !== 'DELETED').length} saved {favorites.filter(f => f.status !== 'DELETED').length === 1 ? 'property' : 'properties'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* View Toggle Group */}
              <div className={`inline-flex rounded-lg p-0.5 ${hg ? 'bg-gray-100' : 'bg-slate-800/80'}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-md ${favoritesView === 'list' ? (hg ? 'bg-white text-gray-900 shadow-sm' : 'bg-slate-600 text-white') : (hg ? 'text-gray-500 hover:text-gray-700 hover:bg-transparent' : 'text-slate-400 hover:text-white hover:bg-transparent')}`}
                  onClick={() => setFavoritesView('list')}
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
                  className={`h-8 w-8 rounded-md ${favoritesView === 'tiles' ? (hg ? 'bg-white text-gray-900 shadow-sm' : 'bg-slate-600 text-white') : (hg ? 'text-gray-500 hover:text-gray-700 hover:bg-transparent' : 'text-slate-400 hover:text-white hover:bg-transparent')}`}
                  onClick={() => setFavoritesView('tiles')}
                  title="Grid view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-md ${favoritesView === 'kanban' ? (hg ? 'bg-white text-gray-900 shadow-sm' : 'bg-slate-600 text-white') : (hg ? 'text-gray-500 hover:text-gray-700 hover:bg-transparent' : 'text-slate-400 hover:text-white hover:bg-transparent')}`}
                  onClick={() => setFavoritesView('kanban')}
                  title="Kanban view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="12" rx="1" /><rect x="17" y="3" width="5" height="8" rx="1" />
                  </svg>
                </Button>
              </div>

              {/* Add Button with Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    className={hg ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white' : 'bg-sky-600 hover:bg-sky-700'}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 mr-1"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    Add
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={hg ? 'bg-white' : 'bg-slate-900 border-slate-700'}>
                  <DropdownMenuItem
                    onClick={() => setAddUrlModalOpen(true)}
                    className={hg ? 'cursor-pointer' : 'cursor-pointer focus:bg-slate-800'}
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
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    Add from URL
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/extension')}
                    className={hg ? 'cursor-pointer' : 'cursor-pointer focus:bg-slate-800'}
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
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" x2="21" y1="14" y2="3" />
                    </svg>
                    Use browser extension
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSearchExplainerOpen(true)}
                    className={hg ? 'cursor-pointer' : 'cursor-pointer focus:bg-slate-800'}
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
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    From the search
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
          {favoritesView === 'list' && (
            <FavoritesTable
              favorites={favorites.filter(f => f.status !== 'DELETED')}
              onStatusChange={fetchData}
              roomId={roomId!}
            />
          )}
          {favoritesView === 'tiles' && (
            <FavoritesGrid
              favorites={favorites.filter(f => f.status !== 'DELETED')}
              onStatusChange={fetchData}
              roomId={roomId!}
            />
          )}
          {favoritesView === 'kanban' && (
            <FavoritesKanban
              favorites={favorites.filter(f => f.status !== 'DELETED')}
              onStatusChange={fetchData}
              roomId={roomId!}
            />
          )}

          {/* Archived/Deleted Section */}
          {favorites.filter(f => f.status === 'DELETED').length > 0 && (
            <div className={`border-t pt-4 ${hg ? 'border-gray-200' : 'border-slate-700/50'}`}>
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`flex items-center gap-2 text-sm ${hg ? 'text-gray-500 hover:text-gray-700' : 'text-slate-400 hover:text-slate-200'} transition-colors`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-4 w-4 transition-transform ${showArchived ? 'rotate-90' : ''}`}
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
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
                  <rect width="20" height="5" x="2" y="3" rx="1" />
                  <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                  <path d="M10 12h4" />
                </svg>
                Archived ({favorites.filter(f => f.status === 'DELETED').length})
              </button>
              {showArchived && (
                <div className="mt-3">
                  <FavoritesTable
                    favorites={favorites.filter(f => f.status === 'DELETED')}
                    onStatusChange={fetchData}
                    roomId={roomId!}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add from URL Modal */}
      {roomId && (
        <AddFromUrlModal
          open={addUrlModalOpen}
          onOpenChange={setAddUrlModalOpen}
          roomId={roomId}
          onSuccess={() => {
            fetchData();
            refreshActivities();
          }}
        />
      )}

      {/* Search Explainer Modal */}
      <SearchExplainerModal
        open={searchExplainerOpen}
        onOpenChange={setSearchExplainerOpen}
        onExpandCriteria={() => setCriteriaExpanded(true)}
      />
    </div>
  );
}

