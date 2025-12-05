'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { RoomWithMembers, Activity } from '@/lib/types';
import { USERS } from '@/lib/types';

interface RoomWithActivities extends RoomWithMembers {
  recentActivities: Activity[];
}

interface RoomCardProps {
  room: RoomWithActivities;
  isHomegate: boolean;
}

export function RoomCard({ room, isHomegate: hg }: RoomCardProps) {
  const router = useRouter();
  const [editingRoom, setEditingRoom] = useState(false);
  const [editName, setEditName] = useState(room.name);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRoom(true);
    setEditName(room.name);
  };

  const handleEditCancel = () => {
    setEditingRoom(false);
    setEditName(room.name);
  };

  const handleEditSave = async () => {
    if (!editName.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/rooms/${room.roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (res.ok) {
        setEditingRoom(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update room:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/rooms/${room.roomId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDeleteDialogOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to delete room:', error);
    } finally {
      setDeleting(false);
    }
  };

  const getActivitySummary = (activity: Activity): string => {
    switch (activity.type) {
      case 'ChatMessage':
        return `"${(activity as Activity & { text: string }).text?.slice(0, 50)}${((activity as Activity & { text: string }).text?.length || 0) > 50 ? '...' : ''}"`;
      case 'CriteriaUpdated':
        return 'Updated search criteria';
      case 'SearchExecuted':
        return `Found ${(activity as Activity & { resultsCount: number }).resultsCount} properties`;
      case 'ListingPinned':
        return 'Pinned a property';
      case 'ListingStatusChanged':
        return `Changed status to ${(activity as Activity & { toStatus: string }).toStatus}`;
      case 'MemberJoined':
        return `${(activity as Activity & { memberName: string }).memberName} joined`;
      case 'RoomCreated':
        return 'Room created';
      case 'CompatibilityComputed':
        return `Compatibility: ${(activity as Activity & { scorePercent: number }).scorePercent}%`;
      default:
        return activity.type.replace(/([A-Z])/g, ' $1').trim();
    }
  };

  return (
    <>
      <Card
        className={`group cursor-pointer transition-all hover:shadow-lg ${
          hg
            ? 'border-gray-200 bg-white hover:border-[#e5007d]/30'
            : 'border-slate-700/50 bg-slate-900/50 hover:border-sky-500/30 hover:bg-slate-900/80'
        }`}
        onClick={() => router.push(`/rooms/${room.roomId}`)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            {editingRoom ? (
              <div
                className="flex-1 flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSave();
                    if (e.key === 'Escape') handleEditCancel();
                  }}
                  className={
                    hg
                      ? 'bg-white border-gray-300 text-gray-900'
                      : 'bg-slate-800 border-slate-700 text-white'
                  }
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleEditSave}
                  disabled={saving}
                  className={
                    hg
                      ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white'
                      : 'bg-sky-600 hover:bg-sky-700'
                  }
                >
                  {saving ? '...' : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEditCancel}
                  className={hg ? 'text-gray-500' : 'text-slate-400'}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <CardTitle
                    className={`truncate ${hg ? 'text-gray-900' : 'text-white'}`}
                  >
                    {room.name}
                  </CardTitle>
                  <CardDescription className={hg ? 'text-gray-500' : 'text-slate-400'}>
                    {room.searchType === 'buy' ? 'Buy' : 'Rent'} •
                    Created{' '}
                    {formatDistanceToNow(new Date(room.createdAt), {
                      addSuffix: true,
                    })}
                  </CardDescription>
                </div>
                <div
                  className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleEditStart}
                    className={`h-8 w-8 ${
                      hg
                        ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
                      className="h-4 w-4"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteDialogOpen(true);
                    }}
                    className={`h-8 w-8 ${
                      hg
                        ? 'text-red-500 hover:text-red-700 hover:bg-red-50'
                        : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
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
                      className="h-4 w-4"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" x2="10" y1="11" y2="17" />
                      <line x1="14" x2="14" y1="11" y2="17" />
                    </svg>
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Members */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {(room.members || []).slice(0, 4).map((member) => {
                const user = USERS[member.userId];
                return (
                  <Avatar
                    key={member.userId}
                    className={`h-8 w-8 border-2 ${hg ? 'border-white' : 'border-slate-900'}`}
                  >
                    <AvatarFallback
                      style={{ backgroundColor: user?.avatarColor }}
                      className="text-xs text-white"
                    >
                      {user?.name?.[0] || member.userId[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                );
              })}
              {(room.members?.length || 0) > 4 && (
                <Avatar
                  className={`h-8 w-8 border-2 ${hg ? 'border-white' : 'border-slate-900'}`}
                >
                  <AvatarFallback
                    className={
                      hg
                        ? 'bg-gray-200 text-gray-600 text-xs'
                        : 'bg-slate-700 text-slate-300 text-xs'
                    }
                  >
                    +{(room.members?.length || 0) - 4}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <span className={`text-sm ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
              {room.members?.length || 0}{' '}
              {(room.members?.length || 0) === 1 ? 'member' : 'members'}
            </span>
          </div>

          {/* Recent activity */}
          {room.recentActivities.length > 0 && (
            <div
              className={`pt-3 border-t ${hg ? 'border-gray-100' : 'border-slate-800'}`}
            >
              <p
                className={`text-xs font-medium mb-2 ${hg ? 'text-gray-400' : 'text-slate-500'}`}
              >
                Recent activity
              </p>
              <div className="space-y-1.5">
                {room.recentActivities.slice(0, 2).map((activity) => {
                  const user =
                    activity.senderType === 'user'
                      ? USERS[activity.senderId]
                      : null;
                  return (
                    <div
                      key={activity.activityId}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarFallback
                          style={{
                            backgroundColor:
                              activity.senderType === 'ai_copilot'
                                ? '#10B981'
                                : activity.senderType === 'system'
                                ? '#6B7280'
                                : user?.avatarColor,
                          }}
                          className="text-[10px] text-white"
                        >
                          {activity.senderType === 'ai_copilot'
                            ? 'AI'
                            : activity.senderType === 'system'
                            ? 'S'
                            : user?.name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`truncate ${hg ? 'text-gray-600' : 'text-slate-300'}`}
                      >
                        {getActivitySummary(activity)}
                      </span>
                      <span
                        className={`flex-shrink-0 text-xs ${hg ? 'text-gray-400' : 'text-slate-500'}`}
                      >
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent
          className={hg ? 'bg-white border-gray-200' : 'bg-slate-900 border-slate-700'}
        >
          <DialogHeader>
            <DialogTitle className={hg ? 'text-gray-900' : 'text-white'}>
              Delete room?
            </DialogTitle>
            <DialogDescription className={hg ? 'text-gray-500' : 'text-slate-400'}>
              Are you sure you want to delete &ldquo;{room.name}&rdquo;?
              This will permanently remove all search criteria, favorites, and
              chat history. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className={
                hg
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete room'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
