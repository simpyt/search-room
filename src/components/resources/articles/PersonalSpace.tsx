'use client';

import { isHomegateTheme } from '@/lib/theme';
import { Button } from '@/components/ui/button';

interface PersonalSpaceProps {
  onClose?: () => void;
  onOpenFullPage?: () => void;
  isFullPage?: boolean;
}

export default function PersonalSpace({
  onClose,
  onOpenFullPage,
  isFullPage = false,
}: PersonalSpaceProps) {
  const hg = isHomegateTheme();

  return (
    <article className={`${isFullPage ? 'max-w-2xl mx-auto' : ''}`}>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚪</span>
            <span
              className={`text-sm font-medium px-2 py-1 rounded-full ${
                hg ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-400'
              }`}
            >
              Boundaries
            </span>
          </div>
          {!isFullPage && (onOpenFullPage || onClose) && (
            <div className="flex items-center gap-2">
              {onOpenFullPage && (
                <Button
                  onClick={onOpenFullPage}
                  variant="outline"
                  size="sm"
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
                    className="h-4 w-4 mr-1.5"
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
                  variant="outline"
                  size="sm"
                  className={
                    hg
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                      : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                  }
                >
                  Close
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 ml-1"
                  >
                    <line x1="18" x2="6" y1="6" y2="18" />
                    <line x1="6" x2="18" y1="6" y2="18" />
                  </svg>
                </Button>
              )}
            </div>
          )}
        </div>
        <h1
          className={`text-2xl md:text-3xl font-bold mb-2 ${
            hg ? 'text-gray-900' : 'text-white'
          }`}
        >
          Balancing Togetherness and Personal Space
        </h1>
        <p className={`text-base ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
          Living together doesn&apos;t mean being together all the time.
        </p>
      </header>

      {/* Content */}
      <div className={`prose max-w-none ${hg ? 'prose-gray' : 'prose-invert'}`}>
        <section className="mb-8">
          <p className={`text-base leading-relaxed ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            You moved in with roommates for good reasons—shared costs, companionship, 
            maybe even friendship. But here&apos;s something nobody warned you about: 
            <strong className={hg ? 'text-gray-900' : 'text-white'}> sometimes you&apos;ll 
            want to be alone in your own home, and that&apos;s completely okay.</strong>
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${hg ? 'text-gray-900' : 'text-white'}`}>
            The Introvert-Extrovert Spectrum
          </h2>
          <p className={`mb-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            Understanding where you and your roommates fall on this spectrum prevents a 
            lot of misunderstandings:
          </p>
          <div className={`p-4 rounded-lg mb-4 ${hg ? 'bg-gray-50' : 'bg-slate-800/30'}`}>
            <div className="flex justify-between text-sm mb-2">
              <span className={hg ? 'text-purple-600' : 'text-purple-400'}>Introvert</span>
              <span className={hg ? 'text-amber-600' : 'text-amber-400'}>Extrovert</span>
            </div>
            <div className={`h-3 rounded-full ${hg ? 'bg-gradient-to-r from-purple-400 to-amber-400' : 'bg-gradient-to-r from-purple-500 to-amber-500'}`} />
            <p className={`text-sm mt-3 ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
              Introverts recharge alone; extroverts recharge with others. Neither is 
              wrong—they&apos;re just different batteries.
            </p>
          </div>
          <p className={hg ? 'text-gray-700' : 'text-slate-300'}>
            When an introvert retreats to their room after work, they&apos;re not being 
            antisocial—they&apos;re refueling. When an extrovert wants to hang out in 
            common areas, they&apos;re not being needy—they&apos;re doing the same thing.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${hg ? 'text-gray-900' : 'text-white'}`}>
            Creating Space Without Being Rude
          </h2>
          <p className={`mb-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            The art of graceful boundary-setting:
          </p>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50' : 'bg-slate-800/30'}`}>
              <h3 className={`font-semibold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
                Establish a Signal System
              </h3>
              <p className={`text-sm ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                Headphones on = don&apos;t disturb. Door closed = knock first. A simple 
                &quot;I need some me-time&quot; is not rejection—it&apos;s honesty.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50' : 'bg-slate-800/30'}`}>
              <h3 className={`font-semibold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
                Schedule Together Time
              </h3>
              <p className={`text-sm ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                Counter-intuitively, scheduling hangouts makes alone time easier. When you 
                have dinner together Thursdays, it&apos;s easier to take Tuesday to yourself.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50' : 'bg-slate-800/30'}`}>
              <h3 className={`font-semibold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
                Normalize Parallel Living
              </h3>
              <p className={`text-sm ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                Being in the same room doesn&apos;t mean interacting. Reading in silence 
                together is valid togetherness. Not every moment needs conversation.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${hg ? 'text-gray-900' : 'text-white'}`}>
            Physical Space Boundaries
          </h2>
          <div
            className={`p-4 rounded-lg mb-4 ${
              hg ? 'bg-purple-50 border border-purple-200' : 'bg-purple-500/10 border border-purple-500/30'
            }`}
          >
            <p className={`font-medium mb-2 ${hg ? 'text-purple-800' : 'text-purple-400'}`}>
              🏠 Key Principle
            </p>
            <p className={hg ? 'text-purple-900' : 'text-purple-200'}>
              Your room is your sanctuary. Common areas are shared. Knock before 
              entering closed doors—always.
            </p>
          </div>
          <p className={`mb-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            Beyond the obvious, consider:
          </p>
          <ul className={`space-y-3 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            <li className="flex items-start gap-2">
              <span className={hg ? 'text-[#e5007d]' : 'text-sky-400'}>→</span>
              <span><strong className={hg ? 'text-gray-900' : 'text-white'}>Bathroom time:</strong> Early 
              morning routines need coordination. Know each other&apos;s schedules.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={hg ? 'text-[#e5007d]' : 'text-sky-400'}>→</span>
              <span><strong className={hg ? 'text-gray-900' : 'text-white'}>Kitchen access:</strong> Can 
              you cook whenever, or are there peak times to avoid?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={hg ? 'text-[#e5007d]' : 'text-sky-400'}>→</span>
              <span><strong className={hg ? 'text-gray-900' : 'text-white'}>Living room primacy:</strong> Is 
              this first-come-first-served, or are there implicit claims?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={hg ? 'text-[#e5007d]' : 'text-sky-400'}>→</span>
              <span><strong className={hg ? 'text-gray-900' : 'text-white'}>Work from home zones:</strong> In 
              the remote work era, this needs explicit discussion.</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${hg ? 'text-gray-900' : 'text-white'}`}>
            The &quot;No Explanation Needed&quot; Policy
          </h2>
          <p className={`mb-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            Here&apos;s a liberating agreement to establish early:
          </p>
          <div className={`p-4 rounded-lg ${hg ? 'bg-gray-100' : 'bg-slate-800/50'}`}>
            <p className={`italic ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
              &quot;Either of us can say &apos;I need alone time&apos; without having 
              to explain why, and the other person won&apos;t take it personally.&quot;
            </p>
          </div>
          <p className={`mt-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            This removes the guilt from needing space and the hurt from 
            &quot;rejection.&quot; Bad day at work? Need space. Processing emotions? 
            Need space. Just feel like it? Also valid.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${hg ? 'text-gray-900' : 'text-white'}`}>
            When Connection Matters
          </h2>
          <p className={`mb-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            Balance goes both ways. Too much isolation can make a shared home feel 
            like a hotel. Build in moments of connection:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50' : 'bg-slate-800/30'}`}>
              <h3 className={`font-semibold mb-2 text-sm ${hg ? 'text-gray-900' : 'text-white'}`}>
                Morning Check-ins
              </h3>
              <p className={`text-sm ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                A quick &quot;good morning&quot; and brief chat sets a friendly tone.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50' : 'bg-slate-800/30'}`}>
              <h3 className={`font-semibold mb-2 text-sm ${hg ? 'text-gray-900' : 'text-white'}`}>
                Shared Meals
              </h3>
              <p className={`text-sm ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                Even once a week builds relationship and shared experience.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50' : 'bg-slate-800/30'}`}>
              <h3 className={`font-semibold mb-2 text-sm ${hg ? 'text-gray-900' : 'text-white'}`}>
                Common Area Presence
              </h3>
              <p className={`text-sm ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                Occasionally work or relax in shared spaces, not always your room.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50' : 'bg-slate-800/30'}`}>
              <h3 className={`font-semibold mb-2 text-sm ${hg ? 'text-gray-900' : 'text-white'}`}>
                House Activities
              </h3>
              <p className={`text-sm ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                Movie nights, cooking together, or just watching the game.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${hg ? 'text-gray-900' : 'text-white'}`}>
            Signs the Balance Is Off
          </h2>
          <p className={`mb-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            Watch for these warning signals:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className={`p-4 rounded-lg ${hg ? 'bg-red-50 border border-red-200' : 'bg-red-500/10 border border-red-500/30'}`}>
              <h3 className={`font-semibold mb-2 text-sm ${hg ? 'text-red-700' : 'text-red-400'}`}>
                Too Much Together
              </h3>
              <ul className={`text-sm space-y-1 ${hg ? 'text-red-600' : 'text-red-300'}`}>
                <li>• Feeling drained at home</li>
                <li>• Avoiding common areas</li>
                <li>• Leaving the house just to get peace</li>
                <li>• Irritation at normal interactions</li>
              </ul>
            </div>
            <div className={`p-4 rounded-lg ${hg ? 'bg-amber-50 border border-amber-200' : 'bg-amber-500/10 border border-amber-500/30'}`}>
              <h3 className={`font-semibold mb-2 text-sm ${hg ? 'text-amber-700' : 'text-amber-400'}`}>
                Too Much Apart
              </h3>
              <ul className={`text-sm space-y-1 ${hg ? 'text-amber-600' : 'text-amber-300'}`}>
                <li>• Feeling isolated at home</li>
                <li>• Not knowing your roommate&apos;s life</li>
                <li>• Awkward when you do interact</li>
                <li>• Home feels like a lonely place</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={`p-6 rounded-lg ${hg ? 'bg-[#fff0f7]' : 'bg-sky-900/20'}`}>
          <h2 className={`text-lg font-semibold mb-3 ${hg ? 'text-gray-900' : 'text-white'}`}>
            The Sweet Spot
          </h2>
          <p className={hg ? 'text-gray-700' : 'text-slate-300'}>
            The best roommate relationships have a rhythm: together sometimes, apart 
            sometimes, with clear signals for both. You should feel comfortable being 
            alone in your home AND comfortable spending time with your roommate. 
            If either feels awkward, it&apos;s time to recalibrate.
          </p>
        </section>
      </div>

    </article>
  );
}
