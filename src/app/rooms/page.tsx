'use client';

import { useCallback, useEffect, useState } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { isHomegateTheme } from '@/lib/theme';
import type { RoomWithMembers, Activity, User } from '@/lib/types';
import { USERS } from '@/lib/types';

interface RoomWithActivities extends RoomWithMembers {
  recentActivities: Activity[];
}

export default function RoomsPage() {
  const router = useRouter();
  const hg = isHomegateTheme();

  const [rooms, setRooms] = useState<RoomWithActivities[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteRoom, setDeleteRoom] = useState<RoomWithActivities | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms');
      if (res.status === 401) {
        router.push('/login?redirect=/rooms');
        return;
      }
      const data = await res.json();

      // Fetch full room details and activities for each room
      const roomsWithActivities = await Promise.all(
        (data.rooms || []).map(async (room: RoomWithMembers) => {
          try {
            // Fetch full room details to get members
            const [roomRes, actRes] = await Promise.all([
              fetch(`/api/rooms/${room.roomId}`),
              fetch(`/api/rooms/${room.roomId}/activities?limit=3`),
            ]);
            const roomData = await roomRes.json();
            const actData = await actRes.json();
            return {
              ...room,
              ...roomData.room,
              members: roomData.room?.members || [],
              recentActivities: actData.activities || [],
            };
          } catch {
            return { ...room, members: [], recentActivities: [] };
          }
        })
      );

      // Sort by most recent activity or creation date
      roomsWithActivities.sort((a, b) => {
        const aDate = a.recentActivities[0]?.createdAt || a.createdAt;
        const bDate = b.recentActivities[0]?.createdAt || b.createdAt;
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });

      setRooms(roomsWithActivities);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Fetch current user
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          const userData = USERS[data.user.id];
          setCurrentUser(userData || data.user);
        }
      })
      .catch(() => {});

    fetchRooms();
  }, [fetchRooms]);

  const handleEditStart = (room: RoomWithActivities) => {
    setEditingRoom(room.roomId);
    setEditName(room.name);
  };

  const handleEditCancel = () => {
    setEditingRoom(null);
    setEditName('');
  };

  const handleEditSave = async (roomId: string) => {
    if (!editName.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (res.ok) {
        setRooms((prev) =>
          prev.map((r) =>
            r.roomId === roomId ? { ...r, name: editName.trim() } : r
          )
        );
        setEditingRoom(null);
        setEditName('');
      }
    } catch (error) {
      console.error('Failed to update room:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRoom) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/rooms/${deleteRoom.roomId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setRooms((prev) => prev.filter((r) => r.roomId !== deleteRoom.roomId));
        setDeleteRoom(null);
      }
    } catch (error) {
      console.error('Failed to delete room:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
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

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          hg
            ? 'bg-gradient-to-br from-[#ffe6f4] via-white to-[#ffe6f4]'
            : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        }`}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-48 rounded-lg animate-pulse ${
                  hg ? 'bg-gray-200' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        hg
          ? 'bg-gradient-to-br from-[#ffe6f4] via-white to-[#ffe6f4]'
          : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
      }`}
    >
      {!hg && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent" />
      )}

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-lg ${
                hg
                  ? 'bg-[#e5007d] shadow-[#e5007d]/25'
                  : 'bg-gradient-to-br from-sky-500 to-indigo-600 shadow-sky-500/25'
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
                className="h-6 w-6 text-white"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h1
                className={`text-2xl font-bold ${
                  hg ? 'text-gray-900' : 'text-white'
                }`}
              >
                My Rooms
              </h1>
              <p className={hg ? 'text-gray-500' : 'text-slate-400'}>
                {rooms.length} search {rooms.length === 1 ? 'room' : 'rooms'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push('/rooms/new')}
              className={
                hg
                  ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white'
                  : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white'
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 mr-2"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              New Room
            </Button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-2 px-2 ${
                    hg
                      ? 'hover:bg-gray-100'
                      : 'hover:bg-slate-800'
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      style={{ backgroundColor: currentUser?.avatarColor }}
                      className="text-white text-sm"
                    >
                      {currentUser?.name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className={`hidden sm:inline ${hg ? 'text-gray-700' : 'text-slate-200'}`}>
                    {currentUser?.name || 'User'}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-4 w-4 ${hg ? 'text-gray-400' : 'text-slate-400'}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={
                  hg
                    ? 'bg-white border-gray-200'
                    : 'bg-slate-900 border-slate-700'
                }
              >
                <DropdownMenuLabel className={hg ? 'text-gray-900' : 'text-white'}>
                  <div className="flex flex-col">
                    <span>{currentUser?.name}</span>
                    <span className={`text-xs font-normal ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                      {currentUser?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className={hg ? 'bg-gray-200' : 'bg-slate-700'} />
                <DropdownMenuItem
                  onClick={() => router.push('/profile')}
                  className={`cursor-pointer ${
                    hg
                      ? 'text-gray-700 focus:bg-gray-100 focus:text-gray-900'
                      : 'text-slate-300 focus:bg-slate-800 focus:text-white'
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
                    className="h-4 w-4 mr-2"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className={hg ? 'bg-gray-200' : 'bg-slate-700'} />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className={`cursor-pointer ${
                    hg
                      ? 'text-red-600 focus:bg-red-50 focus:text-red-700'
                      : 'text-red-400 focus:bg-red-500/10 focus:text-red-300'
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
                    className="h-4 w-4 mr-2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" x2="9" y1="12" y2="12" />
                  </svg>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Room cards */}
        {rooms.length === 0 ? (
          <Card
            className={`text-center py-12 ${
              hg
                ? 'border-gray-200 bg-white'
                : 'border-slate-700/50 bg-slate-900/50'
            }`}
          >
            <CardContent>
              <div
                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                  hg ? 'bg-gray-100' : 'bg-slate-800'
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
                  className={`h-8 w-8 ${hg ? 'text-gray-400' : 'text-slate-500'}`}
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h3
                className={`text-lg font-medium mb-2 ${
                  hg ? 'text-gray-900' : 'text-white'
                }`}
              >
                No rooms yet
              </h3>
              <p className={`mb-4 ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                Create your first search room to start collaborating
              </p>
              <Button
                onClick={() => router.push('/rooms/new')}
                className={
                  hg
                    ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white'
                    : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white'
                }
              >
                Create Room
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card
                key={room.roomId}
                className={`group cursor-pointer transition-all hover:shadow-lg ${
                  hg
                    ? 'border-gray-200 bg-white hover:border-[#e5007d]/30'
                    : 'border-slate-700/50 bg-slate-900/50 hover:border-sky-500/30 hover:bg-slate-900/80'
                }`}
                onClick={() => router.push(`/rooms/${room.roomId}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    {editingRoom === room.roomId ? (
                      <div
                        className="flex-1 flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSave(room.roomId);
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
                          onClick={() => handleEditSave(room.roomId)}
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
                            className={`truncate ${
                              hg ? 'text-gray-900' : 'text-white'
                            }`}
                          >
                            {room.name}
                          </CardTitle>
                          <CardDescription
                            className={hg ? 'text-gray-500' : 'text-slate-400'}
                          >
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
                            onClick={() => handleEditStart(room)}
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
                            onClick={() => setDeleteRoom(room)}
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
                            className={`h-8 w-8 border-2 ${
                              hg ? 'border-white' : 'border-slate-900'
                            }`}
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
                          className={`h-8 w-8 border-2 ${
                            hg ? 'border-white' : 'border-slate-900'
                          }`}
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
                    <span
                      className={`text-sm ${
                        hg ? 'text-gray-500' : 'text-slate-400'
                      }`}
                    >
                      {room.members?.length || 0}{' '}
                      {(room.members?.length || 0) === 1 ? 'member' : 'members'}
                    </span>
                  </div>

                  {/* Recent activity */}
                  {room.recentActivities.length > 0 && (
                    <div
                      className={`pt-3 border-t ${
                        hg ? 'border-gray-100' : 'border-slate-800'
                      }`}
                    >
                      <p
                        className={`text-xs font-medium mb-2 ${
                          hg ? 'text-gray-400' : 'text-slate-500'
                        }`}
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
                                className={`truncate ${
                                  hg ? 'text-gray-600' : 'text-slate-300'
                                }`}
                              >
                                {getActivitySummary(activity)}
                              </span>
                              <span
                                className={`flex-shrink-0 text-xs ${
                                  hg ? 'text-gray-400' : 'text-slate-500'
                                }`}
                              >
                                {formatDistanceToNow(
                                  new Date(activity.createdAt),
                                  { addSuffix: true }
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteRoom} onOpenChange={() => setDeleteRoom(null)}>
        <DialogContent
          className={
            hg
              ? 'bg-white border-gray-200'
              : 'bg-slate-900 border-slate-700'
          }
        >
          <DialogHeader>
            <DialogTitle className={hg ? 'text-gray-900' : 'text-white'}>
              Delete room?
            </DialogTitle>
            <DialogDescription className={hg ? 'text-gray-500' : 'text-slate-400'}>
              Are you sure you want to delete &ldquo;{deleteRoom?.name}&rdquo;?
              This will permanently remove all search criteria, favorites, and
              chat history. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteRoom(null)}
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
    </div>
  );
}

