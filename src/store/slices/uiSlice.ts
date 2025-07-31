// src/store/slices/uiSlice.ts
// This slice manages UI-specific state including mobile view detection and report generation status.

import type { StateCreator } from 'zustand';
import type { StoreState } from '../usePavementStore';

export interface UISlice {
  // Mobile view state
  isMobileView: boolean;
  isParameterDrawerOpen: boolean;
  activeMobileTab: 'map' | 'charts';
  
  // Report generation state
  isGeneratingReport: boolean;
  
  // Actions
  setIsMobileView: (isMobile: boolean) => void;
  toggleParameterDrawer: () => void;
  setParameterDrawerOpen: (isOpen: boolean) => void;
  setActiveMobileTab: (tab: 'map' | 'charts') => void;
  setIsGeneratingReport: (isGenerating: boolean) => void;
}

export const createUISlice: StateCreator<StoreState, [], [], UISlice> = (set) => ({
  isMobileView: false,
  isParameterDrawerOpen: false,
  activeMobileTab: 'map',
  isGeneratingReport: false, // Add the initial state
  
  setIsMobileView: (isMobile) => set({ isMobileView: isMobile }),
  toggleParameterDrawer: () => set((state) => ({ isParameterDrawerOpen: !state.isParameterDrawerOpen })),
  setParameterDrawerOpen: (isOpen) => set({ isParameterDrawerOpen: isOpen }),
  setActiveMobileTab: (tab) => set({ activeMobileTab: tab }),
  setIsGeneratingReport: (isGenerating) => set({ isGeneratingReport: isGenerating }), // Add the action implementation
});
