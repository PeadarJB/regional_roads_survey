// src/store/slices/themeSlice.ts
// This slice manages the state for the application's theme.

import type { StateCreator } from 'zustand';
import type { StoreState } from '../usePavementStore';
import type { ThemeMode } from '../../types';

export interface ThemeSlice {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const createThemeSlice: StateCreator<StoreState, [], [], ThemeSlice> = (set) => ({
  themeMode: 'light',
  setThemeMode: (mode) => set({ themeMode: mode }),
});
