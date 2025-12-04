'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WeightSelector } from './WeightSelector';
import {
  type SearchCriteria,
  type CriteriaWeights,
  type CriteriaWeight,
  type Feature,
  FEATURES,
  FEATURE_LABELS,
  CATEGORIES,
  DEFAULT_CRITERIA,
} from '@/lib/types';
import { isHomegateTheme } from '@/lib/theme';

interface CriteriaFormProps {
  initialCriteria?: SearchCriteria;
  initialWeights?: CriteriaWeights;
  onSubmit: (criteria: SearchCriteria, weights: CriteriaWeights) => void;
  submitLabel?: string;
  showWeights?: boolean;
  loading?: boolean;
}

export function CriteriaForm({
  initialCriteria = DEFAULT_CRITERIA,
  initialWeights = {},
  onSubmit,
  submitLabel = 'Save Criteria',
  showWeights = true,
  loading = false,
}: CriteriaFormProps) {
  const [criteria, setCriteria] = useState<SearchCriteria>(initialCriteria);
  const [weights, setWeights] = useState<CriteriaWeights>(initialWeights);

  const updateCriteria = <K extends keyof SearchCriteria>(
    key: K,
    value: SearchCriteria[K]
  ) => {
    setCriteria((prev) => ({ ...prev, [key]: value }));
  };

  const updateWeight = (key: keyof SearchCriteria, weight: CriteriaWeight | undefined) => {
    setWeights((prev) => {
      if (weight === undefined) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: weight };
    });
  };

  const updateFeatureWeight = (feature: Feature, weight: CriteriaWeight | undefined) => {
    setWeights((prev) => {
      const currentFeatureWeights = prev.featureWeights || {};
      if (weight === undefined) {
        const { [feature]: _, ...rest } = currentFeatureWeights;
        return { ...prev, featureWeights: Object.keys(rest).length > 0 ? rest : undefined };
      }
      return { ...prev, featureWeights: { ...currentFeatureWeights, [feature]: weight } };
    });
  };

  const toggleFeature = (feature: Feature) => {
    const currentFeatures = criteria.features || [];
    const isRemoving = currentFeatures.includes(feature);
    const newFeatures = isRemoving
      ? currentFeatures.filter((f) => f !== feature)
      : [...currentFeatures, feature];
    updateCriteria('features', newFeatures);
    // Clear weight when unchecking
    if (isRemoving) {
      updateFeatureWeight(feature, undefined);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(criteria, weights);
  };

  const hg = isHomegateTheme();
  const labelClass = hg ? 'text-gray-700' : 'text-slate-300';
  const mutedLabelClass = hg ? 'text-gray-500' : 'text-slate-400';
  const inputClass = hg
    ? 'bg-white border-gray-300 text-gray-900'
    : 'bg-slate-800/50 border-slate-700 text-white';
  const selectTriggerClass = hg
    ? 'bg-white border-gray-300 text-gray-900'
    : 'bg-slate-800/50 border-slate-700 text-white';
  const featureBoxClass = hg
    ? 'bg-gray-50 border-gray-200'
    : 'bg-slate-800/30 border-slate-700/50';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Location */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="location" className={labelClass}>
              Location
            </Label>
            {showWeights && (
              <WeightSelector
                value={weights.location}
                onChange={(w) => updateWeight('location', w)}
              />
            )}
          </div>
          <Input
            id="location"
            placeholder="e.g., Fribourg, Zürich"
            value={criteria.location || ''}
            onChange={(e) => updateCriteria('location', e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="radius" className={labelClass}>
            Radius (km)
          </Label>
          <Input
            id="radius"
            type="number"
            min={0}
            max={100}
            placeholder="e.g., 10"
            value={criteria.radius || ''}
            onChange={(e) =>
              updateCriteria('radius', e.target.value ? Number(e.target.value) : undefined)
            }
            className={inputClass}
          />
        </div>
      </div>

      {/* Offer Type & Category */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className={labelClass}>Offer Type</Label>
          <Select
            value={criteria.offerType}
            onValueChange={(v) => updateCriteria('offerType', v as 'buy' | 'rent')}
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className={labelClass}>Category</Label>
          <Select
            value={criteria.category || '__any__'}
            onValueChange={(v) => updateCriteria('category', v === '__any__' ? undefined : v as typeof CATEGORIES[number])}
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="Any category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__any__">Any category</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className={labelClass}>Price Range (CHF)</Label>
          {showWeights && (
            <WeightSelector
              value={weights.priceTo}
              onChange={(w) => {
                updateWeight('priceFrom', w);
                updateWeight('priceTo', w);
              }}
            />
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            type="number"
            min={0}
            placeholder="From"
            value={criteria.priceFrom || ''}
            onChange={(e) =>
              updateCriteria('priceFrom', e.target.value ? Number(e.target.value) : undefined)
            }
            className={inputClass}
          />
          <Input
            type="number"
            min={0}
            placeholder="To"
            value={criteria.priceTo || ''}
            onChange={(e) =>
              updateCriteria('priceTo', e.target.value ? Number(e.target.value) : undefined)
            }
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Checkbox
            id="onlyWithPrice"
            checked={criteria.onlyWithPrice || false}
            onCheckedChange={(checked) =>
              updateCriteria('onlyWithPrice', checked as boolean)
            }
          />
          <Label htmlFor="onlyWithPrice" className={`text-sm ${mutedLabelClass}`}>
            Only listings with price
          </Label>
        </div>
      </div>

      {/* Rooms */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className={labelClass}>Rooms</Label>
          {showWeights && (
            <WeightSelector
              value={weights.roomsTo}
              onChange={(w) => {
                updateWeight('roomsFrom', w);
                updateWeight('roomsTo', w);
              }}
            />
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            type="number"
            min={0}
            step={0.5}
            placeholder="From"
            value={criteria.roomsFrom || ''}
            onChange={(e) =>
              updateCriteria('roomsFrom', e.target.value ? Number(e.target.value) : undefined)
            }
            className={inputClass}
          />
          <Input
            type="number"
            min={0}
            step={0.5}
            placeholder="To"
            value={criteria.roomsTo || ''}
            onChange={(e) =>
              updateCriteria('roomsTo', e.target.value ? Number(e.target.value) : undefined)
            }
            className={inputClass}
          />
        </div>
      </div>

      {/* Living Space */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className={labelClass}>Living Space (m²)</Label>
          {showWeights && (
            <WeightSelector
              value={weights.livingSpaceTo}
              onChange={(w) => {
                updateWeight('livingSpaceFrom', w);
                updateWeight('livingSpaceTo', w);
              }}
            />
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            type="number"
            min={0}
            placeholder="From"
            value={criteria.livingSpaceFrom || ''}
            onChange={(e) =>
              updateCriteria(
                'livingSpaceFrom',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className={inputClass}
          />
          <Input
            type="number"
            min={0}
            placeholder="To"
            value={criteria.livingSpaceTo || ''}
            onChange={(e) =>
              updateCriteria(
                'livingSpaceTo',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className={inputClass}
          />
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <Label className={labelClass}>Features & Furnishings</Label>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 p-4 rounded-lg border ${featureBoxClass}`}>
          {FEATURES.map((feature) => {
            const isChecked = criteria.features?.includes(feature) || false;
            return (
              <div
                key={feature}
                className="flex items-center justify-between gap-2 py-1"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={feature}
                    checked={isChecked}
                    onCheckedChange={() => toggleFeature(feature)}
                  />
                  <Label
                    htmlFor={feature}
                    className={`text-sm cursor-pointer ${mutedLabelClass}`}
                  >
                    {FEATURE_LABELS[feature]}
                  </Label>
                </div>
                {showWeights && isChecked && (
                  <WeightSelector
                    value={weights.featureWeights?.[feature]}
                    onChange={(w) => updateFeatureWeight(feature, w)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Free Text */}
      <div className="space-y-2">
        <Label htmlFor="freeText" className={labelClass}>
          Free-text Search
        </Label>
        <Input
          id="freeText"
          placeholder="Additional keywords..."
          value={criteria.freeText || ''}
          onChange={(e) => updateCriteria('freeText', e.target.value)}
          className={inputClass}
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className={`w-full ${
          hg
            ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white'
            : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700'
        }`}
      >
        {loading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}

