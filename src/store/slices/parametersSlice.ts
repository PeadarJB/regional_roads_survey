// src/store/slices/parametersSlice.ts
// FIXED: Manually trigger calculations when parameters or costs change
// UPDATED: Added reset functions

import type { StateCreator } from 'zustand';
import type { StoreState } from '../usePavementStore';
import type { MaintenanceParameters, CostInputs } from '../../types';
import { DEFAULT_MAINTENANCE_PARAMETERS, DEFAULT_COST_INPUTS } from '../../config/constants';

export interface ParametersSlice {
  parameters: MaintenanceParameters;
  costs: CostInputs;
  setParameters: (newParams: Partial<MaintenanceParameters>) => void;
  setCosts: (newCosts: Partial<CostInputs>) => void;
  resetParameters: () => void;
  resetCosts: () => void;
}

export const createParametersSlice: StateCreator<StoreState, [], [], ParametersSlice> = (set, get) => ({
  parameters: DEFAULT_MAINTENANCE_PARAMETERS,
  costs: DEFAULT_COST_INPUTS,
  setParameters: (newParams) => {
    set({
      parameters: { ...get().parameters, ...newParams },
    });
    // Manually trigger calculations after parameters change
    const state = get();
    if (state.roadNetwork.length > 0) {
      state.runCalculations();
    }
  },
  setCosts: (newCosts) => {
    set({
      costs: { ...get().costs, ...newCosts },
    });
    // Manually trigger calculations after costs change
    const state = get();
    if (state.roadNetwork.length > 0) {
      state.runCalculations();
    }
  },
  resetParameters: () => {
    set({ parameters: DEFAULT_MAINTENANCE_PARAMETERS });
    // Trigger calculations after reset
    const state = get();
    if (state.roadNetwork.length > 0) {
      state.runCalculations();
    }
  },
  resetCosts: () => {
    set({ costs: DEFAULT_COST_INPUTS });
    // Trigger calculations after reset
    const state = get();
    if (state.roadNetwork.length > 0) {
      state.runCalculations();
    }
  },
});