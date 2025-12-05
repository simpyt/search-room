'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  SlidersHorizontal,
  Search,
  Heart,
  ArrowRightLeft,
  Sparkles,
  Users,
  Home,
  BarChart3,
  Calendar,
  Lightbulb,
  Archive,
} from 'lucide-react';
import type { Activity, ActivityType } from '@/lib/types';
import { USERS, AI_COPILOT } from '@/lib/types';
import { isHomegateTheme } from '@/lib/theme';

// Compact time formatting: "now", "5m", "2h", "3d", or "Dec 5"
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

// Activity type configuration for icons, colors, and labels (Homegate theme)
const ACTIVITY_TYPE_CONFIG: Record<
  Exclude<ActivityType, 'ChatMessage'>,
  { icon: React.ReactNode; bgClass: string; iconColor: string; label: string }
> = {
  RoomCreated: {
    icon: <Home className="h-3.5 w-3.5" />,
    bgClass: 'bg-slate-50',
    iconColor: 'text-slate-500',
    label: 'Room Created',
  },
  MemberJoined: {
    icon: <Users className="h-3.5 w-3.5" />,
    bgClass: 'bg-indigo-50',
    iconColor: 'text-indigo-500',
    label: 'Member Joined',
  },
  CriteriaUpdated: {
    icon: <SlidersHorizontal className="h-3.5 w-3.5" />,
    bgClass: 'bg-blue-50',
    iconColor: 'text-blue-500',
    label: 'Criteria Updated',
  },
  SearchExecuted: {
    icon: <Search className="h-3.5 w-3.5" />,
    bgClass: 'bg-violet-50',
    iconColor: 'text-violet-500',
    label: 'Search Executed',
  },
  CompatibilityComputed: {
    icon: <BarChart3 className="h-3.5 w-3.5" />,
    bgClass: 'bg-cyan-50',
    iconColor: 'text-cyan-500',
    label: 'Compatibility',
  },
  ListingPinned: {
    icon: <Heart className="h-3.5 w-3.5" />,
    bgClass: 'bg-pink-50',
    iconColor: 'text-pink-500',
    label: 'Listing Pinned',
  },
  ListingStatusChanged: {
    icon: <ArrowRightLeft className="h-3.5 w-3.5" />,
    bgClass: 'bg-amber-50',
    iconColor: 'text-amber-500',
    label: 'Listing Status Changed',
  },
  ListingVisitScheduled: {
    icon: <Calendar className="h-3.5 w-3.5" />,
    bgClass: 'bg-teal-50',
    iconColor: 'text-teal-500',
    label: 'Visit Scheduled',
  },
  AICriteriaProposed: {
    icon: <Sparkles className="h-3.5 w-3.5" />,
    bgClass: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    label: 'AI Criteria Proposed',
  },
  AICompromiseProposed: {
    icon: <Lightbulb className="h-3.5 w-3.5" />,
    bgClass: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    label: 'AI Compromise',
  },
};

interface ActivityItemProps {
  activity: Activity;
  onArchive?: (activityId: string) => void;
  showArchiveButton?: boolean;
  currentUserId?: string;
}

