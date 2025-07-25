// src/store/usePavementStore.ts
// This file defines the main Zustand store, combining all state slices and middleware.

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';

// Import slice interfaces and creators from their respective files
import { type DataSlice, createDataSlice } from './slices/dataSlice';
import { type ThemeSlice, createThemeSlice } from './slices/themeSlice';
import { type AuthSlice, createAuthSlice } from './slices/authSlice';
import { type ParametersSlice, createParametersSlice } from './slices/parametersSlice';
import { type FiltersSlice, createFiltersSlice } from './slices/filtersSlice';
import { type CalculationsSlice, createCalculationsSlice } from './slices/calculationsSlice';

/**
 * The combined state type for the entire application.
 * We use an intersection of all slice types to create a single, unified state shape.
 */
export type StoreState = DataSlice &
  ThemeSlice &
  AuthSlice &
  ParametersSlice &
  FiltersSlice &
  CalculationsSlice;

// --- MAIN STORE CREATION ---

export const usePavementStore = create<StoreState>()(
  devtools(
    subscribeWithSelector(
      persist(
        (...a) => ({
          ...createDataSlice(...a),
          ...createThemeSlice(...a),
          ...createAuthSlice(...a),
          ...createParametersSlice(...a),
          ...createFiltersSlice(...a),
          ...createCalculationsSlice(...a),
        }),
        {
          name: 'pavement-dashboard-storage', // name of the item in the storage (must be unique)
          partialize: (state) => ({ themeMode: state.themeMode }), // only persist the theme slice
        }
      )
    )
  )
);

// --- REACTIVITY SETUP ---
// Subscribe to changes in parameters, costs, and filters to automatically recalculate

// Initial calculation when data is loaded
usePavementStore.subscribe(
  (state) => state.roadNetwork,
  (roadNetwork) => {
    if (roadNetwork.length > 0) {
      // Run calculations when road network data is loaded
      usePavementStore.getState().runCalculations();
    }
  }
);

// Recalculate when parameters change
usePavementStore.subscribe(
  (state) => state.parameters,
  () => {
    const state = usePavementStore.getState();
    if (state.roadNetwork.length > 0) {
      state.runCalculations();
    }
  }
);

// Recalculate when costs change
usePavementStore.subscribe(
  (state) => state.costs,
  () => {
    const state = usePavementStore.getState();
    if (state.roadNetwork.length > 0) {
      state.runCalculations();
    }
  }
);

// Recalculate when selected county changes
usePavementStore.subscribe(
  (state) => state.selectedCounty,
  () => {
    const state = usePavementStore.getState();
    if (state.roadNetwork.length > 0) {
      state.runCalculations();
    }
  }
);