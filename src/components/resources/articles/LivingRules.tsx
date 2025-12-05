'use client';

import { isHomegateTheme } from '@/lib/theme';
import { Button } from '@/components/ui/button';

interface LivingRulesProps {
  onClose?: () => void;
  onOpenFullPage?: () => void;
  isFullPage?: boolean;
}

export default function LivingRules({
  onClose,
  onOpenFullPage,
  isFullPage = false,
}: LivingRulesProps) {
  const hg = isHomegateTheme();

  return (
    <article className={`${isFullPage ? 'max-w-2xl mx-auto' : ''}`}>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📋</span>
          <span
            className={`text-sm font-medium px-2 py-1 rounded-full ${
              hg ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            Agreements
          </span>
        </div>
        <h1
          className={`text-2xl md:text-3xl font-bold mb-3 ${
            hg ? 'text-gray-900' : 'text-white'
          }`}
        >
          Creating Shared Living Rules That Actually Work
        </h1>
        <p className={`text-lg ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
          How to build a roommate agreement that prevents problems instead of creating them.
        </p>
      </header>

      {/* Content */}
      <div className={`prose max-w-none ${hg ? 'prose-gray' : 'prose-invert'}`}>
        <section className="mb-8">
          <p className={`text-base leading-relaxed ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            Most roommate agreements fail because they&apos;re either too vague (&quot;we&apos;ll 
            keep things clean&quot;) or too rigid (&quot;dishes must be washed within 47 minutes&quot;). 
            The secret is finding the sweet spot: clear enough to be useful, flexible enough to 
            be livable.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${hg ? 'text-gray-900' : 'text-white'}`}>
            The Mindset Shift: Rules as Care
          </h2>
          <p className={`mb-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            Here&apos;s a reframe that changes everything: <strong className={hg ? 'text-gray-900' : 'text-white'}>rules 
            aren&apos;t restrictions—they&apos;re how you take care of each other.</strong>
          </p>
          <p className={hg ? 'text-gray-700' : 'text-slate-300'}>
            When you agree to quiet hours after 10 PM, you&apos;re not limiting freedom. You&apos;re 
            saying &quot;I care about your sleep.&quot; When you agree to clean up after cooking, 
            you&apos;re saying &quot;I respect our shared space.&quot; Frame it this way, and suddenly 
            the conversation gets easier.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${hg ? 'text-gray-900' : 'text-white'}`}>
            The Five Categories That Matter Most
          </h2>
          <p className={`mb-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            Based on thousands of roommate conflicts (yes, people study this), here are the 
            areas that need clear agreements:
          </p>

          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50 border-l-4 border-[#e5007d]' : 'bg-slate-800/30 border-l-4 border-sky-500'}`}>
              <h3 className={`font-semibold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
                1. Noise & Quiet Hours
              </h3>
              <p className={`text-sm mb-2 ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                This isn&apos;t just about loud music. Consider:
              </p>
              <ul className={`text-sm space-y-1 ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                <li>• When can you use speakers vs. headphones?</li>
                <li>• What about video calls—especially work calls?</li>
                <li>• Early morning alarms: snooze policy?</li>
                <li>• Kitchen noise: is 7 AM coffee-making okay?</li>
              </ul>
            </div>

            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50 border-l-4 border-[#e5007d]' : 'bg-slate-800/30 border-l-4 border-sky-500'}`}>
              <h3 className={`font-semibold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
                2. Cleaning Standards & Schedule
              </h3>
              <p className={`text-sm mb-2 ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                &quot;Clean&quot; means different things to different people. Define:
              </p>
              <ul className={`text-sm space-y-1 ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                <li>• What does &quot;clean kitchen&quot; actually look like?</li>
                <li>• Rotation for deep cleaning common areas</li>
                <li>• Trash and recycling responsibilities</li>
                <li>• Bathroom cleaning frequency and standards</li>
              </ul>
            </div>

            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50 border-l-4 border-[#e5007d]' : 'bg-slate-800/30 border-l-4 border-sky-500'}`}>
              <h3 className={`font-semibold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
                3. Guests & Visitors
              </h3>
              <p className={`text-sm mb-2 ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                The source of many silent frustrations:
              </p>
              <ul className={`text-sm space-y-1 ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                <li>• Overnight guests: how many nights per week/month?</li>
                <li>• Advance notice required?</li>
                <li>• Parties: what constitutes a &quot;party&quot;? Who needs to approve?</li>
                <li>• Significant others: frequency limits?</li>
              </ul>
            </div>

            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50 border-l-4 border-[#e5007d]' : 'bg-slate-800/30 border-l-4 border-sky-500'}`}>
              <h3 className={`font-semibold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
                4. Shared Resources
              </h3>
              <p className={`text-sm mb-2 ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                From the fridge to the parking spot:
              </p>
              <ul className={`text-sm space-y-1 ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                <li>• Food sharing policy (ask first? labeled shelves?)</li>
                <li>• Borrowing items: always ask, or some things are communal?</li>
                <li>• Streaming services and subscriptions</li>
                <li>• Common area furniture and decorations</li>
              </ul>
            </div>

            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50 border-l-4 border-[#e5007d]' : 'bg-slate-800/30 border-l-4 border-sky-500'}`}>
              <h3 className={`font-semibold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
                5. Communication & Conflict
              </h3>
              <p className={`text-sm mb-2 ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                How you&apos;ll handle the inevitable bumps:
              </p>
              <ul className={`text-sm space-y-1 ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                <li>• Preferred communication method (in-person, text, house meeting?)</li>
                <li>• How quickly should issues be addressed?</li>
                <li>• Monthly check-ins: yes or no?</li>
                <li>• What if you can&apos;t resolve something?</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${hg ? 'text-gray-900' : 'text-white'}`}>
            The &quot;Good Enough&quot; Principle
          </h2>
          <div
            className={`p-4 rounded-lg mb-4 ${
              hg ? 'bg-amber-50 border border-amber-200' : 'bg-amber-500/10 border border-amber-500/30'
            }`}
          >
            <p className={`font-medium mb-2 ${hg ? 'text-amber-800' : 'text-amber-400'}`}>
              ⚠️ Common Mistake
            </p>
            <p className={hg ? 'text-amber-900' : 'text-amber-200'}>
              Don&apos;t try to legislate everything. Over-detailed agreements create 
              resentment and a &quot;gotcha&quot; culture. Aim for principles, not 
              procedures.
            </p>
          </div>
          <p className={hg ? 'text-gray-700' : 'text-slate-300'}>
            Instead of &quot;All dishes must be washed within 2 hours of use,&quot; try 
            &quot;We aim to leave the kitchen ready for the next person.&quot; The 
            former invites lawyers; the latter invites consideration.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${hg ? 'text-gray-900' : 'text-white'}`}>
            Making It Official (Without Being Weird)
          </h2>
          <ol className={`space-y-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            <li>
              <strong className={hg ? 'text-gray-900' : 'text-white'}>1. Draft together</strong>
              <p className="mt-1 text-sm">Don&apos;t present a finished document. Create it collaboratively 
              so everyone has ownership.</p>
            </li>
            <li>
              <strong className={hg ? 'text-gray-900' : 'text-white'}>2. Use positive language</strong>
              <p className="mt-1 text-sm">&quot;We will&quot; instead of &quot;Don&apos;t&quot;. 
              &quot;To support everyone&apos;s sleep&quot; instead of &quot;because some people complain.&quot;</p>
            </li>
            <li>
              <strong className={hg ? 'text-gray-900' : 'text-white'}>3. Include an amendment process</strong>
              <p className="mt-1 text-sm">Life changes. Build in how you&apos;ll revisit and update the agreement.</p>
            </li>
            <li>
              <strong className={hg ? 'text-gray-900' : 'text-white'}>4. Everyone signs</strong>
              <p className="mt-1 text-sm">Even informally. The act of signing creates psychological commitment.</p>
            </li>
          </ol>
        </section>

        <section className={`p-6 rounded-lg ${hg ? 'bg-[#fff0f7]' : 'bg-sky-900/20'}`}>
          <h2 className={`text-lg font-semibold mb-3 ${hg ? 'text-gray-900' : 'text-white'}`}>
            Remember
          </h2>
          <p className={hg ? 'text-gray-700' : 'text-slate-300'}>
            The goal isn&apos;t a perfect agreement—it&apos;s a conversation that reveals 
            how each person thinks. The document matters less than the understanding you 
            build creating it. If you can write an agreement together, you can probably 
            live together.
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
