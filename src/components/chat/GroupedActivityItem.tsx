'use client';

import { useState } from 'react';
import { ChevronDown, Search, ArrowRightLeft, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Activity } from '@/lib/types';
import { USERS } from '@/lib/types';
import { isHomegateTheme } from '@/lib/theme';
import { ActivityItem } from './ActivityItem';

// Compact time formatting
function formatCompactTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export interface ActivityGroup {
  key: string;
  activities: Activity[];
  type: 'single' | 'grouped';
  groupType?: 'search' | 'status' | 'pinned';
  groupLabel?: string;
  groupSummary?: string;
}

interface GroupedActivityItemProps {
  group: ActivityGroup;
  onArchive?: (activityId: string) => void;
  onArchiveGroup?: (activityIds: string[]) => void;
  currentUserId?: string;
}

export function GroupedActivityItem({ group, onArchive, onArchiveGroup, currentUserId }: GroupedActivityItemProps) {
  const [expanded, setExpanded] = useState(false);
  const hg = isHomegateTheme();

  // Single activity - render normally
  if (group.type === 'single') {
    return <ActivityItem activity={group.activities[0]} onArchive={onArchive} currentUserId={currentUserId} />;
  }

  // Grouped activities
  const activities = group.activities;
  const count = activities.length;
  const firstActivity = activities[0];
  const lastActivity = activities[activities.length - 1];
  const timeRange = `${formatCompactTime(new Date(firstActivity.createdAt))} - ${formatCompactTime(new Date(lastActivity.createdAt))}`;

  // Get unique senders
  const senders = [...new Set(activities.map((a) => a.senderId))];
  const senderNames = senders.map((id) => USERS[id]?.name || id).join(', ');

  const handleArchiveGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    onArchiveGroup?.(activities.map((a) => a.activityId));
  };

  // Group config based on type
  const getGroupConfig = () => {
    switch (group.groupType) {
      case 'search':
        return {
          icon: <Search className="h-3.5 w-3.5" />,
          bgClass: hg ? 'bg-violet-50' : 'bg-violet-500/10',
          iconBg: hg ? 'bg-white' : 'bg-violet-500/20',
          iconColor: 'text-violet-500',
          label: 'Searches',
        };
      case 'status':
        return {
          icon: <ArrowRightLeft className="h-3.5 w-3.5" />,
          bgClass: hg ? 'bg-amber-50' : 'bg-amber-500/10',
          iconBg: hg ? 'bg-white' : 'bg-amber-500/20',
          iconColor: 'text-amber-500',
          label: 'Status Changes',
        };
      case 'pinned':
        return {
          icon: <Heart className="h-3.5 w-3.5" />,
          bgClass: hg ? 'bg-pink-50' : 'bg-pink-500/10',
          iconBg: hg ? 'bg-white' : 'bg-pink-500/20',
          iconColor: 'text-pink-500',
          label: 'Favorites',
        };
      default:
        return {
          icon: <Search className="h-3.5 w-3.5" />,
          bgClass: hg ? 'bg-gray-50' : 'bg-slate-800/30',
          iconBg: hg ? 'bg-white' : 'bg-slate-700',
          iconColor: hg ? 'text-gray-500' : 'text-slate-400',
          label: 'Activities',
        };
    }
  };

  const config = getGroupConfig();

  return (
    <div className={`rounded-lg overflow-hidden ${config.bgClass}`}>
      {/* Group header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
          hg ? 'hover:bg-white/50' : 'hover:bg-white/5'
        }`}
      >
        <div className={`h-8 w-8 flex-shrink-0 rounded-full ${config.iconBg} flex items-center justify-center shadow-sm ${config.iconColor}`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium ${hg ? 'text-gray-800' : 'text-white'}`}>
              {count} {config.label}
            </span>
            <Badge variant="outline" className={`text-xs ${hg ? 'border-gray-300 text-gray-600' : 'border-slate-600 text-slate-400'}`}>
              {senderNames}
            </Badge>
            <span className={`text-xs ${hg ? 'text-gray-400' : 'text-slate-500'}`}>{timeRange}</span>
          </div>
          {group.groupSummary && (
            <p className={`text-sm mt-0.5 ${hg ? 'text-gray-500' : 'text-slate-400'}`}>{group.groupSummary}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Archive group button */}
          {onArchiveGroup && (
            <button
              onClick={handleArchiveGroup}
              className={`p-1.5 rounded-md transition-all ${
                hg
                  ? 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                  : 'hover:bg-slate-700 text-slate-500 hover:text-slate-300'
              }`}
              title="Archive all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
              >
                <rect width="20" height="5" x="2" y="3" rx="1" />
                <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                <path d="M10 12h4" />
              </svg>
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''} ${
              hg ? 'text-gray-400' : 'text-slate-500'
            }`}
          />
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className={`px-3 pb-3 space-y-2 border-t ${hg ? 'border-gray-200/50' : 'border-slate-700/30'}`}>
          <div className="pt-3 space-y-2">
            {activities.map((activity) => (
              <div key={activity.activityId} className="pl-11">
                <ActivityItem activity={activity} onArchive={onArchive} currentUserId={currentUserId} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Utility function to group consecutive similar activities
export function groupActivities(activities: Activity[]): ActivityGroup[] {
  if (activities.length === 0) return [];

  const groups: ActivityGroup[] = [];
  let currentGroup: Activity[] = [];
  let currentGroupType: 'search' | 'status' | 'pinned' | null = null;
  let currentGroupKey: string | null = null;

  const flushGroup = () => {
    if (currentGroup.length === 0) return;

    if (currentGroup.length === 1) {
      groups.push({
        key: currentGroup[0].activityId,
        activities: currentGroup,
        type: 'single',
      });
    } else {
      // Create summary based on group type
      let summary = '';
      if (currentGroupType === 'search') {
        const totalResults = currentGroup.reduce((sum, a) => {
          if (a.type === 'SearchExecuted') return sum + a.resultsCount;
          return sum;
        }, 0);
        summary = `Found ${totalResults} total results across ${currentGroup.length} searches`;
      } else if (currentGroupType === 'status') {
        const listing = currentGroup[0];
        if (listing.type === 'ListingStatusChanged') {
          const firstStatus = listing.fromStatus;
          const lastStatus = (currentGroup[currentGroup.length - 1] as typeof listing).toStatus;
          summary = `${listing.listingTitle}: ${firstStatus} → ${lastStatus}`;
        }
      } else if (currentGroupType === 'pinned') {
        const titles = currentGroup
          .filter((a) => a.type === 'ListingPinned')
          .map((a) => (a as Extract<Activity, { type: 'ListingPinned' }>).listingTitle)
          .slice(0, 3);
        summary = titles.join(', ') + (currentGroup.length > 3 ? '...' : '');
      }

      groups.push({
        key: `group-${currentGroup[0].activityId}`,
        activities: [...currentGroup],
        type: 'grouped',
        groupType: currentGroupType || undefined,
        groupSummary: summary,
      });
    }

    currentGroup = [];
    currentGroupType = null;
    currentGroupKey = null;
  };

  for (const activity of activities) {
    // Determine if this activity can be grouped
    let activityGroupType: 'search' | 'status' | 'pinned' | null = null;
    let activityGroupKey: string | null = null;

    if (activity.type === 'SearchExecuted') {
      activityGroupType = 'search';
      activityGroupKey = `search-${activity.senderId}`;
    } else if (activity.type === 'ListingStatusChanged') {
      activityGroupType = 'status';
      activityGroupKey = `status-${activity.listingId}`;
    } else if (activity.type === 'ListingPinned') {
      activityGroupType = 'pinned';
      activityGroupKey = `pinned-${activity.senderId}`;
    }

    // Check if we should continue the current group
    if (activityGroupType && activityGroupKey === currentGroupKey) {
      currentGroup.push(activity);
    } else {
      // Flush the current group and start a new one
      flushGroup();
      
      if (activityGroupType) {
        currentGroup = [activity];
        currentGroupType = activityGroupType;
        currentGroupKey = activityGroupKey;
      } else {
        // Non-groupable activity
        groups.push({
          key: activity.activityId,
          activities: [activity],
          type: 'single',
        });
      }
    }
  }

  // Flush any remaining group
  flushGroup();

  return groups;
}
