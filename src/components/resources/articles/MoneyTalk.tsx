'use client';

import { isHomegateTheme } from '@/lib/theme';
import { Button } from '@/components/ui/button';

interface MoneyTalkProps {
  onClose?: () => void;
  onOpenFullPage?: () => void;
  isFullPage?: boolean;
}

export default function MoneyTalk({
  onClose,
  onOpenFullPage,
  isFullPage = false,
}: MoneyTalkProps) {
  const hg = isHomegateTheme();

  return (
    <article className={`${isFullPage ? 'max-w-2xl mx-auto' : ''}`}>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">💰</span>
          <span
            className={`text-sm font-medium px-2 py-1 rounded-full ${
              hg ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            Finances
          </span>
        </div>
        <h1
          className={`text-2xl md:text-3xl font-bold mb-3 ${
            hg ? 'text-gray-900' : 'text-white'
          }`}
        >
          The Money Talk: Aligning Financial Expectations
        </h1>
        <p className={`text-lg ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
          The conversation nobody wants to have, but everyone needs to.
        </p>
      </header>

      {/* Content */}
      <div className={`prose max-w-none ${hg ? 'prose-gray' : 'prose-invert'}`}>
        <section className="mb-8">
          <p className={`text-base leading-relaxed ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            Money is the leading cause of roommate conflicts. Not dirty dishes. Not loud music. 
            <strong className={hg ? 'text-gray-900' : 'text-white'}> Money.</strong> Yet it&apos;s 
            the conversation most people avoid until it becomes a crisis. Here&apos;s how to do better.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${hg ? 'text-gray-900' : 'text-white'}`}>
            Before You Move In: The Essential Conversation
          </h2>
          <p className={`mb-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            Have this conversation <em>before</em> signing anything. Sit down with a coffee (or 
            something stronger) and discuss:
          </p>
          <ul className={`space-y-3 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            <li className="flex items-start gap-2">
              <span className={hg ? 'text-[#e5007d]' : 'text-sky-400'}>→</span>
              <span><strong className={hg ? 'text-gray-900' : 'text-white'}>Income comfort levels:</strong> You 
              don&apos;t need exact numbers, but understand if you&apos;re in similar financial brackets.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={hg ? 'text-[#e5007d]' : 'text-sky-400'}>→</span>
              <span><strong className={hg ? 'text-gray-900' : 'text-white'}>Spending philosophies:</strong> Is 
              one person a saver and the other a spender? This will affect shared decisions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={hg ? 'text-[#e5007d]' : 'text-sky-400'}>→</span>
              <span><strong className={hg ? 'text-gray-900' : 'text-white'}>Emergency preparedness:</strong> What 
              happens if someone loses their job? Have a plan.</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${hg ? 'text-gray-900' : 'text-white'}`}>
            The Non-Negotiables: Getting It In Writing
          </h2>
          <div
            className={`p-4 rounded-lg mb-4 ${
              hg ? 'bg-gray-100' : 'bg-slate-800/50'
            }`}
          >
            <p className={`font-medium mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
              🔑 Golden Rule
            </p>
            <p className={hg ? 'text-gray-700' : 'text-slate-300'}>
              If a verbal agreement feels awkward to put in writing, that&apos;s a red flag. 
              Anything worth agreeing to is worth documenting.
            </p>
          </div>
          <p className={`mb-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            Your roommate agreement should clearly state:
          </p>
          <ol className={`space-y-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            <li>
              <strong className={hg ? 'text-gray-900' : 'text-white'}>1. Rent split method</strong>
              <p className="mt-1 text-sm">Equal split? By room size? By income percentage? All are valid—just be explicit.</p>
            </li>
            <li>
              <strong className={hg ? 'text-gray-900' : 'text-white'}>2. Utilities division</strong>
              <p className="mt-1 text-sm">Include internet, electricity, gas, water, and any subscriptions.</p>
            </li>
            <li>
              <strong className={hg ? 'text-gray-900' : 'text-white'}>3. Payment deadlines</strong>
              <p className="mt-1 text-sm">When is money due? Who pays the landlord? What&apos;s the grace period?</p>
            </li>
            <li>
              <strong className={hg ? 'text-gray-900' : 'text-white'}>4. Late payment consequences</strong>
              <p className="mt-1 text-sm">Uncomfortable but essential. Decide this when everyone is calm.</p>
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${hg ? 'text-gray-900' : 'text-white'}`}>
            Shared Expenses: The Grey Zone
          </h2>
          <p className={`mb-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            Beyond rent and utilities lies the murky world of shared expenses. Toilet paper. Dish 
            soap. That fancy olive oil. Here are three proven approaches:
          </p>
          <div className="grid gap-4">
            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50 border border-gray-200' : 'bg-slate-800/30 border border-slate-700'}`}>
              <h3 className={`font-semibold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
                The Kitty System
              </h3>
              <p className={`text-sm ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                Everyone contributes a fixed amount monthly to a shared fund. All household 
                purchases come from this. Simple and automatic.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50 border border-gray-200' : 'bg-slate-800/30 border border-slate-700'}`}>
              <h3 className={`font-semibold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
                The App Approach
              </h3>
              <p className={`text-sm ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                Use Splitwise or similar apps to track expenses and settle up monthly. 
                Great for detail-oriented households.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50 border border-gray-200' : 'bg-slate-800/30 border border-slate-700'}`}>
              <h3 className={`font-semibold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
                The Rotation Method
              </h3>
              <p className={`text-sm ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                Take turns buying household items. Less precise but works well for 
                trusting, low-maintenance roommates.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${hg ? 'text-gray-900' : 'text-white'}`}>
            When Things Go Wrong
          </h2>
          <p className={`mb-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            Someone will eventually be short on rent. Here&apos;s how to handle it without 
            destroying the relationship:
          </p>
          <ol className={`space-y-3 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            <li><strong className={hg ? 'text-gray-900' : 'text-white'}>Address it immediately.</strong> Silence breeds resentment.</li>
            <li><strong className={hg ? 'text-gray-900' : 'text-white'}>Assume good intent.</strong> Most people aren&apos;t trying to take advantage.</li>
            <li><strong className={hg ? 'text-gray-900' : 'text-white'}>Create a payback plan.</strong> Specifics: amount, date, method.</li>
            <li><strong className={hg ? 'text-gray-900' : 'text-white'}>Document it.</strong> A quick text summary protects everyone.</li>
            <li><strong className={hg ? 'text-gray-900' : 'text-white'}>Learn from it.</strong> If it keeps happening, that&apos;s a pattern, not bad luck.</li>
          </ol>
        </section>

        <section className={`p-6 rounded-lg ${hg ? 'bg-[#fff0f7]' : 'bg-sky-900/20'}`}>
          <h2 className={`text-lg font-semibold mb-3 ${hg ? 'text-gray-900' : 'text-white'}`}>
            The Bottom Line
          </h2>
          <p className={hg ? 'text-gray-700' : 'text-slate-300'}>
            Money conversations are awkward for about 15 minutes. Money <em>problems</em> are 
            awkward for months. Choose your discomfort wisely. The roommates who talk about 
            money early are the ones who stay friends after moving out.
          </p>
        </section>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
        {!isFullPage && onOpenFullPage && (
          <Button
            onClick={onOpenFullPage}
            variant="outline"
            className={
              hg
                ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                : 'border-slate-600 text-slate-300 hover:bg-slate-800'
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
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" x2="21" y1="14" y2="3" />
            </svg>
            Open Full Page
          </Button>
        )}
        {onClose && (
          <Button
            onClick={onClose}
            className={
              hg
                ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white'
                : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white'
            }
          >
            Done Reading
          </Button>
        )}
      </div>
    </article>
  );
}
