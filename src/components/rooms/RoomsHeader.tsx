'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/lib/types';

interface RoomsHeaderProps {
  user: User | null;
  roomCount: number;
  isHomegate: boolean;
}

export function RoomsHeader({ user, roomCount, isHomegate: hg }: RoomsHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
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
          <h1 className={`text-2xl font-bold ${hg ? 'text-gray-900' : 'text-white'}`}>
            My Rooms
          </h1>
          <p className={hg ? 'text-gray-500' : 'text-slate-400'}>
            {roomCount} search {roomCount === 1 ? 'room' : 'rooms'}
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
                hg ? 'hover:bg-gray-100' : 'hover:bg-slate-800'
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  style={{ backgroundColor: user?.avatarColor }}
                  className="text-white text-sm"
                >
                  {user?.name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <span
                className={`hidden sm:inline ${hg ? 'text-gray-700' : 'text-slate-200'}`}
              >
                {user?.name || 'User'}
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
            className={hg ? 'bg-white border-gray-200' : 'bg-slate-900 border-slate-700'}
          >
            <DropdownMenuLabel className={hg ? 'text-gray-900' : 'text-white'}>
              <div className="flex flex-col">
                <span>{user?.name}</span>
                <span
                  className={`text-xs font-normal ${hg ? 'text-gray-500' : 'text-slate-400'}`}
                >
                  {user?.email}
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
            <DropdownMenuItem
              onClick={() => router.push('/documents')}
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
                <path d="M4 13a4 4 0 0 1 4-4h12" />
                <path d="M4 17a4 4 0 0 0 4 4h12" />
                <path d="M8 9h12a4 4 0 0 1 0 8H8" />
                <path d="M8 5h12" />
              </svg>
              Document Manager
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push('/extension')}
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
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" x2="21" y1="14" y2="3" />
              </svg>
              Browser Extension
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
  );
}
