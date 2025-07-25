// src/store/slices/filtersSlice.ts
// FIXED: Manually trigger calculations when county filter changes

import type { StateCreator } from 'zustand';
import type { StoreState } from '../usePavementStore';

export interface FiltersSlice {
  availableCounties: string[];
  selectedCounty: string | 'all';
  setAvailableCounties: (counties: string[]) => void;
  setSelectedCounty: (county: string) => void;
}

export const createFiltersSlice: StateCreator<StoreState, [], [], FiltersSlice> = (set, get) => ({
  availableCounties: [],
  selectedCounty: 'all',
  setAvailableCounties: (counties) => set({ availableCounties: counties }),
  setSelectedCounty: (county) => {
    set({ selectedCounty: county });
    // Manually trigger calculations after county filter changes
    const state = get();
    if (state.roadNetwork.length > 0) {
      state.runCalculations();
    }
  },
});