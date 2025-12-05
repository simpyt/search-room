'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActivityItem } from './ActivityItem';
import type { Activity } from '@/lib/types';
import { toast } from 'sonner';
import { isHomegateTheme } from '@/lib/theme';

const AI_COPILOT = {
  avatarColor: '#22c55e',
};

const AI_SUGGESTIONS = [
  { label: 'Advice', prompt: 'AI, give us advice on our search' },
  { label: 'Analyze', prompt: 'AI, analyze our criteria' },
  { label: 'Compromises', prompt: 'AI, suggest compromises' },
];

interface ActivityFeedProps {
  roomId: string;
  activities: Activity[];
  onAIClick?: () => void;
  initialMessage?: string;
  inSheet?: boolean;
  currentUserId?: string;
}

type ActivityFilter = 'all' | 'chat' | 'status' | 'system';

export function ActivityFeed({ roomId, activities, onAIClick, initialMessage, inSheet, currentUserId }: ActivityFeedProps) {
  const [message, setMessage] = useState(initialMessage || '');
  const [sending, setSending] = useState(false);
  const [waitingForAI, setWaitingForAI] = useState(false);
  const [archiveExpanded, setArchiveExpanded] = useState(false);
  const [suggestionsExpanded, setSuggestionsExpanded] = useState(true);
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>('all');
  const [aiMode, setAiMode] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hg = isHomegateTheme();

  const scrollToBottom = useCallback(() => {
    const viewport = scrollAreaRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, []);

  // Separate archived vs active activities
  const { archivedActivities, activeActivities } = useMemo(() => {
    const sorted = [...activities].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const archived: Activity[] = [];
    const active: Activity[] = [];

    for (const activity of sorted) {
      if (archivedIds.has(activity.activityId)) {
        archived.push(activity);
      } else {
        active.push(activity);
      }
    }

    return { archivedActivities: archived, activeActivities: active };
  }, [activities, archivedIds]);

  // Filter active activities based on selected filter
  const filteredActivities = useMemo(() => {
    return activeActivities.filter((a) => {
      if (activeFilter === 'chat') return a.type === 'ChatMessage';
      if (activeFilter === 'status') return a.type === 'ListingStatusChanged';
      if (activeFilter === 'system') return a.senderType === 'system';
      return true;
    });
  }, [activeActivities, activeFilter]);

  // Update message when initialMessage prop changes
  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
    }
  }, [initialMessage]);

  const handleArchive = (activityId: string) => {
    setArchivedIds((prev) => new Set([...prev, activityId]));
  };

  const handleArchiveAll = () => {
    const idsToArchive = filteredActivities.map((a) => a.activityId);
    setArchivedIds((prev) => new Set([...prev, ...idsToArchive]));
  };

  const sendMessage = async (msg?: string) => {
    const rawMessage = msg || message;
    if (!rawMessage.trim()) return;

    // If AI mode is on, prepend "AI, " to the message
    const messageToSend = aiMode ? `AI, ${rawMessage.trim()}` : rawMessage.trim();
    const isAIMessage = aiMode || messageToSend.toLowerCase().startsWith('ai');
    
    setSending(true);
    if (isAIMessage) setWaitingForAI(true);

    try {
      const res = await fetch(`/api/rooms/${roomId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to send message');
        return;
      }

      setMessage('');
      setAiMode(false);
      // Scroll to bottom after sending
      setTimeout(scrollToBottom, 100);
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
      setWaitingForAI(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    setAiMode(true);
    // Strip "AI, " prefix from the prompt since AI mode will add it
    setMessage(prompt.replace(/^AI,?\s*/i, ''));
    inputRef.current?.focus();
  };

  const handleAIButtonClick = () => {
    setAiMode(true);
    inputRef.current?.focus();
    scrollToBottom();
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header - extra right padding when in Sheet for close button */}
      <div className={`px-4 ${inSheet ? 'pr-12' : ''} py-3 border-b flex-shrink-0 ${hg ? 'border-gray-200' : 'border-slate-800'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`font-semibold ${hg ? 'text-gray-900' : 'text-white'}`}>Activity & Chat</h2>
            <p className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-400'}`}>{activities.length} activities</p>
          </div>
          {/* AI Co-pilot button */}
          <button
            onClick={onAIClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all hover:scale-105 cursor-pointer ${
              hg
                ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                : 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'
            }`}
          >
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full"
              style={{ backgroundColor: AI_COPILOT.avatarColor }}
            >
              <span className="text-white font-semibold text-[10px]">AI</span>
            </div>
            <span className={`text-sm ${hg ? 'text-emerald-700' : 'text-emerald-400'}`}>AI Co-pilot</span>
          </button>
        </div>

        {/* Filter chips and Archive All */}
        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="flex gap-1.5 flex-wrap">
            {(['all', 'chat', 'status', 'system'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  activeFilter === filter
                    ? hg
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-slate-900 border-white'
                    : hg
                      ? 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                {filter === 'all' && 'All'}
                {filter === 'chat' && 'Chat'}
                {filter === 'status' && 'Status'}
                {filter === 'system' && 'System'}
              </button>
            ))}
          </div>
          {filteredActivities.length > 0 && (
            <button
              onClick={handleArchiveAll}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                hg
                  ? 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-800'
              }`}
            >
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
                <rect width="20" height="5" x="2" y="3" rx="1" />
                <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                <path d="M10 12h4" />
              </svg>
              Archive All
            </button>
          )}
        </div>
      </div>

      {/* Activity list */}
      <ScrollArea className="flex-1 min-h-0 px-4" ref={scrollAreaRef}>
        <div className="py-4 space-y-4">
          {/* Archived activities section */}
          {archivedActivities.length > 0 && (
            <div
              className={`rounded-lg overflow-hidden ${hg ? 'bg-gray-50 border border-gray-200' : 'bg-slate-800/30 border border-slate-700/50'}`}
            >
              <button
                onClick={() => setArchiveExpanded(!archiveExpanded)}
                className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors ${
                  hg ? 'hover:bg-gray-100' : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-4 w-4 ${hg ? 'text-gray-400' : 'text-slate-500'}`}
                  >
                    <rect width="20" height="5" x="2" y="3" rx="1" />
                    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                    <path d="M10 12h4" />
                  </svg>
                  <span className={`text-sm font-medium ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                    Archived ({archivedActivities.length})
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-4 w-4 transition-transform ${archiveExpanded ? 'rotate-180' : ''} ${hg ? 'text-gray-400' : 'text-slate-500'}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {archiveExpanded && (
                <div className={`px-3 pb-3 space-y-3 border-t ${hg ? 'border-gray-200' : 'border-slate-700/50'}`}>
                  <div className="pt-3 space-y-2">
                    {archivedActivities.map((activity) => (
                      <div key={activity.activityId} className="opacity-60">
                        <ActivityItem activity={activity} showArchiveButton={false} currentUserId={currentUserId} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active activities */}
          {filteredActivities.length === 0 && archivedActivities.length === 0 ? (
            <div className={`text-center py-8 ${hg ? 'text-gray-400' : 'text-slate-500'}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 mx-auto mb-3 opacity-50"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p>No activity yet</p>
              <p className="text-xs mt-1">Start a conversation or make changes</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className={`text-center py-8 ${hg ? 'text-gray-400' : 'text-slate-500'}`}>
              <p className="text-sm">No activities match this filter</p>
            </div>
          ) : (
            <>
              {filteredActivities.map((activity) => (
                <ActivityItem key={activity.activityId} activity={activity} onArchive={handleArchive} currentUserId={currentUserId} />
              ))}
              {waitingForAI && (
                <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: AI_COPILOT.avatarColor }}
                  >
                    <span className="text-white font-semibold text-xs">AI</span>
                  </div>
                  <div className={`flex-1 rounded-lg px-3 py-2 ${hg ? 'bg-gray-100' : 'bg-slate-800/50'}`}>
                    <div className={`text-xs font-medium mb-1 ${hg ? 'text-green-600' : 'text-green-400'}`}>
                      AI Co-pilot
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`inline-block w-2 h-2 rounded-full animate-bounce ${hg ? 'bg-gray-400' : 'bg-slate-400'}`}
                        style={{ animationDelay: '0ms' }}
                      />
                      <span
                        className={`inline-block w-2 h-2 rounded-full animate-bounce ${hg ? 'bg-gray-400' : 'bg-slate-400'}`}
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className={`inline-block w-2 h-2 rounded-full animate-bounce ${hg ? 'bg-gray-400' : 'bg-slate-400'}`}
                        style={{ animationDelay: '300ms' }}
                      />
                      <span className={`ml-2 text-sm ${hg ? 'text-gray-500' : 'text-slate-400'}`}>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Message input */}
      <div className={`p-4 border-t flex-shrink-0 ${hg ? 'border-gray-200' : 'border-slate-800'}`}>
        {/* AI Suggestion chips - collapsible */}
        <div className="mb-3">
          <button
            onClick={() => setSuggestionsExpanded(!suggestionsExpanded)}
            className={`flex items-center gap-1.5 text-xs mb-2 transition-colors ${
              hg ? 'text-gray-500 hover:text-gray-700' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-3 w-3 transition-transform ${suggestionsExpanded ? 'rotate-180' : ''}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
            <span>AI suggestions</span>
          </button>

          {suggestionsExpanded && (
            <div className="flex gap-1.5 flex-nowrap overflow-x-auto">
              {AI_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.label}
                  onClick={() => handleSuggestionClick(suggestion.prompt)}
                  disabled={sending}
                  className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    hg
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  AI, {suggestion.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Type a message or ask AI..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={scrollToBottom}
            disabled={sending}
            className={
              hg
                ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                : 'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500'
            }
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!message.trim() || sending}
            size="icon"
            className={hg ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white' : 'bg-sky-600 hover:bg-sky-700'}
          >
            {sending ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            )}
          </Button>
        </div>
        <p className={`text-xs mt-2 ${hg ? 'text-gray-500' : 'text-slate-500'}`}>
          Tip: Start with &quot;AI,&quot; to ask the AI Co-pilot for help
        </p>
      </div>
    </div>
  );
}
