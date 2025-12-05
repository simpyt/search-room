'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { isHomegateTheme } from '@/lib/theme';
import CompatibilityQuiz from './CompatibilityQuiz';
import {
  ARTICLES,
  MoneyTalk,
  LivingRules,
  ConflictResolution,
  PersonalSpace,
  type ArticleSlug,
} from './articles';

type SheetContent = 'quiz' | ArticleSlug | null;

export default function ResourcesSection() {
  const hg = isHomegateTheme();
  const router = useRouter();
  const [openSheet, setOpenSheet] = useState<SheetContent>(null);

  const handleOpenFullPage = (type: SheetContent) => {
    setOpenSheet(null);
    if (type === 'quiz') {
      router.push('/rooms/quiz');
    } else if (type) {
      router.push(`/rooms/articles/${type}`);
    }
  };

  const renderArticleContent = (slug: ArticleSlug) => {
    const props = {
      onClose: () => setOpenSheet(null),
      onOpenFullPage: () => handleOpenFullPage(slug),
      isFullPage: false,
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
    <section className="mt-12">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            hg ? 'bg-[#e5007d]/10' : 'bg-sky-500/10'
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
            className={`h-5 w-5 ${hg ? 'text-[#e5007d]' : 'text-sky-400'}`}
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <div>
          <h2 className={`text-lg font-semibold ${hg ? 'text-gray-900' : 'text-white'}`}>
            Living Together Resources
          </h2>
          <p className={`text-sm ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
            Tools and guides to help you thrive as roommates
          </p>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Quiz Card - Featured */}
        <Card
          className={`cursor-pointer transition-all group relative overflow-hidden ${
            hg
              ? 'border-[#e5007d]/30 bg-gradient-to-br from-[#fff0f7] to-white hover:border-[#e5007d]/50 hover:shadow-lg hover:shadow-[#e5007d]/10'
              : 'border-sky-500/30 bg-gradient-to-br from-sky-900/20 to-slate-900 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10'
          }`}
          onClick={() => setOpenSheet('quiz')}
        >
          <CardContent className="p-5">
            <div
              className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                hg
                  ? 'bg-[#e5007d] text-white'
                  : 'bg-sky-500 text-white'
              }`}
            >
              Interactive
            </div>
            <div className="text-3xl mb-3">🎯</div>
            <h3 className={`font-semibold mb-1 ${hg ? 'text-gray-900' : 'text-white'}`}>
              Compatibility Quiz
            </h3>
            <p className={`text-sm mb-3 ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
              Discover your roommate style
            </p>
            <div className={`text-xs ${hg ? 'text-gray-400' : 'text-slate-500'}`}>
              15 questions
            </div>
          </CardContent>
        </Card>

        {/* Article Cards */}
        {ARTICLES.map((article) => (
          <Card
            key={article.slug}
            className={`cursor-pointer transition-all group ${
              hg
                ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                : 'border-slate-700/50 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900/80'
            }`}
            onClick={() => setOpenSheet(article.slug)}
          >
            <CardContent className="p-5">
              <div className="text-2xl mb-3">{article.icon}</div>
              <h3 className={`font-semibold mb-1 text-sm ${hg ? 'text-gray-900' : 'text-white'}`}>
                {article.title}
              </h3>
              <p className={`text-xs mb-3 line-clamp-2 ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                {article.subtitle}
              </p>
              <div className={`text-xs ${hg ? 'text-gray-400' : 'text-slate-500'}`}>
                {article.readTime}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quiz Sheet */}
      <Sheet open={openSheet === 'quiz'} onOpenChange={() => setOpenSheet(null)}>
        <SheetContent
          side="right"
          className={`w-full sm:max-w-xl ${
            hg ? 'bg-white' : 'bg-slate-900 border-slate-700'
          }`}
        >
          <SheetHeader className="mb-6">
            <SheetTitle className={hg ? 'text-gray-900' : 'text-white'}>
              Roommate Compatibility Quiz
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
            <CompatibilityQuiz
              onClose={() => setOpenSheet(null)}
              onOpenFullPage={() => handleOpenFullPage('quiz')}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Article Sheets */}
      {ARTICLES.map((article) => (
        <Sheet
          key={article.slug}
          open={openSheet === article.slug}
          onOpenChange={() => setOpenSheet(null)}
        >
          <SheetContent
            side="right"
            className={`w-full sm:max-w-xl ${
              hg ? 'bg-white' : 'bg-slate-900 border-slate-700'
            }`}
          >
            <ScrollArea className="h-[calc(100vh-2rem)] pr-4">
              {renderArticleContent(article.slug)}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      ))}
    </section>
  );
}
