'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRoom } from './RoomContext';
import { isHomegateTheme } from '@/lib/theme';

// Dynamic imports with loading skeletons for code splitting
const TogetherView = dynamic(
  () => import('@/components/views/TogetherView').then((mod) => mod.TogetherView),
  {
    loading: () => <ViewSkeleton />,
  }
);

const MyView = dynamic(
  () => import('@/components/views/MyView').then((mod) => mod.MyView),
  {
    loading: () => <ViewSkeleton />,
  }
);

function ViewSkeleton() {
  const hg = isHomegateTheme();
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`rounded-lg p-6 ${
            hg ? 'bg-white border border-gray-200' : 'bg-slate-900/50 border border-slate-700/50'
          }`}
        >
          <div className="space-y-4">
            <div className={`h-6 w-40 rounded animate-pulse ${hg ? 'bg-gray-200' : 'bg-slate-700'}`} />
            <div className={`h-4 w-64 rounded animate-pulse ${hg ? 'bg-gray-200' : 'bg-slate-700'}`} />
            <div className={`h-32 rounded animate-pulse ${hg ? 'bg-gray-100' : 'bg-slate-800/50'}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RoomPage() {
  const { room, user } = useRoom();
  const [activeTab, setActiveTab] = useState<'together' | 'my-view'>('together');
  const hg = isHomegateTheme();

  if (!room || !user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Tab Switcher */}
      <div className="flex justify-center mb-8">
        <div
          className={`relative inline-flex p-1 rounded-2xl ${
            hg
              ? 'bg-gray-100 shadow-inner'
              : 'bg-slate-800/80 backdrop-blur-sm border border-slate-700/50'
          }`}
        >
          {/* Sliding indicator */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-2px)] rounded-xl transition-all duration-300 ease-out ${
              activeTab === 'together' ? 'left-1' : 'left-[calc(50%+1px)]'
            } ${
              hg
                ? 'bg-[#e5007d] shadow-lg shadow-[#e5007d]/25'
                : 'bg-gradient-to-r from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/25'
            }`}
          />

          {/* Together Tab */}
          <button
            onClick={() => setActiveTab('together')}
            className={`relative z-10 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 min-w-[140px] ${
              activeTab === 'together'
                ? 'text-white'
                : hg
                  ? 'text-gray-600 hover:text-gray-900'
                  : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Together
            </span>
          </button>

          {/* My View Tab */}
          <button
            onClick={() => setActiveTab('my-view')}
            className={`relative z-10 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 min-w-[140px] ${
              activeTab === 'my-view'
                ? 'text-white'
                : hg
                  ? 'text-gray-600 hover:text-gray-900'
                  : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
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
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              My View
              <span className={`text-xs font-normal ${
                activeTab === 'my-view'
                  ? 'text-white/70'
                  : hg ? 'text-gray-400' : 'text-slate-500'
              }`}>
                ({user.name})
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in-0 duration-300">
        {activeTab === 'together' ? <TogetherView /> : <MyView />}
      </div>
    </div>
  );
}
