'use client';

import { createContext, useContext } from 'react';
import type { RoomWithMembers, User, Activity } from '@/lib/types';

export interface RoomContextValue {
  room: RoomWithMembers | null;
  user: User | null;
  activities: Activity[];
  refreshRoom: () => Promise<void>;
  refreshActivities: () => Promise<void>;
}

export interface ListingContext {
  listingId: string;
  title: string;
  price?: number;
  location: string;
  imageUrl?: string;
}

export const RoomContext = createContext<RoomContextValue>({
  room: null,
  user: null,
  activities: [],
  refreshRoom: async () => {},
  refreshActivities: async () => {},
});

export const useRoom = () => useContext(RoomContext);
