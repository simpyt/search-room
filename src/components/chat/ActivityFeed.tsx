'use client';

import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActivityItem } from './ActivityItem';
import type { Activity } from '@/lib/types';
import { toast } from 'sonner';
import { isHomegateTheme } from '@/lib/theme';

interface ActivityFeedProps {
  roomId: string;
  activities: Activity[];
}

export function ActivityFeed({ roomId, activities }: ActivityFeedProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hg = isHomegateTheme();

  // Auto-scroll to bottom when new activities arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activities]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to send message');
        return;
      }

      setMessage('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Sort activities by createdAt (oldest first for display)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`px-4 py-3 border-b ${hg ? 'border-gray-200' : 'border-slate-800'}`}>
        <h2 className={`font-semibold ${hg ? 'text-gray-900' : 'text-white'}`}>Activity & Chat</h2>
        <p className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
          {activities.length} activities
        </p>
      </div>

      {/* Activity list */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="py-4 space-y-4">
          {sortedActivities.length === 0 ? (
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
          ) : (
            sortedActivities.map((activity) => (
              <ActivityItem key={activity.activityId} activity={activity} />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Message input */}
      <div className={`p-4 border-t ${hg ? 'border-gray-200' : 'border-slate-800'}`}>
        <div className="flex gap-2">
          <Input
            placeholder="Type a message or ask AI..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            className={hg
              ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
              : 'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500'
            }
          />
          <Button
            onClick={sendMessage}
            disabled={!message.trim() || sending}
            size="icon"
            className={hg
              ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white'
              : 'bg-sky-600 hover:bg-sky-700'
            }
          >
            {sending ? (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
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

