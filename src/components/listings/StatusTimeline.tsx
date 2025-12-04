'use client';

import { Badge } from '@/components/ui/badge';
import type { ListingStatus } from '@/lib/types';
import {
  LISTING_STATUS_LABELS,
  LISTING_STATUS_COLORS,
} from '@/lib/types';
import { isHomegateTheme } from '@/lib/theme';

interface StatusTimelineProps {
  currentStatus: ListingStatus;
}

const STATUS_ORDER: ListingStatus[] = [
  'UNSEEN',
  'SEEN',
  'VISIT_PLANNED',
  'VISITED',
  'APPLIED',
  'ACCEPTED',
];

export function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const isRejectedOrDeleted = currentStatus === 'REJECTED' || currentStatus === 'DELETED';
  const hg = isHomegateTheme();

  return (
    <div className="relative">
      {/* Timeline */}
      <div className="flex items-center justify-between">
        {STATUS_ORDER.map((status, index) => {
          const isPast = index < currentIndex;
          const isCurrent = status === currentStatus;

          return (
            <div key={status} className="flex-1 relative">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={`absolute top-3 right-1/2 w-full h-0.5 ${
                    isPast || isCurrent
                      ? LISTING_STATUS_COLORS[currentStatus]
                      : hg ? 'bg-gray-300' : 'bg-slate-700'
                  }`}
                  style={{ transform: 'translateX(-50%)' }}
                />
              )}

              {/* Step */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isCurrent
                      ? LISTING_STATUS_COLORS[status]
                      : isPast
                      ? LISTING_STATUS_COLORS[currentStatus]
                      : hg ? 'bg-gray-300' : 'bg-slate-700'
                  }`}
                >
                  {isPast ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3 text-white"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : isCurrent ? (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${hg ? 'bg-gray-400' : 'bg-slate-500'}`} />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs text-center ${
                    isCurrent
                      ? hg ? 'text-gray-900 font-medium' : 'text-white font-medium'
                      : isPast
                      ? hg ? 'text-gray-700' : 'text-slate-300'
                      : hg ? 'text-gray-400' : 'text-slate-500'
                  }`}
                >
                  {LISTING_STATUS_LABELS[status]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Special status indicator for Rejected/Deleted */}
      {isRejectedOrDeleted && (
        <div className="mt-4 flex justify-center">
          <Badge
            variant="outline"
            className={`${LISTING_STATUS_COLORS[currentStatus]} border-transparent text-white`}
          >
            {LISTING_STATUS_LABELS[currentStatus]}
          </Badge>
        </div>
      )}
    </div>
  );
}

