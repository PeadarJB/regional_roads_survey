// src/store/slices/filtersSlice.ts
// This slice manages the state for dashboard filters, such as the selected county.

import type { StateCreator } from 'zustand';
import type { StoreState } from '../usePavementStore';

export interface FiltersSlice {
  availableCounties: string[];
  selectedCounty: string | 'all';
  setAvailableCounties: (counties: string[]) => void;
  setSelectedCounty: (county: string) => void;
}

export const createFiltersSlice: StateCreator<StoreState, [], [], FiltersSlice> = (set) => ({
  availableCounties: [],
  selectedCounty: 'all',
  setAvailableCounties: (counties) => set({ availableCounties: counties }),
  setSelectedCounty: (county) => set({ selectedCounty: county }),
});
