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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Location */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="location" className="text-slate-300">
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
            className="bg-slate-800/50 border-slate-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="radius" className="text-slate-300">
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
            className="bg-slate-800/50 border-slate-700 text-white"
          />
        </div>
      </div>

      {/* Offer Type & Category */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-slate-300">Offer Type</Label>
          <Select
            value={criteria.offerType}
            onValueChange={(v) => updateCriteria('offerType', v as 'buy' | 'rent')}
          >
            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300">Category</Label>
          <Select
            value={criteria.category || '__any__'}
            onValueChange={(v) => updateCriteria('category', v === '__any__' ? undefined : v as typeof CATEGORIES[number])}
          >
            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
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
          <Label className="text-slate-300">Price Range (CHF)</Label>
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
            className="bg-slate-800/50 border-slate-700 text-white"
          />
          <Input
            type="number"
            min={0}
            placeholder="To"
            value={criteria.priceTo || ''}
            onChange={(e) =>
              updateCriteria('priceTo', e.target.value ? Number(e.target.value) : undefined)
            }
            className="bg-slate-800/50 border-slate-700 text-white"
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
          <Label htmlFor="onlyWithPrice" className="text-sm text-slate-400">
            Only listings with price
          </Label>
        </div>
      </div>

      {/* Rooms */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-slate-300">Rooms</Label>
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
            className="bg-slate-800/50 border-slate-700 text-white"
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
            className="bg-slate-800/50 border-slate-700 text-white"
          />
        </div>
      </div>

      {/* Living Space */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-slate-300">Living Space (m²)</Label>
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
            className="bg-slate-800/50 border-slate-700 text-white"
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
            className="bg-slate-800/50 border-slate-700 text-white"
          />
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <Label className="text-slate-300">Features & Furnishings</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
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
                    className="text-sm text-slate-400 cursor-pointer"
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
        <Label htmlFor="freeText" className="text-slate-300">
          Free-text Search
        </Label>
        <Input
          id="freeText"
          placeholder="Additional keywords..."
          value={criteria.freeText || ''}
          onChange={(e) => updateCriteria('freeText', e.target.value)}
          className="bg-slate-800/50 border-slate-700 text-white"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
      >
        {loading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}

