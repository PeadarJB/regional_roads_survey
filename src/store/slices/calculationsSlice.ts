// src/store/slices/calculationsSlice.ts
// This slice manages the calculated maintenance data and provides actions to trigger recalculation.

import type { StateCreator } from 'zustand';
import type { StoreState } from '../usePavementStore';
import type { MaintenanceCategory } from '../../types';
import { calculateMaintenanceData } from '../../utils/calculations';

export interface CalculationsSlice {
  // Calculation results
  categoryLengths: Record<MaintenanceCategory, number>;
  categoryCosts: Record<MaintenanceCategory, number>;
  totalLength: number;
  totalCost: number;
  
  // Actions
  runCalculations: () => void;
}

const initialCalculationState: Omit<CalculationsSlice, 'runCalculations'> = {
  categoryLengths: {
    'Road Reconstruction': 0,
    'Structural Overlay': 0,
    'Surface Restoration': 0,
    'Restoration of Skid Resistance': 0,
    'Routine Maintenance': 0
  },
  categoryCosts: {
    'Road Reconstruction': 0,
    'Structural Overlay': 0,
    'Surface Restoration': 0,
    'Restoration of Skid Resistance': 0,
    'Routine Maintenance': 0
  },
  totalLength: 0,
  totalCost: 0
};

export const createCalculationsSlice: StateCreator<StoreState, [], [], CalculationsSlice> = (set, get) => ({
  ...initialCalculationState,
  
  runCalculations: () => {
    const state = get();
    
    // Get required data from other slices
    const { roadNetwork } = state;
    const { parameters } = state;
    const { costs } = state;
    const { selectedCounty } = state;
    
    // Skip calculation if we don't have road network data yet
    if (roadNetwork.length === 0) {
      return;
    }
    
    // Run the calculation
    const results = calculateMaintenanceData(
      roadNetwork,
      parameters,
      costs,
      selectedCounty
    );
    
    // Update the store with calculated results
    set({
      categoryLengths: results.categoryLengths,
      categoryCosts: results.categoryCosts,
      totalLength: results.totalLength,
      totalCost: results.totalCost
    });
  }
});