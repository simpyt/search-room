'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Listing, UserCriteria } from '@/lib/types';
import { USERS } from '@/lib/types';
import { isHomegateTheme } from '@/lib/theme';

interface CriteriaConformityProps {
  listing: Listing;
  usersCriteria: Record<string, UserCriteria | null>;
}

type MatchLevel = 'match' | 'near' | 'miss' | 'unknown';

interface ConformityRow {
  field: string;
  label: string;
  listingValue: string;
  userMatches: Record<string, { level: MatchLevel; weight?: number }>;
}

function getMatchLevel(
  listingValue: number | undefined,
  min: number | undefined,
  max: number | undefined,
  tolerance = 0.1
): MatchLevel {
  if (listingValue === undefined) return 'unknown';
  if (min === undefined && max === undefined) return 'unknown';

  const minVal = min ?? 0;
  const maxVal = max ?? Infinity;

  if (listingValue >= minVal && listingValue <= maxVal) {
    return 'match';
  }

  // Check if within tolerance (near miss)
  const range = maxVal === Infinity ? minVal : maxVal - minVal;
  const toleranceAmount = range * tolerance;

  if (
    (min !== undefined && listingValue >= min - toleranceAmount && listingValue < min) ||
    (max !== undefined && listingValue <= max + toleranceAmount && listingValue > max)
  ) {
    return 'near';
  }

  return 'miss';
}

function getMatchIcon(level: MatchLevel) {
  switch (level) {
    case 'match':
      return (
        <span className="text-green-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      );
    case 'near':
      return (
        <span className="text-yellow-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      );
    case 'miss':
      return (
        <span className="text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      );
    default:
      return (
        <span className="text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm6-2.438c0-.724.588-1.312 1.313-1.312h4.874c.725 0 1.313.588 1.313 1.313v4.874c0 .725-.588 1.313-1.313 1.313H9.564a1.312 1.312 0 0 1-1.313-1.313V9.563Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      );
  }
}

export function CriteriaConformity({
  listing,
  usersCriteria,
}: CriteriaConformityProps) {
  const userIds = Object.keys(usersCriteria);
  const hg = isHomegateTheme();

  if (userIds.length === 0) {
    return (
      <div className={`text-center py-4 ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
        No criteria set to compare against.
      </div>
    );
  }

  const rows: ConformityRow[] = [
    {
      field: 'price',
      label: 'Price',
      listingValue: listing.price
        ? `CHF ${listing.price.toLocaleString()}`
        : '-',
      userMatches: {},
    },
    {
      field: 'rooms',
      label: 'Rooms',
      listingValue: listing.rooms ? `${listing.rooms}` : '-',
      userMatches: {},
    },
    {
      field: 'livingSpace',
      label: 'Living Space',
      listingValue: listing.livingSpace ? `${listing.livingSpace} m²` : '-',
      userMatches: {},
    },
    {
      field: 'location',
      label: 'Location',
      listingValue: listing.location || '-',
      userMatches: {},
    },
  ];

  // Calculate matches for each user
  for (const userId of userIds) {
    const criteria = usersCriteria[userId]?.criteria;
    const weights = usersCriteria[userId]?.weights || {};

    if (!criteria) {
      rows.forEach((row) => {
        row.userMatches[userId] = { level: 'unknown' };
      });
      continue;
    }

    // Price match
    rows[0].userMatches[userId] = {
      level: getMatchLevel(listing.price, criteria.priceFrom, criteria.priceTo),
      weight: weights.priceTo || weights.priceFrom,
    };

    // Rooms match
    rows[1].userMatches[userId] = {
      level: getMatchLevel(listing.rooms, criteria.roomsFrom, criteria.roomsTo),
      weight: weights.roomsTo || weights.roomsFrom,
    };

    // Living space match
    rows[2].userMatches[userId] = {
      level: getMatchLevel(
        listing.livingSpace,
        criteria.livingSpaceFrom,
        criteria.livingSpaceTo
      ),
      weight: weights.livingSpaceTo || weights.livingSpaceFrom,
    };

    // Location match (simple string comparison for now)
    const locationMatch =
      !criteria.location ||
      listing.location.toLowerCase().includes(criteria.location.toLowerCase());
    rows[3].userMatches[userId] = {
      level: locationMatch ? 'match' : 'miss',
      weight: weights.location,
    };
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className={`border-b ${hg ? 'border-gray-200' : 'border-slate-700/50'}`}>
            <th className={`px-4 py-3 text-left text-sm font-medium ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
              Criteria
            </th>
            <th className={`px-4 py-3 text-left text-sm font-medium ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
              Listing Value
            </th>
            {userIds.map((userId) => {
              const user = USERS[userId];
              return (
                <th key={userId} className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback
                        style={{ backgroundColor: user?.avatarColor }}
                        className="text-xs text-white"
                      >
                        {user?.name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                      {user?.name || userId}
                    </span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.field} className={`border-b ${hg ? 'border-gray-100' : 'border-slate-800/50'}`}>
              <td className={`px-4 py-3 text-sm ${hg ? 'text-gray-600' : 'text-slate-300'}`}>{row.label}</td>
              <td className={`px-4 py-3 text-sm ${hg ? 'text-gray-900' : 'text-white'}`}>{row.listingValue}</td>
              {userIds.map((userId) => {
                const match = row.userMatches[userId];
                return (
                  <td key={userId} className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      {getMatchIcon(match?.level || 'unknown')}
                      {match?.weight && (
                        <span className="text-amber-400 text-xs">
                          {'★'.repeat(match.weight === 5 ? 3 : match.weight === 3 ? 2 : 1)}
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className={`flex gap-4 mt-4 text-xs ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
        <div className="flex items-center gap-1">
          {getMatchIcon('match')}
          <span>Match</span>
        </div>
        <div className="flex items-center gap-1">
          {getMatchIcon('near')}
          <span>Near miss</span>
        </div>
        <div className="flex items-center gap-1">
          {getMatchIcon('miss')}
          <span>Miss</span>
        </div>
        <div className="flex items-center gap-1">
          {getMatchIcon('unknown')}
          <span>Unknown</span>
        </div>
      </div>
    </div>
  );
}

