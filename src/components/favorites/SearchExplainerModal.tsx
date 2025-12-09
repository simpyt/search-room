'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { isHomegateTheme } from '@/lib/theme';

interface SearchExplainerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExpandCriteria?: () => void;
}

export function SearchExplainerModal({
  open,
  onOpenChange,
  onExpandCriteria,
}: SearchExplainerModalProps) {
  const hg = isHomegateTheme();

  const handleGoToSearch = () => {
    onOpenChange(false);
    onExpandCriteria?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-md ${hg ? 'bg-white' : 'bg-slate-900 border-slate-700'}`}>
        <DialogHeader>
          <DialogTitle className={hg ? 'text-gray-900' : 'text-white'}>
            Add from Search
          </DialogTitle>
          <DialogDescription className={hg ? 'text-gray-500' : 'text-slate-400'}>
            Find properties that match your group&apos;s criteria
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Steps */}
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span
                className={`flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                  hg ? 'bg-[#e5007d]/10 text-[#e5007d]' : 'bg-sky-500/20 text-sky-400'
                }`}
              >
                1
              </span>
              <div>
                <h4 className={`font-medium ${hg ? 'text-gray-900' : 'text-white'}`}>
                  Set your criteria
                </h4>
                <p className={`text-sm mt-0.5 ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                  Open the &quot;Search Criteria&quot; section and set your preferences (location, price, rooms, etc.)
                </p>
              </div>
            </li>

            <li className="flex gap-4">
              <span
                className={`flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                  hg ? 'bg-[#e5007d]/10 text-[#e5007d]' : 'bg-sky-500/20 text-sky-400'
                }`}
              >
                2
              </span>
              <div>
                <h4 className={`font-medium ${hg ? 'text-gray-900' : 'text-white'}`}>
                  Search properties
                </h4>
                <p className={`text-sm mt-0.5 ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                  Click the{' '}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    hg ? 'bg-[#e5007d] text-white' : 'bg-sky-600 text-white'
                  }`}>
                    Search Properties
                  </span>
                  {' '}button to find matching listings
                </p>
              </div>
            </li>

            <li className="flex gap-4">
              <span
                className={`flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                  hg ? 'bg-[#e5007d]/10 text-[#e5007d]' : 'bg-sky-500/20 text-sky-400'
                }`}
              >
                3
              </span>
              <div>
                <h4 className={`font-medium ${hg ? 'text-gray-900' : 'text-white'}`}>
                  Pin your favorites
                </h4>
                <p className={`text-sm mt-0.5 ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                  Click the heart icon on any result to add it to your favorites list
                </p>
              </div>
            </li>
          </ol>

          {/* Tip */}
          <div className={`flex items-start gap-3 p-3 rounded-lg ${
            hg ? 'bg-amber-50 border border-amber-200' : 'bg-amber-500/10 border border-amber-500/20'
          }`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-5 w-5 flex-shrink-0 mt-0.5 ${hg ? 'text-amber-600' : 'text-amber-400'}`}
            >
              <path d="M12 2v4" />
              <path d="m6.8 14-3.5 2" />
              <path d="m20.7 16-3.5-2" />
              <path d="M6.8 10 3.3 8" />
              <path d="m20.7 8-3.5 2" />
              <path d="m9 22 3-8 3 8" />
              <path d="M8 22h8" />
              <path d="M12 6a4 4 0 0 0-4 4c0 1.5.8 2.8 2 3.4" />
              <path d="M12 6a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.4" />
            </svg>
            <div>
              <p className={`text-sm font-medium ${hg ? 'text-amber-800' : 'text-amber-300'}`}>
                Pro tip
              </p>
              <p className={`text-sm ${hg ? 'text-amber-700' : 'text-amber-400'}`}>
                Use the AI Assistant to describe what you&apos;re looking for in natural language!
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={hg ? 'border-gray-200' : 'border-slate-700'}
          >
            Close
          </Button>
          {onExpandCriteria && (
            <Button
              onClick={handleGoToSearch}
              className={hg ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white' : 'bg-sky-600 hover:bg-sky-700'}
            >
              Go to Search Criteria
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


