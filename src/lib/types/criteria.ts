export type CriteriaWeight = 1 | 2 | 3 | 4 | 5;
export type CriteriaSource = 'manual' | 'ai_proposed';
export type CombineMode = 'all' | 'mixed' | 'strict';

export const FEATURES = [
  'balcony',
  'terrace',
  'elevator',
  'wheelchair_access',
  'parking',
  'garage',
  'minergie',
  'new_building',
  'old_building',
  'swimming_pool',
] as const;

export type Feature = (typeof FEATURES)[number];

export const FEATURE_LABELS: Record<Feature, string> = {
  balcony: 'Balcony',
  terrace: 'Terrace',
  elevator: 'Elevator',
  wheelchair_access: 'Wheelchair Access',
  parking: 'Parking Space',
  garage: 'Garage',
  minergie: 'Minergie',
  new_building: 'New Building',
  old_building: 'Old Building',
  swimming_pool: 'Swimming Pool',
};

export const CATEGORIES = [
  'apartment',
  'house',
  'plot',
  'parking',
  'commercial',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface SearchCriteria {
  location?: string;
  radius?: number; // in km
  offerType: 'buy' | 'rent';
  category?: Category;
  priceFrom?: number;
  priceTo?: number;
  onlyWithPrice?: boolean;
  roomsFrom?: number;
  roomsTo?: number;
  livingSpaceFrom?: number; // m²
  livingSpaceTo?: number;
  yearBuiltFrom?: number;
  yearBuiltTo?: number;
  lotSizeFrom?: number; // m²
  lotSizeTo?: number;
  floor?: number;
  availability?: string;
  freeText?: string;
  features?: Feature[];
}

export type FeatureWeights = Partial<Record<Feature, CriteriaWeight>>;

export type CriteriaWeights = Partial<Record<keyof SearchCriteria, CriteriaWeight>> & {
  featureWeights?: FeatureWeights;
};

export interface UserCriteria {
  roomId: string;
  userId: string;
  timestamp: string;
  criteria: SearchCriteria;
  weights: CriteriaWeights;
  source: CriteriaSource;
}

export interface CombinedCriteria {
  roomId: string;
  timestamp: string;
  criteria: SearchCriteria;
  weights: CriteriaWeights;
  fromUserIds: string[];
  combineMode: CombineMode;
}

export const DEFAULT_CRITERIA: SearchCriteria = {
  offerType: 'buy',
  onlyWithPrice: true,
};

