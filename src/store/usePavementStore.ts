// src/store/usePavementStore.ts
// This file defines the main Zustand store, combining all state slices and middleware.

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import type { RoadSegment, ThemeMode, User } from '../types'; // Adjust the import path as necessary

// --- TYPE DEFINITIONS FOR SLICES ---

export interface DataSlice {
  roadNetwork: RoadSegment[];
  loading: boolean;
  fetchRoadNetworkData: () => Promise<void>;
}

export interface ThemeSlice {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export interface AuthSlice {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

// Combined state type
export type StoreState = DataSlice & ThemeSlice & AuthSlice;

// --- SLICE CREATORS ---

const createDataSlice: StateCreator<StoreState, [], [], DataSlice> = (set) => ({
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
      set({ roadNetwork: data, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },
});

const createThemeSlice: StateCreator<StoreState, [], [], ThemeSlice> = (set) => ({
  themeMode: 'light',
  setThemeMode: (mode) => set({ themeMode: mode }),
});

const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (set) => ({
  isAuthenticated: false,
  user: null,
  login: (user) => set({ isAuthenticated: true, user }),
  logout: () => set({ isAuthenticated: false, user: null }),
});

// --- MAIN STORE CREATION ---

export const usePavementStore = create<StoreState>()(
  devtools(
    subscribeWithSelector(
      persist(
        (...a) => ({
          ...createDataSlice(...a),
          ...createThemeSlice(...a),
          ...createAuthSlice(...a),
        }),
        {
          name: 'pavement-dashboard-storage', // name of the item in the storage (must be unique)
          partialize: (state) => ({ themeMode: state.themeMode }), // only persist the theme slice
        }
      )
    )
  )
);
