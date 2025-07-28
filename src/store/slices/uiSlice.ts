// src/store/slices/uiSlice.ts
// This slice manages UI-specific state including mobile view detection

import type { StateCreator } from 'zustand';
import type { StoreState } from '../usePavementStore';

export interface UISlice {
  // Mobile view state
  isMobileView: boolean;
  isParameterDrawerOpen: boolean;
  activeMobileTab: 'map' | 'charts';
  
  // Actions
  setIsMobileView: (isMobile: boolean) => void;
  toggleParameterDrawer: () => void;
  setParameterDrawerOpen: (isOpen: boolean) => void;
  setActiveMobileTab: (tab: 'map' | 'charts') => void;
}

export const createUISlice: StateCreator<StoreState, [], [], UISlice> = (set) => ({
  isMobileView: false,
  isParameterDrawerOpen: false,
  activeMobileTab: 'map',
  
  setIsMobileView: (isMobile) => set({ isMobileView: isMobile }),
  toggleParameterDrawer: () => set((state) => ({ isParameterDrawerOpen: !state.isParameterDrawerOpen })),
  setParameterDrawerOpen: (isOpen) => set({ isParameterDrawerOpen: isOpen }),
  setActiveMobileTab: (tab) => set({ activeMobileTab: tab }),
});