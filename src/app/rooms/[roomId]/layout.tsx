'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ActivityFeed } from '@/components/chat/ActivityFeed';
import type { RoomWithMembers, User, Activity, RoomContext } from '@/lib/types';
import { USERS, AI_COPILOT } from '@/lib/types';
import { isHomegateTheme } from '@/lib/theme';

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
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [contextDialogOpen, setContextDialogOpen] = useState(false);
  const [contextDescription, setContextDescription] = useState('');
  const [contextSaving, setContextSaving] = useState(false);

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

  const openContextDialog = () => {
    setContextDescription(room?.context?.description || '');
    setContextDialogOpen(true);
  };

  const handleSaveContext = async () => {
    if (!contextDescription.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setContextSaving(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/context`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: contextDescription, useAI: true }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to update context');
        return;
      }

      await fetchRoom();
      toast.success('Search context updated!');
      setContextDialogOpen(false);
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setContextSaving(false);
    }
  };

  const hg = isHomegateTheme();

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${hg ? 'bg-white' : 'bg-slate-950'}`}>
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${hg ? 'border-[#e5007d]' : 'border-sky-500'}`} />
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
      <div className={`min-h-screen flex flex-col ${hg ? 'bg-gray-50' : 'bg-slate-950'}`}>
        {/* Header */}
        <header className={`border-b sticky top-0 z-40 ${
          hg
            ? 'border-gray-200 bg-white/95 backdrop-blur-sm'
            : 'border-slate-800 bg-slate-900/50 backdrop-blur-xl'
        }`}>
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            {/* Left: Back + Room info */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/rooms')}
                className={`h-9 w-9 ${
                  hg
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
                  className="h-5 w-5"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Button>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                hg
                  ? 'bg-[#e5007d]'
                  : 'bg-gradient-to-br from-sky-500 to-indigo-600'
              }`}>
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
                <h1 className={`font-semibold ${hg ? 'text-gray-900' : 'text-white'}`}>{room.name}</h1>
                <p className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                  {room.searchType === 'buy' ? 'Buy' : 'Rent'} •{' '}
                  {room.members.length} member{room.members.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Center: Members */}
            <div className="hidden md:flex items-center gap-2">
              {/* Partner (shown first) */}
              {partnerUser && (
                <>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                    hg
                      ? 'bg-gray-100 border-gray-200'
                      : 'bg-slate-800/50 border-slate-700/50'
                  }`}>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback
                        style={{ backgroundColor: partnerUser.avatarColor }}
                        className="text-xs text-white"
                      >
                        {partnerUser.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`text-sm ${hg ? 'text-gray-900' : 'text-white'}`}>{partnerUser.name}</span>
                  </div>
                  <span className={hg ? 'text-gray-400' : 'text-slate-500'}>&</span>
                </>
              )}

              {/* Current user with dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                    hg
                      ? 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                      : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'
                  }`}>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback
                        style={{ backgroundColor: USERS[user.id]?.avatarColor }}
                        className="text-xs text-white"
                      >
                        {user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`text-sm ${hg ? 'text-gray-900' : 'text-white'}`}>{user.name}</span>
                    <span className={`text-xs ${hg ? 'text-gray-400' : 'text-slate-500'}`}>(you)</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-500'}`}>{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
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
                  <DropdownMenuItem onClick={() => router.push('/rooms/new')}>
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
                    Create New Room
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={openContextDialog}>
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
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                    Edit Search Context
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
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

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Copy invite link - only show if less than 2 members */}
              {room.members.length < 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  className={
                    hg
                      ? 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                      : 'border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-700/50'
                  }
                  onClick={() => {
                    const inviteLink = `${window.location.origin}/rooms/${roomId}`;
                    navigator.clipboard.writeText(inviteLink);
                    toast.success('Invite link copied to clipboard');
                  }}
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
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <span className="hidden sm:inline">Invite</span>
                </Button>
              )}

              {/* Chat toggle (mobile) */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`md:hidden ${
                      hg
                        ? 'border-gray-200 bg-white hover:bg-gray-50'
                        : 'border-slate-700 bg-slate-800/50'
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
                      className="h-5 w-5"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className={`w-full sm:w-[400px] p-0 ${
                    hg
                      ? 'bg-white border-gray-200'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <ActivityFeed roomId={roomId} activities={activities} onAIClick={() => setAiDialogOpen(true)} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Main content with optional sidebar */}
        <div className="flex-1 flex">
          {/* Main content */}
          <main className="flex-1 overflow-auto">{children}</main>

          {/* Sidebar (desktop) */}
          <aside className={`hidden md:flex w-[400px] border-l flex-col h-[calc(100vh-4rem)] sticky top-16 ${
            hg
              ? 'border-gray-200 bg-white'
              : 'border-slate-800 bg-slate-900/30'
          }`}>
            <ActivityFeed roomId={roomId} activities={activities} onAIClick={() => setAiDialogOpen(true)} />
          </aside>
        </div>

        {/* AI Co-pilot Dialog */}
        <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
          <DialogContent className={`max-w-2xl ${
            hg
              ? 'bg-white border-gray-200'
              : 'bg-slate-900 border-slate-700'
          }`}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: AI_COPILOT.avatarColor }}
                >
                  <span className="text-white font-semibold text-sm">AI</span>
                </div>
                <span className={hg ? 'text-gray-900' : 'text-white'}>
                  AI Co-pilot
                </span>
              </DialogTitle>
              <DialogDescription className={hg ? 'text-gray-500' : 'text-slate-400'}>
                Your intelligent assistant for finding the perfect home together
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* What is AI Co-pilot */}
              <div className={`rounded-lg p-4 ${
                hg ? 'bg-emerald-50' : 'bg-emerald-500/10'
              }`}>
                <h3 className={`font-semibold mb-2 flex items-center gap-2 ${
                  hg ? 'text-emerald-800' : 'text-emerald-400'
                }`}>
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
                    <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                    <path d="M12 12l8-4" />
                  </svg>
                  What is the AI Co-pilot?
                </h3>
                <p className={hg ? 'text-emerald-700' : 'text-emerald-300'}>
                  The AI Co-pilot is your smart assistant that helps you and your partner find the perfect property. 
                  It understands natural language, so you can simply describe what you&apos;re looking for instead of filling complex forms.
                </p>
              </div>

              {/* How to use it */}
              <div className={`rounded-lg p-4 ${
                hg ? 'bg-blue-50' : 'bg-blue-500/10'
              }`}>
                <h3 className={`font-semibold mb-3 flex items-center gap-2 ${
                  hg ? 'text-blue-800' : 'text-blue-400'
                }`}>
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
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                  </svg>
                  How to use it
                </h3>
                <ul className={`space-y-2 ${hg ? 'text-blue-700' : 'text-blue-300'}`}>
                  <li className="flex items-start gap-2">
                    <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                      hg ? 'bg-blue-100' : 'bg-blue-500/20'
                    }`}>1</span>
                    <span>Type <strong>&quot;AI,&quot;</strong> in the chat to ask questions or get advice</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                      hg ? 'bg-blue-100' : 'bg-blue-500/20'
                    }`}>2</span>
                    <span>Use <strong>&quot;Ask AI to Build Criteria&quot;</strong> to describe your dream home in plain language</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                      hg ? 'bg-blue-100' : 'bg-blue-500/20'
                    }`}>3</span>
                    <span>The AI will analyze both partners&apos; preferences and suggest compromises</span>
                  </li>
                </ul>
              </div>

              {/* Room Insights */}
              <div className={`rounded-lg p-4 ${
                hg ? 'bg-purple-50' : 'bg-purple-500/10'
              }`}>
                <h3 className={`font-semibold mb-3 flex items-center gap-2 ${
                  hg ? 'text-purple-800' : 'text-purple-400'
                }`}>
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
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                  Room Insights
                </h3>
                <div className={`space-y-2 ${hg ? 'text-purple-700' : 'text-purple-300'}`}>
                  <div className="flex justify-between items-center">
                    <span>Members</span>
                    <span className="font-semibold">{room.members.length} / 2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Activities</span>
                    <span className="font-semibold">{activities.length} actions</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Chat messages</span>
                    <span className="font-semibold">
                      {activities.filter(a => a.type === 'ChatMessage').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Searches performed</span>
                    <span className="font-semibold">
                      {activities.filter(a => a.type === 'SearchExecuted').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>AI interactions</span>
                    <span className="font-semibold">
                      {activities.filter(a => a.senderType === 'ai_copilot').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className={`text-sm ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                <p className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-amber-500"
                  >
                    <path d="M12 2v8" />
                    <path d="m4.93 10.93 1.41 1.41" />
                    <path d="M2 18h2" />
                    <path d="M20 18h2" />
                    <path d="m19.07 10.93-1.41 1.41" />
                    <path d="M22 22H2" />
                    <path d="m8 22 4-10 4 10" />
                  </svg>
                  <span><strong>Pro tip:</strong> The more details you share with the AI, the better it can help match your preferences!</span>
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Search Context Dialog */}
        <Dialog open={contextDialogOpen} onOpenChange={setContextDialogOpen}>
          <DialogContent className={`max-w-2xl ${
            hg
              ? 'bg-white border-gray-200'
              : 'bg-slate-900 border-slate-700'
          }`}>
            <DialogHeader>
              <DialogTitle className={hg ? 'text-gray-900' : 'text-white'}>
                Edit Search Context
              </DialogTitle>
              <DialogDescription className={hg ? 'text-gray-500' : 'text-slate-400'}>
                Describe your situation to help the AI better understand your needs and provide personalized suggestions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Current context info if exists */}
              {room?.context && (
                <div className={`rounded-lg p-4 ${
                  hg ? 'bg-blue-50' : 'bg-blue-500/10'
                }`}>
                  <h4 className={`text-sm font-medium mb-2 ${
                    hg ? 'text-blue-800' : 'text-blue-400'
                  }`}>
                    Current Profile Data
                  </h4>
                  <div className={`text-sm space-y-1 ${
                    hg ? 'text-blue-700' : 'text-blue-300'
                  }`}>
                    {room.context.familySize && (
                      <p>Family size: {room.context.familySize} people</p>
                    )}
                    {room.context.profession && (
                      <p>Profession: {room.context.profession}</p>
                    )}
                    {room.context.workLocation && (
                      <p>Work location: {room.context.workLocation}</p>
                    )}
                    {room.context.preferences && room.context.preferences.length > 0 && (
                      <p>Preferences: {room.context.preferences.join(', ')}</p>
                    )}
                    {!room.context.familySize && !room.context.profession && 
                     !room.context.workLocation && (!room.context.preferences || room.context.preferences.length === 0) && (
                      <p className="italic">No structured data extracted yet</p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="contextDescription" className={hg ? 'text-gray-700' : 'text-slate-300'}>
                  Your Situation
                </Label>
                <Textarea
                  id="contextDescription"
                  placeholder="e.g., We are a family of 4 looking for a quiet place near Fribourg. I work in Bulle and need good public transport access. We enjoy hiking and want outdoor space for the kids."
                  value={contextDescription}
                  onChange={(e) => setContextDescription(e.target.value)}
                  className={`min-h-[150px] resize-none ${
                    hg
                      ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                      : 'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500'
                  }`}
                />
                <p className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-500'}`}>
                  Include details like: family size, work location, commute needs, lifestyle preferences, hobbies, must-haves
                </p>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setContextDialogOpen(false)}
                disabled={contextSaving}
                className={
                  hg
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                }
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveContext}
                disabled={contextSaving || !contextDescription.trim()}
                className={
                  hg
                    ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white'
                    : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700'
                }
              >
                {contextSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Context'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoomContext.Provider>
  );
}

