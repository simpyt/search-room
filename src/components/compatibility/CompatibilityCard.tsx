'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CompatibilitySnapshot } from '@/lib/types';
import {
  COMPATIBILITY_LEVEL_COLORS,
  COMPATIBILITY_LEVEL_BG,
} from '@/lib/types';
import { isHomegateTheme } from '@/lib/theme';

interface CompatibilityCardProps {
  compatibility: CompatibilitySnapshot | null;
  onRecalculate: () => void;
  personalizedFor?: string;
  partnerName?: string;
}

export function CompatibilityCard({
  compatibility,
  onRecalculate,
  personalizedFor,
  partnerName,
}: CompatibilityCardProps) {
  const hg = isHomegateTheme();

  if (!compatibility) {
    return (
      <Card className={hg ? 'border-gray-200 bg-gray-100' : 'border-slate-700/50 bg-slate-900/50'}>
        <CardContent className="py-6">
          <div className="text-center">
            <p className={`mb-4 ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
              Compatibility has not been calculated yet
            </p>
            <Button onClick={onRecalculate} className={hg ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white' : 'bg-sky-600 hover:bg-sky-700'}>
              Calculate Compatibility
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const levelColor = COMPATIBILITY_LEVEL_COLORS[compatibility.level];
  const levelBg = COMPATIBILITY_LEVEL_BG[compatibility.level];

  const percentage = compatibility.scorePercent;

  return (
    <Card className={`border ${levelBg}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={hg ? 'text-gray-900' : 'text-white'}>
            {personalizedFor
              ? `Your Compatibility${partnerName ? ` with ${partnerName}` : ''}`
              : 'Compatibility'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRecalculate}
            className={hg ? 'text-gray-500 hover:text-gray-900' : 'text-slate-400 hover:text-white'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 mr-1"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            Recalculate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Gauge */}
          <div className="relative w-24 h-12 overflow-hidden">
            <div className="absolute inset-0">
              {/* Background arc */}
              <svg viewBox="0 0 100 50" className="w-full h-full">
                <path
                  d="M 5 50 A 45 45 0 0 1 95 50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className={hg ? 'text-gray-300' : 'text-slate-700'}
                />
                {/* Progress arc */}
                <path
                  d="M 5 50 A 45 45 0 0 1 95 50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${percentage * 1.41} 141`}
                  className={levelColor}
                />
              </svg>
            </div>
            {/* Percentage text */}
            <div className="absolute inset-0 flex items-end justify-center pb-1">
              <span className={`text-2xl font-bold ${levelColor}`}>
                {percentage}%
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className={`${levelBg} ${levelColor} border-current`}
              >
                {compatibility.level}
              </Badge>
            </div>
            <p className={`text-sm ${hg ? 'text-gray-600' : 'text-slate-300'}`}>{compatibility.comment}</p>
          </div>
        </div>

        {/* Low compatibility suggestion */}
        {compatibility.level === 'LOW' && (
          <div className={`mt-4 p-3 rounded-lg border ${
            hg
              ? 'bg-amber-50 border-amber-200'
              : 'bg-amber-500/10 border-amber-500/20'
          }`}>
            <p className={`text-sm ${hg ? 'text-amber-700' : 'text-amber-400'}`}>
              <strong>Tip:</strong> Ask the AI Co-pilot to suggest a compromise
              by typing &quot;AI, suggest a compromise&quot; in the chat.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

