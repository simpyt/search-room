'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Listing } from '@/lib/types';

interface SearchResult {
  id: string;
  title: string;
  location: string;
  price?: number;
  rooms?: number;
  livingSpace?: number;
  imageUrl?: string;
  externalUrl?: string;
  listingType?: 'STANDARD' | 'PREMIUM' | 'TOP';
}

interface ResultsGridProps {
  results: SearchResult[];
  favorites: Listing[];
  onPin: (result: SearchResult) => void;
}

function ListingTypeBadge({ type }: { type?: 'STANDARD' | 'PREMIUM' | 'TOP' }) {
  if (!type || type === 'STANDARD') return null;

  const styles = {
    PREMIUM: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-lg shadow-amber-500/30',
    TOP: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30',
  };

  return (
    <span
      className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${styles[type]} animate-in fade-in slide-in-from-left-2 duration-300`}
    >
      {type}
    </span>
  );
}

export function ResultsGrid({ results, favorites, onPin }: ResultsGridProps) {
  const pinnedIds = new Set(favorites.map((f) => f.externalId));

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-slate-700/50 to-slate-800/50 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-10 w-10 text-slate-500"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <p className="text-slate-400 text-lg">No results to display</p>
        <p className="text-slate-500 text-sm mt-1">Run a search to find properties</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {results.map((result, index) => {
        const isPinned = pinnedIds.has(result.id);

        return (
          <Card
            key={result.id}
            className="group relative border-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-sky-500/10 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
          >
            {/* Image container */}
            <div className="aspect-[16/10] relative overflow-hidden">
              {result.imageUrl ? (
                <>
                  <Image
                    src={result.imageUrl}
                    alt={result.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-60" />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-sky-500/20 blur-2xl rounded-full" />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-14 w-14 text-slate-500 relative"
                    >
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Listing type badge */}
              <ListingTypeBadge type={result.listingType} />

              {/* Pin/favorite button */}
              <Button
                size="icon"
                variant="ghost"
                className={`absolute top-3 right-3 h-9 w-9 rounded-full backdrop-blur-md transition-all duration-200 ${
                  isPinned
                    ? 'bg-rose-500/90 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600'
                    : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white hover:scale-110'
                }`}
                onClick={() => !isPinned && onPin(result)}
                disabled={isPinned}
              >
                {isPinned ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4.5 w-4.5"
                  >
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4.5 w-4.5"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                )}
              </Button>

              {/* Price overlay on image */}
              {result.price && (
                <div className="absolute bottom-3 left-3">
                  <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md">
                    <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      CHF {result.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <CardContent className="p-4 pt-3">
              <h3 className="font-semibold text-white line-clamp-2 mb-1.5 group-hover:text-sky-300 transition-colors">
                {result.title}
              </h3>
              <p className="text-sm text-slate-400 mb-3 flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-3.5 w-3.5 text-slate-500"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {result.location}
              </p>

              {/* Property details */}
              <div className="flex items-center gap-3 text-sm">
                {result.rooms && (
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4 text-slate-500"
                    >
                      <path d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" />
                      <path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
                      <path d="M3 20h18" />
                    </svg>
                    <span>{result.rooms} rooms</span>
                  </div>
                )}
                {result.livingSpace && (
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4 text-slate-500"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M9 21V9" />
                    </svg>
                    <span>{result.livingSpace} m²</span>
                  </div>
                )}
              </div>

              {/* External link */}
              {result.externalUrl && (
                <a
                  href={result.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors group/link"
                >
                  View on Homegate
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" x2="21" y1="14" y2="3" />
                  </svg>
                </a>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
