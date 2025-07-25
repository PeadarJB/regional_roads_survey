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

/**
 * The combined state type for the entire application.
 * We use an intersection of all slice types to create a single, unified state shape.
 * This is the key fix that resolves the TypeScript errors.
 */
export type StoreState = DataSlice &
  ThemeSlice &
  AuthSlice &
  ParametersSlice &
  FiltersSlice;

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
        }),
        {
          name: 'pavement-dashboard-storage', // name of the item in the storage (must be unique)
          partialize: (state) => ({ themeMode: state.themeMode }), // only persist the theme slice
        }
      )
    )
  )
);
