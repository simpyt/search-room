'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CriteriaWeight } from '@/lib/types';

interface WeightSelectorProps {
  value?: CriteriaWeight;
  onChange: (weight: CriteriaWeight | undefined) => void;
  size?: 'sm' | 'default';
}

const WEIGHT_OPTIONS: { value: CriteriaWeight; label: string; stars: number }[] = [
  { value: 1, label: 'Trivial', stars: 1 },
  { value: 3, label: 'Nice to have', stars: 3 },
  { value: 5, label: 'Must have', stars: 5 },
];

export function WeightSelector({
  value,
  onChange,
  size = 'sm',
}: WeightSelectorProps) {
  const handleClick = (weight: CriteriaWeight) => {
    if (value === weight) {
      onChange(undefined); // Toggle off
    } else {
      onChange(weight);
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      {WEIGHT_OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleClick(option.value)}
          className={cn(
            'h-6 px-1.5 text-xs transition-all',
            value === option.value
              ? 'text-amber-400 bg-amber-500/10'
              : 'text-slate-500 hover:text-slate-400'
          )}
          title={option.label}
        >
          {Array.from({ length: option.stars }).map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={cn(
                'transition-all',
                size === 'sm' ? 'w-3 h-3' : 'w-4 h-4',
                value && value >= option.value ? 'opacity-100' : 'opacity-40'
              )}
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                clipRule="evenodd"
              />
            </svg>
          ))}
        </Button>
      ))}
    </div>
  );
}

