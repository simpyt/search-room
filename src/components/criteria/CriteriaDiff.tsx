'use client';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { UserCriteria, CombinedCriteria, SearchCriteria } from '@/lib/types';
import { USERS, FEATURE_LABELS, type Feature } from '@/lib/types';
import { isHomegateTheme } from '@/lib/theme';

interface CriteriaDiffProps {
  usersCriteria: Record<string, UserCriteria | null>;
  combinedCriteria: CombinedCriteria | null;
}

interface CriteriaRow {
  field: string;
  label: string;
  values: Record<string, string>;
  hasDiff: boolean;
}

function formatValue(value: unknown, field: string): string {
  if (value === undefined || value === null || value === '') return '-';

  if (field === 'features' && Array.isArray(value)) {
    return value
      .map((f) => FEATURE_LABELS[f as Feature] || f)
      .join(', ') || '-';
  }

  if (field.includes('price') || field.includes('Price')) {
    return `CHF ${Number(value).toLocaleString()}`;
  }

  if (field.includes('Space') || field.includes('Size')) {
    return `${value} m²`;
  }

  if (field === 'radius') {
    return `${value} km`;
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}

function getCriteriaRows(
  usersCriteria: Record<string, UserCriteria | null>,
  combinedCriteria: CombinedCriteria | null
): CriteriaRow[] {
  const fields: { key: keyof SearchCriteria; label: string }[] = [
    { key: 'location', label: 'Location' },
    { key: 'radius', label: 'Radius' },
    { key: 'offerType', label: 'Offer Type' },
    { key: 'category', label: 'Category' },
    { key: 'priceFrom', label: 'Price From' },
    { key: 'priceTo', label: 'Price To' },
    { key: 'roomsFrom', label: 'Rooms From' },
    { key: 'roomsTo', label: 'Rooms To' },
    { key: 'livingSpaceFrom', label: 'Living Space From' },
    { key: 'livingSpaceTo', label: 'Living Space To' },
    { key: 'features', label: 'Features' },
  ];

  const userIds = Object.keys(usersCriteria);

  return fields.map(({ key, label }) => {
    const values: Record<string, string> = {};

    for (const userId of userIds) {
      const criteria = usersCriteria[userId]?.criteria;
      values[userId] = formatValue(criteria?.[key], key);
    }

    values['combined'] = combinedCriteria
      ? formatValue(combinedCriteria.criteria[key], key)
      : '-';

    // Check if there's a difference
    const uniqueValues = new Set(Object.values(values).filter((v) => v !== '-'));
    const hasDiff = uniqueValues.size > 1;

    return { field: key, label, values, hasDiff };
  });
}

export function CriteriaDiff({ usersCriteria, combinedCriteria }: CriteriaDiffProps) {
  const hg = isHomegateTheme();
  const userIds = Object.keys(usersCriteria);
  const rows = getCriteriaRows(usersCriteria, combinedCriteria);

  if (userIds.length === 0) {
    return (
      <div className={`text-center py-8 ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
        No criteria set yet. Use the form below or ask AI to generate criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className={`border-b ${hg ? 'border-gray-200' : 'border-slate-700/50'}`}>
            <th className={`px-4 py-3 text-left text-sm font-medium ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
              Criteria
            </th>
            {userIds.map((userId) => {
              const user = USERS[userId];
              return (
                <th key={userId} className="px-4 py-3 text-left">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback
                        style={{ backgroundColor: user?.avatarColor }}
                        className="text-xs text-white"
                      >
                        {user?.name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`text-sm font-medium ${hg ? 'text-gray-900' : 'text-white'}`}>
                      {user?.name || userId}
                    </span>
                  </div>
                </th>
              );
            })}
            <th className="px-4 py-3 text-left">
              <Badge variant="outline" className={
                hg
                  ? 'bg-[#e5007d]/10 border-[#e5007d]/30 text-[#e5007d]'
                  : 'bg-sky-500/10 border-sky-500/30 text-sky-400'
              }>
                Combined
              </Badge>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.field}
              className={`border-b ${hg ? 'border-gray-100' : 'border-slate-800/50'} ${
                row.hasDiff ? (hg ? 'bg-amber-50' : 'bg-amber-500/5') : ''
              }`}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${hg ? 'text-gray-600' : 'text-slate-300'}`}>{row.label}</span>
                  {row.hasDiff && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        hg
                          ? 'border-amber-300 text-amber-600'
                          : 'border-amber-500/30 text-amber-400'
                      }`}
                    >
                      Differs
                    </Badge>
                  )}
                </div>
              </td>
              {userIds.map((userId) => {
                const weight = usersCriteria[userId]?.weights[row.field as keyof SearchCriteria];
                return (
                  <td key={userId} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${hg ? 'text-gray-900' : 'text-white'}`}>{row.values[userId]}</span>
                      {weight && (
                        <span className={`text-xs ${hg ? 'text-amber-500' : 'text-amber-400'}`}>
                          {'★'.repeat(weight === 5 ? 3 : weight === 3 ? 2 : 1)}
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
              <td className="px-4 py-3">
                <span className={`text-sm ${hg ? 'text-[#e5007d]' : 'text-sky-400'}`}>{row.values['combined']}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

