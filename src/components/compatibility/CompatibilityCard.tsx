'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CompatibilitySnapshot } from '@/lib/types';
import { COMPATIBILITY_LEVEL_COLORS, COMPATIBILITY_LEVEL_BG } from '@/lib/types';
import { btnPrimary } from '@/lib/styles';

interface CompatibilityCardProps {
  compatibility: CompatibilitySnapshot | null;
  onRecalculate: () => void | Promise<void>;
  personalizedFor?: string;
  partnerName?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function CompatibilityCard({ compatibility, onRecalculate, personalizedFor, partnerName, collapsible = false, defaultExpanded = false }: CompatibilityCardProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRecalculate();
    } finally {
      setRefreshing(false);
    }
  };

  if (!compatibility) {
    return (
      <Card className="border-border-subtle bg-surface">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center bg-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-text-muted"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <p className="mb-4 text-text-muted">Compatibility has not been calculated yet</p>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className={btnPrimary}
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Calculating...
                </>
              ) : (
                'Calculate Compatibility'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const levelColor = COMPATIBILITY_LEVEL_COLORS[compatibility.level];
  const levelBg = COMPATIBILITY_LEVEL_BG[compatibility.level];
  const percentage = compatibility.scorePercent;

  // Determine colors based on level - semantic colors that work across themes
  const getGradientColors = () => {
    switch (compatibility.level) {
      case 'HIGH':
        return { stroke: '#22c55e', bg: 'from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10' };
      case 'MEDIUM':
        return { stroke: '#eab308', bg: 'from-yellow-50 to-amber-50 dark:from-yellow-500/10 dark:to-amber-500/10' };
      case 'LOW':
        return { stroke: '#ef4444', bg: 'from-red-50 to-orange-50 dark:from-red-500/10 dark:to-orange-500/10' };
      default:
        return { stroke: '#6b7280', bg: 'from-gray-50 to-slate-50 dark:from-gray-500/10 dark:to-slate-500/10' };
    }
  };

  const colors = getGradientColors();

  const isExpanded = !collapsible || expanded;

  return (
    <Card className={`overflow-hidden border-0 py-0 bg-gradient-to-br ${colors.bg}`}>
      <CardContent className="p-6">
          {/* Header */}
          <div
            className={`flex items-start justify-between ${isExpanded ? 'mb-6' : ''} ${collapsible ? 'cursor-pointer select-none' : ''}`}
            onClick={collapsible ? () => setExpanded(!expanded) : undefined}
          >
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold text-text-primary">
                {personalizedFor ? `Your Compatibility${partnerName ? ` with ${partnerName}` : ''}` : 'Compatibility'}
              </h3>
              <p className="text-sm text-text-muted">
                {isExpanded
                  ? 'How well your preferences align'
                  : `${percentage}% ${compatibility.level} • ${compatibility.comment?.slice(0, 60)}${(compatibility.comment?.length || 0) > 60 ? '...' : ''}`
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isExpanded && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRefresh();
                  }}
                  disabled={refreshing}
                  className="gap-1.5 text-text-muted hover:text-text-primary hover:bg-surface-hover"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                  >
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 16h5v5" />
                  </svg>
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
              )}
              {collapsible && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 text-text-muted hover:text-text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-5 w-5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </Button>
              )}
            </div>
          </div>

          {isExpanded && (
            <>
              {/* Main content */}
              <div className="flex items-center gap-8">
                {/* Circular gauge */}
                <div className="relative">
                  <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      className="stroke-border"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke={colors.stroke}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${(percentage / 100) * 327} 327`}
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold ${levelColor}`}>{percentage}%</span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                  {/* Level badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${levelBg} ${levelColor} border-current`}
                    >
                      {compatibility.level === 'HIGH' && (
                        <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="m9 11 3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {compatibility.level === 'MEDIUM' && (
                        <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 12h8" strokeLinecap="round" />
                        </svg>
                      )}
                      {compatibility.level === 'LOW' && (
                        <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="m15 9-6 6M9 9l6 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {compatibility.level}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {compatibility.comment}
                  </p>

                  {/* Progress indicators */}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${percentage >= 70 ? 'bg-green-500' : 'bg-border'}`} />
                      <span className="text-xs text-text-muted">70%+</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${percentage >= 40 && percentage < 70 ? 'bg-yellow-500' : 'bg-border'}`} />
                      <span className="text-xs text-text-muted">40-69%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${percentage < 40 ? 'bg-red-500' : 'bg-border'}`} />
                      <span className="text-xs text-text-muted">&lt;40%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Low compatibility tip */}
              {compatibility.level === 'LOW' && (
                <div className="mt-6 p-4 rounded-lg border flex items-start gap-3 bg-surface/60 border-amber-500/30 dark:bg-slate-900/40">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-500"
                  >
                    <path d="M12 2v8" />
                    <path d="m4.93 10.93 1.41 1.41" />
                    <path d="M2 18h2" />
                    <path d="M20 18h2" />
                    <path d="m19.07 10.93-1.41 1.41" />
                    <path d="M22 22H2" />
                    <path d="m8 22 4-10 4 10" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Need help finding common ground?</p>
                    <p className="text-sm mt-1 text-amber-600/80 dark:text-amber-300/80">
                      Ask the AI Co-pilot to suggest a compromise by typing &quot;AI, suggest a compromise&quot; in the chat.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
      </CardContent>
    </Card>
  );
}
