'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { isHomegateTheme } from '@/lib/theme';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const hg = isHomegateTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Redirect to the intended page or the default redirect from the API
      router.push(redirect || data.redirectTo || '/rooms');
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  return (
    <Card className={`w-full max-w-md mx-4 shadow-2xl ${
      hg
        ? 'border-gray-200 bg-white'
        : 'border-slate-700/50 bg-slate-900/80 backdrop-blur-xl'
    }`}>
      <CardHeader className="space-y-1 text-center">
        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ${
          hg
            ? 'bg-[#e5007d] shadow-[#e5007d]/25'
            : 'bg-gradient-to-br from-sky-500 to-indigo-600 shadow-sky-500/25'
        }`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-white"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <CardTitle className={`text-2xl font-bold tracking-tight ${hg ? 'text-gray-900' : 'text-white'}`}>
          Search Room
        </CardTitle>
        <CardDescription className={hg ? 'text-gray-500' : 'text-slate-400'}>
          Collaborative property search with AI assistance
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className={`p-3 text-sm rounded-lg border ${
              hg
                ? 'text-red-600 bg-red-50 border-red-200'
                : 'text-red-400 bg-red-500/10 border-red-500/20'
            }`}>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className={hg ? 'text-gray-700' : 'text-slate-300'}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="pierre@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={hg
                ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#e5007d] focus:ring-[#e5007d]/20'
                : 'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-sky-500 focus:ring-sky-500/20'
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className={hg ? 'text-gray-700' : 'text-slate-300'}>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={hg
                ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#e5007d] focus:ring-[#e5007d]/20'
                : 'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-sky-500 focus:ring-sky-500/20'
              }
            />
          </div>

          <Button
            type="submit"
            className={`w-full font-medium shadow-lg transition-all ${
              hg
                ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white shadow-[#e5007d]/25'
                : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-sky-500/25'
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </Button>
        </CardContent>
      </form>

      <CardFooter className={`flex flex-col gap-3 border-t pt-6 ${
        hg ? 'border-gray-200' : 'border-slate-700/50'
      }`}>
        <p className={`text-xs text-center ${hg ? 'text-gray-500' : 'text-slate-500'}`}>
          Quick login for demo:
        </p>
        <div className="flex gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            className={`flex-1 ${
              hg
                ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            onClick={() => handleQuickLogin('pierre@example.com', 'pierre123')}
          >
            <span
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: '#3B82F6' }}
            />
            Pierre
          </Button>
          <Button
            type="button"
            variant="outline"
            className={`flex-1 ${
              hg
                ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            onClick={() => handleQuickLogin('marie@example.com', 'marie123')}
          >
            <span
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: '#EC4899' }}
            />
            Marie
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  const hg = isHomegateTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      hg
        ? 'bg-gradient-to-br from-[#ffe6f4] via-white to-[#ffe6f4]'
        : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
    }`}>
      {!hg && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent" />
      )}
      
      <Suspense
        fallback={
          <div className={`w-full max-w-md mx-4 h-96 rounded-lg animate-pulse ${
            hg ? 'bg-gray-200' : 'bg-slate-900/50'
          }`} />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
