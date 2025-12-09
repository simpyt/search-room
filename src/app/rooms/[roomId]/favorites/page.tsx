'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRoom } from '../RoomContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FavoritesTable, FavoritesGrid, FavoritesKanban } from '@/components/listings';
import { AddFromUrlModal, SearchExplainerModal } from '@/components/favorites';
import type { Listing } from '@/lib/types';
import { isHomegateTheme } from '@/lib/theme';

type ViewMode = 'list' | 'grid' | 'kanban';

const VIEW_STORAGE_KEY = 'favorites-view-mode';

export default function FavoritesPage() {
  const router = useRouter();
  const { room, refreshActivities } = useRoom();
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [addUrlModalOpen, setAddUrlModalOpen] = useState(false);
  const [searchExplainerOpen, setSearchExplainerOpen] = useState(false);

  const roomId = room?.roomId;
  const hg = isHomegateTheme();

  // Load view preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved && ['list', 'grid', 'kanban'].includes(saved)) {
      setViewMode(saved as ViewMode);
    }
  }, []);

  // Save view preference
  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_STORAGE_KEY, mode);
  };

  const fetchFavorites = async () => {
    if (!roomId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/listings`);
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.listings || []);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const handleStatusChange = () => {
    fetchFavorites();
    refreshActivities();
  };

  if (!room) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href={`/rooms/${roomId}`}>
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 ${hg ? 'text-gray-500 hover:text-gray-700' : 'text-slate-400 hover:text-white'}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
          </Link>
          <div>
            <h1 className={`text-xl font-bold ${hg ? 'text-gray-900' : 'text-white'}`}>
              Favorites
            </h1>
            <p className={`text-sm ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
              {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Button */}
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

          {/* View Toggle */}
          <div className={`flex items-center rounded-lg p-1 ${hg ? 'bg-gray-100' : 'bg-slate-800/50'}`}>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${
                viewMode === 'list'
                  ? hg
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'bg-slate-700 text-white'
                  : hg
                    ? 'text-gray-500 hover:text-gray-700'
                    : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => handleViewChange('list')}
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
              className={`h-8 w-8 ${
                viewMode === 'grid'
                  ? hg
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'bg-slate-700 text-white'
                  : hg
                    ? 'text-gray-500 hover:text-gray-700'
                    : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => handleViewChange('grid')}
              title="Grid view"
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
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${
                viewMode === 'kanban'
                  ? hg
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'bg-slate-700 text-white'
                  : hg
                    ? 'text-gray-500 hover:text-gray-700'
                    : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => handleViewChange('kanban')}
              title="Kanban view"
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
                <rect x="3" y="3" width="5" height="18" rx="1" />
                <rect x="10" y="3" width="5" height="12" rx="1" />
                <rect x="17" y="3" width="5" height="8" rx="1" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${hg ? 'border-[#e5007d]' : 'border-sky-500'}`} />
        </div>
      ) : (
        <div className={`rounded-xl p-4 ${hg ? 'bg-white border border-gray-200' : 'bg-slate-900/50 border border-slate-700/50'}`}>
          {viewMode === 'list' && (
            <FavoritesTable
              favorites={favorites}
              onStatusChange={handleStatusChange}
              roomId={roomId!}
            />
          )}
          {viewMode === 'grid' && (
            <FavoritesGrid
              favorites={favorites}
              onStatusChange={handleStatusChange}
              roomId={roomId!}
            />
          )}
          {viewMode === 'kanban' && (
            <FavoritesKanban
              favorites={favorites}
              onStatusChange={handleStatusChange}
              roomId={roomId!}
            />
          )}
        </div>
      )}

      {/* Modals */}
      {roomId && (
        <AddFromUrlModal
          open={addUrlModalOpen}
          onOpenChange={setAddUrlModalOpen}
          roomId={roomId}
          onSuccess={handleStatusChange}
        />
      )}

      <SearchExplainerModal
        open={searchExplainerOpen}
        onOpenChange={setSearchExplainerOpen}
        onExpandCriteria={() => router.push(`/rooms/${roomId}`)}
      />
    </div>
  );
}
