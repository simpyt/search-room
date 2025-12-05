'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { isHomegateTheme } from '@/lib/theme';
import CompatibilityQuiz from '@/components/resources/CompatibilityQuiz';

export default function QuizPage() {
  const hg = isHomegateTheme();
  const router = useRouter();

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
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/rooms')}
            className={
              hg
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Rooms
          </Button>
        </div>

        {/* Quiz content */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎯</div>
            <h1
              className={`text-3xl font-bold mb-2 ${
                hg ? 'text-gray-900' : 'text-white'
              }`}
            >
              Roommate Compatibility Quiz
            </h1>
            <p className={`text-lg ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
              Discover your living style and what makes you tick as a roommate
            </p>
          </div>

          <div
            className={`rounded-xl p-6 md:p-8 ${
              hg
                ? 'bg-white shadow-lg border border-gray-200'
                : 'bg-slate-900/50 border border-slate-700/50'
            }`}
          >
            <CompatibilityQuiz
              onClose={() => router.push('/rooms')}
              isFullPage={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
