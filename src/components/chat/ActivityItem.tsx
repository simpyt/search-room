'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import type { Activity } from '@/lib/types';
import { USERS, AI_COPILOT } from '@/lib/types';
import { isHomegateTheme } from '@/lib/theme';

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const hg = isHomegateTheme();

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
  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
  });

  const renderContent = () => {
    const textClass = hg ? 'text-gray-600' : 'text-slate-300';
    const mutedClass = hg ? 'text-gray-500' : 'text-slate-400';
    const highlightClass = hg ? 'text-gray-900' : 'text-white';

    switch (activity.type) {
      case 'ChatMessage':
        return (
          <p className={`${textClass} whitespace-pre-wrap`}>
            {activity.text}
          </p>
        );

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
            Searched and found{' '}
            <span className={highlightClass}>{activity.resultsCount}</span> results
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
            Added <span className={highlightClass}>{activity.listingTitle}</span> to
            favorites
          </p>
        );

      case 'ListingStatusChanged':
        return (
          <p className={`${mutedClass} text-sm`}>
            Changed status of{' '}
            <span className={highlightClass}>{activity.listingTitle}</span> from{' '}
            <Badge variant="outline" className="text-xs">
              {activity.fromStatus}
            </Badge>{' '}
            to{' '}
            <Badge variant="outline" className="text-xs">
              {activity.toStatus}
            </Badge>
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

  return (
    <div
      className={`flex gap-3 ${
        isChat
          ? isAI
            ? hg
              ? 'bg-emerald-50 -mx-4 px-4 py-3 border-l-2 border-emerald-500'
              : 'bg-emerald-500/5 -mx-4 px-4 py-3 border-l-2 border-emerald-500/50'
            : ''
          : 'opacity-75'
      }`}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback
          style={{ backgroundColor: sender.color }}
          className="text-xs text-white"
        >
          {sender.initial}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-medium ${
            isAI
              ? hg ? 'text-emerald-600' : 'text-emerald-400'
              : hg ? 'text-gray-900' : 'text-white'
          }`}>
            {sender.name}
          </span>
          <span className={`text-xs ${hg ? 'text-gray-400' : 'text-slate-500'}`}>{timeAgo}</span>
          {!isChat && (
            <Badge variant="outline" className="text-xs">
              {activity.type.replace(/([A-Z])/g, ' $1').trim()}
            </Badge>
          )}
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

