'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { CriteriaWeight } from '@/lib/types';

interface WeightSelectorProps {
  value?: CriteriaWeight;
  onChange: (weight: CriteriaWeight | undefined) => void;
  size?: 'sm' | 'default';
}

const IMPORTANCE_LABELS: Record<number, string> = {
  1: 'Not important',
  2: 'Slightly important',
  3: 'Moderately important',
  4: 'Very important',
  5: 'Essential',
};

export function WeightSelector({
  value,
  onChange,
  size = 'sm',
}: WeightSelectorProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const handleClick = (star: number) => {
    if (value === star) {
      onChange(undefined); // Toggle off if clicking same value
    } else {
      onChange(star as CriteriaWeight);
    }
  };

  const displayValue = hovered ?? value ?? 0;

  return (
    <div
      className="flex items-center gap-0.5 group"
      title="Rate how important this criteria is for you"
      onMouseLeave={() => setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => setHovered(star)}
          className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
          title={IMPORTANCE_LABELS[star]}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={cn(
              'transition-all duration-150',
              size === 'sm' ? 'w-4 h-4' : 'w-5 h-5',
              star <= displayValue
                ? 'text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.4)]'
                : 'text-slate-600 hover:text-slate-500'
            )}
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

