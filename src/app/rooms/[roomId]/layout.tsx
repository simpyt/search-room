'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ActivityFeed } from '@/components/chat/ActivityFeed';
import type { RoomWithMembers, User, Activity } from '@/lib/types';
import { USERS, AI_COPILOT } from '@/lib/types';

interface RoomContextValue {
  room: RoomWithMembers | null;
  user: User | null;
  activities: Activity[];
  refreshRoom: () => Promise<void>;
  refreshActivities: () => Promise<void>;
}

const RoomContext = createContext<RoomContextValue>({
  room: null,
  user: null,
  activities: [],
  refreshRoom: async () => {},
  refreshActivities: async () => {},
});

export const useRoom = () => useContext(RoomContext);

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<RoomWithMembers | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      if (!res.ok) {
        if (res.status === 404) {
          router.push('/rooms/new');
        }
        return;
      }
      const data = await res.json();
      setRoom(data.room);
    } catch (error) {
      console.error('Failed to fetch room:', error);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/activities`);
      if (!res.ok) return;
      const data = await res.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchRoom(), fetchUser(), fetchActivities()]);
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // Poll for activities every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchActivities, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
      </div>
    );
  }

  if (!room || !user) {
    return null;
  }

  const partner = room.members.find((m) => m.userId !== user.id);
  const partnerUser = partner ? USERS[partner.userId] : null;

  return (
    <RoomContext.Provider
      value={{
        room,
        user,
        activities,
        refreshRoom: fetchRoom,
        refreshActivities: fetchActivities,
      }}
    >
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            {/* Left: Room info */}
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-white"
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div>
                <h1 className="font-semibold text-white">{room.name}</h1>
                <p className="text-xs text-slate-400">
                  {room.searchType === 'buy' ? 'Buy' : 'Rent'} •{' '}
                  {room.members.length} member{room.members.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Center: Members */}
            <div className="hidden md:flex items-center gap-2">
              {/* Current user */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
                <Avatar className="h-6 w-6">
                  <AvatarFallback
                    style={{ backgroundColor: USERS[user.id]?.avatarColor }}
                    className="text-xs text-white"
                  >
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-white">{user.name}</span>
                <span className="text-xs text-slate-500">(you)</span>
              </div>

              {/* Partner */}
              {partnerUser && (
                <>
                  <span className="text-slate-500">&</span>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback
                        style={{ backgroundColor: partnerUser.avatarColor }}
                        className="text-xs text-white"
                      >
                        {partnerUser.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-white">{partnerUser.name}</span>
                  </div>
                </>
              )}

              {/* AI Co-pilot */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Avatar className="h-6 w-6">
                  <AvatarFallback
                    style={{ backgroundColor: AI_COPILOT.avatarColor }}
                    className="text-xs text-white"
                  >
                    AI
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-emerald-400">AI Co-pilot</span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Chat toggle (mobile) */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden border-slate-700 bg-slate-800/50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full sm:w-[400px] p-0 bg-slate-900 border-slate-800"
                >
                  <ActivityFeed roomId={roomId} activities={activities} />
                </SheetContent>
              </Sheet>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-9 w-9 rounded-full p-0"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback
                        style={{ backgroundColor: USERS[user.id]?.avatarColor }}
                        className="text-white"
                      >
                        {user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/rooms/new')}>
                    Create New Room
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content with optional sidebar */}
        <div className="flex-1 flex">
          {/* Main content */}
          <main className="flex-1 overflow-auto">{children}</main>

          {/* Sidebar (desktop) */}
          <aside className="hidden md:flex w-[400px] border-l border-slate-800 flex-col bg-slate-900/30">
            <ActivityFeed roomId={roomId} activities={activities} />
          </aside>
        </div>
      </div>
    </RoomContext.Provider>
  );
}

