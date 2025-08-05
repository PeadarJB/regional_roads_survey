// src/store/slices/filtersSlice.ts
// UPDATED: Support for multi-select counties

import type { StateCreator } from 'zustand';
import type { StoreState } from '../usePavementStore';

export interface FiltersSlice {
  availableCounties: string[];
  selectedCounty: string | 'all' | string[]; // Now supports array for multi-select
  
  setAvailableCounties: (counties: string[]) => void;
  setSelectedCounty: (county: string | 'all' | string[]) => void;
  toggleCounty: (county: string) => void; // New method for toggling individual counties
  selectAllCounties: () => void; // New method for selecting all
  clearCountySelection: () => void; // New method for clearing selection
}

export const createFiltersSlice: StateCreator<StoreState, [], [], FiltersSlice> = (set, get) => ({
  availableCounties: [],
  selectedCounty: 'all',
  
  setAvailableCounties: (counties) => {
    set({ availableCounties: counties });
    console.log('Available counties set:', counties);
  },
  
  setSelectedCounty: (county) => {
    set({ selectedCounty: county });
    // Manually trigger calculations after county filter changes
    const state = get();
    if (state.roadNetwork.length > 0 || state.roadNetworkLayer) {
      state.runCalculations();
    }
  },
  
  toggleCounty: (county) => {
    const state = get();
    const current = state.selectedCounty;
    
    // If currently 'all', start with empty array
    if (current === 'all') {
      set({ selectedCounty: [county] });
    }
    // If it's a string (single selection), convert to array
    else if (typeof current === 'string') {
      set({ selectedCounty: [current, county] });
    }
    // If it's an array, toggle the county
    else if (Array.isArray(current)) {
      const index = current.indexOf(county);
      let newSelection: string[] | 'all';
      
      if (index > -1) {
        // County is selected, remove it
        newSelection = current.filter(c => c !== county);
        // If no counties selected, revert to 'all'
        if (newSelection.length === 0) {
          newSelection = 'all';
        }
      } else {
        // County is not selected, add it
        newSelection = [...current, county];
        // If all counties are selected, switch to 'all'
        if (newSelection.length === state.availableCounties.length) {
          newSelection = 'all';
        }
      }
      
      set({ selectedCounty: newSelection });
    }
    
    // Trigger calculations
    const updatedState = get();
    if (updatedState.roadNetwork.length > 0 || updatedState.roadNetworkLayer) {
      updatedState.runCalculations();
    }
  },
  
  selectAllCounties: () => {
    set({ selectedCounty: 'all' });
    // Trigger calculations
    const state = get();
    if (state.roadNetwork.length > 0 || state.roadNetworkLayer) {
      state.runCalculations();
    }
  },
  
  clearCountySelection: () => {
    set({ selectedCounty: [] });
    // Trigger calculations
    const state = get();
    if (state.roadNetwork.length > 0 || state.roadNetworkLayer) {
      state.runCalculations();
    }
  }
});