export function ActivityItem({ activity, onArchive, showArchiveButton = true, currentUserId }: ActivityItemProps) {
  const [expanded, setExpanded] = useState(false);
  const hg = isHomegateTheme();
  const isCurrentUser = activity.senderId === currentUserId && activity.senderType === 'user';

  const getSenderInfo = () => {
    if (activity.senderType === 'ai_copilot') {
      return {
        name: AI_COPILOT.name,
        color: AI_COPILOT.avatarColor,
        initial: 'AI',
      };
    }
    if (activity.senderType === 'system') {
      return {
        name: 'System',
        color: '#6B7280',
        initial: 'S',
      };
    }
    const user = USERS[activity.senderId];
    return {
      name: user?.name || activity.senderId,
      color: user?.avatarColor || '#6B7280',
      initial: user?.name?.[0] || '?',
    };
  };

  const sender = getSenderInfo();
  const timeAgo = formatCompactTime(new Date(activity.createdAt));

  const renderContent = () => {
    const textClass = hg ? 'text-gray-600' : 'text-slate-300';
    const mutedClass = hg ? 'text-gray-500' : 'text-slate-400';
    const highlightClass = hg ? 'text-gray-900' : 'text-white';

    switch (activity.type) {
      case 'ChatMessage':
        return <p className={`${textClass} whitespace-pre-wrap`}>{activity.text}</p>;

      case 'RoomCreated':
        return (
          <p className={`${mutedClass} text-sm`}>
            Created the room <span className={highlightClass}>{activity.roomName}</span>
          </p>
        );

      case 'MemberJoined':
        return (
          <p className={`${mutedClass} text-sm`}>
            <span className={highlightClass}>{activity.memberName}</span> joined the room
          </p>
        );

      case 'CriteriaUpdated':
        return (
          <p className={`${mutedClass} text-sm`}>
            Updated search criteria: {activity.summary}
          </p>
        );

      case 'SearchExecuted':
        return (
          <p className={`${mutedClass} text-sm`}>
            Searched and found <span className={highlightClass}>{activity.resultsCount}</span> results
          </p>
        );

      case 'CompatibilityComputed':
        return (
          <div className={`${mutedClass} text-sm`}>
            <p>Computed compatibility:</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className={
                  activity.level === 'HIGH'
                    ? 'border-green-500 text-green-600'
                    : activity.level === 'MEDIUM'
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-red-500 text-red-600'
                }
              >
                {activity.scorePercent}% - {activity.level}
              </Badge>
            </div>
          </div>
        );

      case 'ListingPinned':
        return (
          <p className={`${mutedClass} text-sm`}>
            Added <span className={highlightClass}>{activity.listingTitle}</span> to favorites
          </p>
        );

      case 'ListingStatusChanged':
        return (
          <p className={`${mutedClass} text-sm`}>
            Changed status of <span className={highlightClass}>{activity.listingTitle}</span> from{' '}
            <Badge variant="outline" className="text-xs">
              {activity.fromStatus}
            </Badge>{' '}
            to{' '}
            <Badge variant="outline" className="text-xs">
              {activity.toStatus}
            </Badge>
          </p>
        );

      case 'ListingVisitScheduled':
        return (
          <p className={`${mutedClass} text-sm`}>
            Planned a visit for{' '}
            <span className={highlightClass}>{activity.listingTitle}</span> on{' '}
            <span className={highlightClass}>
              {new Date(activity.visitPlannedAt).toLocaleString()}
            </span>
          </p>
        );

      case 'AICriteriaProposed':
        return (
          <div className={`${mutedClass} text-sm`}>
            <p className={hg ? 'text-emerald-600' : 'text-emerald-400'}>AI proposed new criteria:</p>
            <p className="mt-1">{activity.summary}</p>
          </div>
        );

      case 'AICompromiseProposed':
        return (
          <div className={`${mutedClass} text-sm`}>
            <p className={hg ? 'text-emerald-600' : 'text-emerald-400'}>AI suggested a compromise:</p>
            <p className="mt-1">{activity.summary}</p>
          </div>
        );
    }
  };

  const isChat = activity.type === 'ChatMessage';
  const isAI = activity.senderType === 'ai_copilot';
  const isSystem = activity.senderType === 'system';
  const isClickable = isChat && isAI;

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    onArchive?.(activity.activityId);
  };

  // System activities: same layout but more subtle, no "System" label
  if (isSystem) {
    return (
      <div className="flex gap-3 relative group opacity-60">
        {/* Small icon placeholder to align with avatars */}
        <div className={`h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full ${
          hg ? 'bg-gray-100' : 'bg-slate-800/50'
        }`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-3.5 w-3.5 ${hg ? 'text-gray-400' : 'text-slate-500'}`}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs ${hg ? 'text-gray-400' : 'text-slate-500'}`}>{timeAgo}</span>
          </div>
          <div className="text-[13px]">{renderContent()}</div>
        </div>
        {/* Archive button - shown on hover */}
        {showArchiveButton && onArchive && (
          <button
            onClick={handleArchive}
            className={`absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all opacity-0 group-hover:opacity-100 ${
              hg
                ? 'bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-600 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-700 text-slate-500 hover:text-slate-300 shadow-sm'
            }`}
            title="Archive"
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
      </div>
    );
  }

  // Non-chat activities with icons and colored backgrounds (Homegate theme only)
  if (!isChat && hg) {
    const config = ACTIVITY_TYPE_CONFIG[activity.type as Exclude<ActivityType, 'ChatMessage'>];
    return (
      <div className={`flex gap-3 p-3 rounded-lg relative group ${config.bgClass}`}>
        <div
          className={`h-8 w-8 flex-shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm ${config.iconColor}`}
        >
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <span className="font-medium text-gray-700">{config.label}</span>
            <span>·</span>
            <span>{sender.name}</span>
            <span>·</span>
            <span>{timeAgo}</span>
          </div>
          <div className="text-sm">{renderContent()}</div>
        </div>
        {/* Archive button - shown on hover */}
        {showArchiveButton && onArchive && (
          <button
            onClick={handleArchive}
            className="absolute right-2 top-2 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-600 shadow-sm"
            title="Archive"
          >
            <Archive className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        onClick={isClickable ? () => setExpanded(true) : undefined}
        className={`flex gap-3 relative group ${isCurrentUser ? 'flex-row-reverse' : ''} ${
          isChat
            ? isAI
              ? hg
                ? 'bg-emerald-50 -mx-4 px-4 py-3 border-l-2 border-emerald-500 cursor-pointer hover:bg-emerald-100 transition-colors'
                : 'bg-emerald-500/5 -mx-4 px-4 py-3 border-l-2 border-emerald-500/50 cursor-pointer hover:bg-emerald-500/10 transition-colors'
              : isCurrentUser
                ? hg
                  ? '-mx-4 px-4 py-2'
                  : '-mx-4 px-4 py-2'
                : ''
            : 'opacity-75'
        }`}
      >
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback style={{ backgroundColor: sender.color }} className="text-xs text-white">
            {sender.initial}
          </AvatarFallback>
        </Avatar>
        <div className={`flex-1 min-w-0 ${isCurrentUser ? 'text-right' : ''}`}>
          <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
            <span
              className={`text-sm font-medium ${
                isAI ? (hg ? 'text-emerald-600' : 'text-emerald-400') : hg ? 'text-gray-900' : 'text-white'
              }`}
            >
              {sender.name}
            </span>
            <span className={`text-xs ${hg ? 'text-gray-400' : 'text-slate-500'}`}>{timeAgo}</span>
            {!isChat && (
              <Badge variant="outline" className="text-xs">
                {activity.type.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
            )}
            {isClickable && (
              <span className={`text-xs ${hg ? 'text-gray-400' : 'text-slate-500'}`}>(click to expand)</span>
            )}
          </div>
          {isCurrentUser && isChat ? (
            <div className={`inline-block rounded-lg px-3 py-2 ${hg ? 'bg-blue-500 text-white' : 'bg-sky-600 text-white'}`}>
              {renderContent()}
            </div>
          ) : (
            renderContent()
          )}
        </div>

        {/* Archive button - shown on hover */}
        {showArchiveButton && onArchive && (
          <button
            onClick={handleArchive}
            className={`absolute ${isCurrentUser ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 ${
              hg
                ? 'bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-600 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-700 text-slate-500 hover:text-slate-300 shadow-sm'
            }`}
            title="Archive"
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
              <rect width="20" height="5" x="2" y="3" rx="1" />
              <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
              <path d="M10 12h4" />
            </svg>
          </button>
        )}
      </div>

      {/* Full-screen AI response dialog */}
      {isClickable && (
        <Dialog open={expanded} onOpenChange={setExpanded}>
          <DialogContent
            className={`max-w-3xl max-h-[85vh] overflow-hidden flex flex-col ${
              hg ? 'bg-white' : 'bg-slate-900 border-slate-700'
            }`}
          >
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: AI_COPILOT.avatarColor }}
                >
                  <span className="text-white font-semibold text-sm">AI</span>
                </div>
                <div>
                  <span className={hg ? 'text-emerald-600' : 'text-emerald-400'}>AI Co-pilot</span>
                  <p className={`text-xs font-normal ${hg ? 'text-gray-400' : 'text-slate-500'}`}>{timeAgo}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className={`flex-1 overflow-y-auto pr-2 ${hg ? 'text-gray-700' : 'text-slate-200'}`}>
              <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap leading-relaxed text-base">
                {activity.text}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
