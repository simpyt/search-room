'use client';

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { isHomegateTheme } from '@/lib/theme';
import {
  ARTICLES,
  MoneyTalk,
  LivingRules,
  ConflictResolution,
  PersonalSpace,
  type ArticleSlug,
} from '@/components/resources/articles';

export default function ArticlePage() {
  const hg = isHomegateTheme();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as ArticleSlug;

  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          hg
            ? 'bg-gradient-to-br from-[#ffe6f4] via-white to-[#ffe6f4]'
            : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        }`}
      >
        <div className="text-center">
          <h1
            className={`text-2xl font-bold mb-4 ${
              hg ? 'text-gray-900' : 'text-white'
            }`}
          >
            Article not found
          </h1>
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
    );
  }

  const renderArticle = () => {
    const props = {
      onClose: () => router.push('/rooms'),
      isFullPage: true,
    };

    switch (slug) {
      case 'money-talk':
        return <MoneyTalk {...props} />;
      case 'living-rules':
        return <LivingRules {...props} />;
      case 'conflict-resolution':
        return <ConflictResolution {...props} />;
      case 'personal-space':
        return <PersonalSpace {...props} />;
      default:
        return null;
    }
  };

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

        {/* Article content */}
        <div
          className={`max-w-2xl mx-auto rounded-xl p-6 md:p-8 ${
            hg
              ? 'bg-white shadow-lg border border-gray-200'
              : 'bg-slate-900/50 border border-slate-700/50'
          }`}
        >
          {renderArticle()}
        </div>
      </div>
    </div>
  );
}
