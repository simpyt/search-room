export type CompatibilityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CompatibilitySnapshot {
  roomId: string;
  timestamp: string;
  scorePercent: number;
  level: CompatibilityLevel;
  comment: string;
  criteriaRefs: string[];
}

export function getCompatibilityLevel(scorePercent: number): CompatibilityLevel {
  if (scorePercent < 40) return 'LOW';
  if (scorePercent <= 75) return 'MEDIUM';
  return 'HIGH';
}

export const COMPATIBILITY_LEVEL_COLORS: Record<CompatibilityLevel, string> = {
  LOW: 'text-red-500',
  MEDIUM: 'text-yellow-500',
  HIGH: 'text-green-500',
};

export const COMPATIBILITY_LEVEL_BG: Record<CompatibilityLevel, string> = {
  LOW: 'bg-red-500/10 border-red-500/20',
  MEDIUM: 'bg-yellow-500/10 border-yellow-500/20',
  HIGH: 'bg-green-500/10 border-green-500/20',
};

