'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
}

interface ResultsGridProps {
  results: SearchResult[];
  favorites: Listing[];
  onPin: (result: SearchResult) => void;
}

export function ResultsGrid({ results, favorites, onPin }: ResultsGridProps) {
  const pinnedIds = new Set(favorites.map((f) => f.externalId));

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No results to display. Run a search to find properties.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.map((result) => {
        const isPinned = pinnedIds.has(result.id);

        return (
          <Card
            key={result.id}
            className="border-slate-700/50 bg-slate-800/30 overflow-hidden hover:border-slate-600/50 transition-colors"
          >
            {/* Image placeholder */}
            <div className="aspect-[16/10] bg-slate-700/50 relative">
              {result.imageUrl ? (
                <Image
                  src={result.imageUrl}
                  alt={result.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
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
                    className="h-12 w-12 text-slate-600"
                  >
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
              )}

              {/* Pin button */}
              <Button
                size="icon"
                variant="secondary"
                className={`absolute top-2 right-2 h-8 w-8 ${
                  isPinned
                    ? 'bg-sky-600 text-white hover:bg-sky-700'
                    : 'bg-slate-900/80 hover:bg-slate-800'
                }`}
                onClick={() => !isPinned && onPin(result)}
                disabled={isPinned}
              >
                {isPinned ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
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
                    className="h-4 w-4"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                )}
              </Button>
            </div>

            <CardContent className="p-4">
              <h3 className="font-medium text-white line-clamp-2 mb-2">
                {result.title}
              </h3>
              <p className="text-sm text-slate-400 mb-3">{result.location}</p>

              <div className="flex flex-wrap gap-2">
                {result.price && (
                  <Badge variant="outline" className="border-slate-600 text-white">
                    CHF {result.price.toLocaleString()}
                  </Badge>
                )}
                {result.rooms && (
                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                    {result.rooms} rooms
                  </Badge>
                )}
                {result.livingSpace && (
                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                    {result.livingSpace} m²
                  </Badge>
                )}
              </div>

              {result.externalUrl && (
                <a
                  href={result.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1"
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
                    className="h-3 w-3"
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

