'use client';

import { isHomegateTheme } from '@/lib/theme';
import { Button } from '@/components/ui/button';

interface ConflictResolutionProps {
  onClose?: () => void;
  onOpenFullPage?: () => void;
  isFullPage?: boolean;
}

export default function ConflictResolution({
  onClose,
  onOpenFullPage,
  isFullPage = false,
}: ConflictResolutionProps) {
  const hg = isHomegateTheme();

  return (
    <article className={`${isFullPage ? 'max-w-2xl mx-auto' : ''}`}>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤝</span>
            <span
              className={`text-sm font-medium px-2 py-1 rounded-full ${
                hg ? 'bg-green-100 text-green-700' : 'bg-green-500/20 text-green-400'
              }`}
            >
              Communication
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
          Conflict Resolution: Turning Friction Into Growth
        </h1>
        <p className={`text-base ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
          Because &quot;fine&quot; said through clenched teeth isn&apos;t actually fine.
        </p>
      </header>

      {/* Content */}
      <div className={`prose max-w-none ${hg ? 'prose-gray' : 'prose-invert'}`}>
        <section className="mb-8">
          <p className={`text-base leading-relaxed ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            Here&apos;s a truth bomb: conflict with your roommate isn&apos;t a sign 
            something is wrong. It&apos;s inevitable. Two humans sharing space will 
            disagree. The question isn&apos;t <em>if</em> conflict happens—it&apos;s 
            <em>how</em> you handle it when it does.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${hg ? 'text-gray-900' : 'text-white'}`}>
            The Three Types of Roommate Conflict
          </h2>
          <p className={`mb-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            Understanding the type helps you choose the right response:
          </p>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50' : 'bg-slate-800/30'}`}>
              <h3 className={`font-semibold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
                🔧 Practical Conflicts
              </h3>
              <p className={`text-sm ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                Dishes, noise, bills—specific, solvable issues. These are the easiest to 
                resolve because they have concrete solutions.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50' : 'bg-slate-800/30'}`}>
              <h3 className={`font-semibold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
                💭 Values Conflicts
              </h3>
              <p className={`text-sm ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                Different standards of cleanliness, social expectations, or lifestyle 
                priorities. Harder because they involve identity.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50' : 'bg-slate-800/30'}`}>
              <h3 className={`font-semibold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
                😤 Emotional Conflicts
              </h3>
              <p className={`text-sm ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                Feeling disrespected, taken for granted, or unheard. Often the real issue 
                hiding behind practical complaints.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${hg ? 'text-gray-900' : 'text-white'}`}>
            The 24-Hour Rule
          </h2>
          <div
            className={`p-4 rounded-lg mb-4 ${
              hg ? 'bg-blue-50 border border-blue-200' : 'bg-blue-500/10 border border-blue-500/30'
            }`}
          >
            <p className={hg ? 'text-blue-900' : 'text-blue-200'}>
              <strong>Wait 24 hours before addressing non-urgent issues.</strong> This 
              prevents saying things you&apos;ll regret while still acting before 
              resentment builds.
            </p>
          </div>
          <p className={`mb-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            During those 24 hours, ask yourself:
          </p>
          <ul className={`space-y-2 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            <li className="flex items-start gap-2">
              <span className={hg ? 'text-[#e5007d]' : 'text-sky-400'}>•</span>
              <span>Is this actually a pattern, or a one-time thing?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={hg ? 'text-[#e5007d]' : 'text-sky-400'}>•</span>
              <span>Am I upset about this specific thing, or something underneath it?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={hg ? 'text-[#e5007d]' : 'text-sky-400'}>•</span>
              <span>What outcome do I actually want?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={hg ? 'text-[#e5007d]' : 'text-sky-400'}>•</span>
              <span>Is there anything I might have contributed to this situation?</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${hg ? 'text-gray-900' : 'text-white'}`}>
            The Conversation Framework
          </h2>
          <p className={`mb-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            When you&apos;re ready to talk, use this structure:
          </p>
          
          <div className={`space-y-4 mb-6`}>
            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50 border-l-4 border-green-500' : 'bg-slate-800/30 border-l-4 border-green-500'}`}>
              <h3 className={`font-semibold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
                Step 1: Describe the Situation (Facts Only)
              </h3>
              <p className={`text-sm mb-2 ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                Stick to observable facts, not interpretations.
              </p>
              <div className={`text-sm ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
                <p className={`${hg ? 'text-red-600' : 'text-red-400'}`}>
                  ❌ &quot;You never clean up after yourself.&quot;
                </p>
                <p className={`${hg ? 'text-green-600' : 'text-green-400'} mt-1`}>
                  ✓ &quot;The dishes have been in the sink for three days.&quot;
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50 border-l-4 border-green-500' : 'bg-slate-800/30 border-l-4 border-green-500'}`}>
              <h3 className={`font-semibold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
                Step 2: Express Your Feelings
              </h3>
              <p className={`text-sm mb-2 ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                Use &quot;I&quot; statements. Own your emotional response.
              </p>
              <div className={`text-sm ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
                <p className={`${hg ? 'text-red-600' : 'text-red-400'}`}>
                  ❌ &quot;You&apos;re so inconsiderate.&quot;
                </p>
                <p className={`${hg ? 'text-green-600' : 'text-green-400'} mt-1`}>
                  ✓ &quot;I feel frustrated when I can&apos;t use the kitchen comfortably.&quot;
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50 border-l-4 border-green-500' : 'bg-slate-800/30 border-l-4 border-green-500'}`}>
              <h3 className={`font-semibold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
                Step 3: Make a Specific Request
              </h3>
              <p className={`text-sm mb-2 ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                Be clear about what you need going forward.
              </p>
              <div className={`text-sm ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
                <p className={`${hg ? 'text-red-600' : 'text-red-400'}`}>
                  ❌ &quot;Can you just be more respectful?&quot;
                </p>
                <p className={`${hg ? 'text-green-600' : 'text-green-400'} mt-1`}>
                  ✓ &quot;Could we agree that dishes get done within 24 hours?&quot;
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${hg ? 'bg-gray-50 border-l-4 border-green-500' : 'bg-slate-800/30 border-l-4 border-green-500'}`}>
              <h3 className={`font-semibold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
                Step 4: Listen to Their Side
              </h3>
              <p className={`text-sm ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                Actually listen. They might have context you&apos;re missing, or they 
                might have their own frustrations to share. Good conversations go both ways.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${hg ? 'text-gray-900' : 'text-white'}`}>
            What Not to Do
          </h2>
          <p className={`mb-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            These common approaches make things worse:
          </p>
          <div className={`grid gap-3 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-lg">✗</span>
              <div>
                <strong className={hg ? 'text-gray-900' : 'text-white'}>The Silent Treatment:</strong>
                <span className="ml-1">Creates anxiety and resentment. Use words.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-lg">✗</span>
              <div>
                <strong className={hg ? 'text-gray-900' : 'text-white'}>Venting to Others First:</strong>
                <span className="ml-1">Talk to your roommate before mutual friends.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-lg">✗</span>
              <div>
                <strong className={hg ? 'text-gray-900' : 'text-white'}>The Ambush:</strong>
                <span className="ml-1">Ask &quot;Can we talk about something?&quot; first.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-lg">✗</span>
              <div>
                <strong className={hg ? 'text-gray-900' : 'text-white'}>Passive-Aggressive Notes:</strong>
                <span className="ml-1">If it&apos;s worth writing, it&apos;s worth saying.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-lg">✗</span>
              <div>
                <strong className={hg ? 'text-gray-900' : 'text-white'}>Kitchen-Sink Fighting:</strong>
                <span className="ml-1">One issue at a time. Don&apos;t bring up old grievances.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${hg ? 'text-gray-900' : 'text-white'}`}>
            When You&apos;re the Problem
          </h2>
          <p className={`mb-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            Sometimes you&apos;ll be on the receiving end. Here&apos;s how to handle it well:
          </p>
          <ol className={`space-y-3 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
            <li><strong className={hg ? 'text-gray-900' : 'text-white'}>1. Don&apos;t get defensive.</strong> Your first instinct will be to justify or explain. Resist it.</li>
            <li><strong className={hg ? 'text-gray-900' : 'text-white'}>2. Thank them for bringing it up.</strong> It took courage to say something.</li>
            <li><strong className={hg ? 'text-gray-900' : 'text-white'}>3. Ask clarifying questions.</strong> Make sure you understand the issue.</li>
            <li><strong className={hg ? 'text-gray-900' : 'text-white'}>4. Acknowledge their feelings.</strong> Even if you disagree with the interpretation.</li>
            <li><strong className={hg ? 'text-gray-900' : 'text-white'}>5. Commit to specific changes.</strong> And actually follow through.</li>
          </ol>
        </section>

        <section className={`p-6 rounded-lg ${hg ? 'bg-[#fff0f7]' : 'bg-sky-900/20'}`}>
          <h2 className={`text-lg font-semibold mb-3 ${hg ? 'text-gray-900' : 'text-white'}`}>
            The Silver Lining
          </h2>
          <p className={hg ? 'text-gray-700' : 'text-slate-300'}>
            Roommates who successfully navigate conflict often become closer than those 
            who never disagree. Working through problems together builds trust and 
            understanding. The goal isn&apos;t a conflict-free home—it&apos;s a home 
            where conflict gets handled respectfully.
          </p>
        </section>
      </div>

    </article>
  );
}
