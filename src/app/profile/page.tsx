'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { isHomegateTheme } from '@/lib/theme';
import type { User } from '@/lib/types';
import { USERS } from '@/lib/types';

export default function ProfilePage() {
  const router = useRouter();
  const hg = isHomegateTheme();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/login?redirect=/profile');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          const userData = USERS[data.user.id];
          setUser(userData || data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
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
          <div
            className={`h-64 rounded-lg animate-pulse ${
              hg ? 'bg-gray-200' : 'bg-slate-800'
            }`}
          />
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
            <Button
              variant="ghost"
              onClick={() => router.push('/rooms')}
              className={hg ? 'text-gray-600 hover:text-gray-900' : 'text-slate-400 hover:text-white'}
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
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back to Rooms
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="max-w-2xl mx-auto">
          <Card
            className={
              hg
                ? 'border-gray-200 bg-white'
                : 'border-slate-700/50 bg-slate-900/50'
            }
          >
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback
                    style={{ backgroundColor: user?.avatarColor }}
                    className="text-3xl text-white"
                  >
                    {user?.name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className={`text-2xl ${hg ? 'text-gray-900' : 'text-white'}`}>
                {user?.name}
              </CardTitle>
              <CardDescription className={hg ? 'text-gray-500' : 'text-slate-400'}>
                {user?.email}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Profile Info */}
              <div
                className={`rounded-lg p-4 ${
                  hg ? 'bg-gray-50' : 'bg-slate-800/50'
                }`}
              >
                <h3
                  className={`text-sm font-medium mb-3 ${
                    hg ? 'text-gray-700' : 'text-slate-300'
                  }`}
                >
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={hg ? 'text-gray-500' : 'text-slate-400'}>
                      User ID
                    </span>
                    <span className={`font-mono text-sm ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
                      {user?.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={hg ? 'text-gray-500' : 'text-slate-400'}>
                      Email
                    </span>
                    <span className={hg ? 'text-gray-700' : 'text-slate-300'}>
                      {user?.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={hg ? 'text-gray-500' : 'text-slate-400'}>
                      Avatar Color
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: user?.avatarColor }}
                      />
                      <span className={`font-mono text-sm ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
                        {user?.avatarColor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className={`w-full ${
                    hg
                      ? 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                      : 'border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50'
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
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



