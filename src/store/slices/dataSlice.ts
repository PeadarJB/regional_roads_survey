// src/store/slices/dataSlice.ts
// FIXED: Manually trigger calculations after data fetch instead of using subscriptions

import type { StateCreator } from 'zustand';
import type { StoreState } from '../usePavementStore';
import type { RoadSegment } from '../../types';

export interface DataSlice {
  roadNetwork: RoadSegment[];
  loading: boolean;
  fetchRoadNetworkData: () => Promise<void>;
}

export const createDataSlice: StateCreator<StoreState, [], [], DataSlice> = (set, get) => ({
  roadNetwork: [],
  loading: false,
  fetchRoadNetworkData: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/data/staticData.json');
      if (!response.ok) {
        throw new Error('Failed to fetch road network data.');
      }
      const data: RoadSegment[] = await response.json();
      
      // Extract unique county names and populate the filter slice
      const uniqueCounties = [...new Set(data.map(segment => segment.county))].sort();
      get().setAvailableCounties(uniqueCounties);

      set({ roadNetwork: data, loading: false });
      
      // Manually trigger calculations after data is loaded
      get().runCalculations();
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },
});