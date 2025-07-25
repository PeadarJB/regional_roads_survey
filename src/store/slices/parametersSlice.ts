// src/store/slices/parametersSlice.ts
// This slice manages the state for user-adjustable maintenance parameters and costs.

import type { StateCreator } from 'zustand';
import type { StoreState } from '../usePavementStore';
import type { MaintenanceParameters, CostInputs } from '../../types';
import { DEFAULT_MAINTENANCE_PARAMETERS, DEFAULT_COST_INPUTS } from '../../config/constants';

export interface ParametersSlice {
  parameters: MaintenanceParameters;
  costs: CostInputs;
  setParameters: (newParams: Partial<MaintenanceParameters>) => void;
  setCosts: (newCosts: Partial<CostInputs>) => void;
}

// By using `(set, get)` we can avoid potential circular dependency issues with TypeScript's type inference.
// `get()` allows us to access the current state within our actions, ensuring types are resolved correctly.
export const createParametersSlice: StateCreator<StoreState, [], [], ParametersSlice> = (set, get) => ({
  parameters: DEFAULT_MAINTENANCE_PARAMETERS,
  costs: DEFAULT_COST_INPUTS,
  setParameters: (newParams) =>
    set({
      parameters: { ...get().parameters, ...newParams },
    }),
  setCosts: (newCosts) =>
    set({
      costs: { ...get().costs, ...newCosts },
    }),
});
