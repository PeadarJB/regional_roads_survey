// src/store/slices/calculationsSlice.ts
// This slice manages the calculated maintenance data and provides actions to trigger recalculation.
// FIXED: Properly handle async calculations and removed missing imports.

import type { StateCreator } from 'zustand';
import type { StoreState } from '../usePavementStore';
import type { MaintenanceCategory } from '../../types';
import { FeatureLayerCalculator } from '../../utils/featureLayerCalculations';

export interface CalculationsSlice {
  // Calculation results
  categoryLengths: Record<MaintenanceCategory, number>;
  categoryCosts: Record<MaintenanceCategory, number>;
  totalLength: number;
  totalCost: number;

  // Actions
  runCalculations: () => Promise<void>;
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

export const createCalculationsSlice: StateCreator<
  StoreState,
  [],
  [],
  CalculationsSlice
> = (set, get) => ({
  ...initialCalculationState,

  runCalculations: async () => {
    const state = get();

    // Get required data from other slices
    const { roadNetworkLayer, parameters, costs, selectedCounty } = state;

    // Use Feature Layer for all calculations (Phase 2)
    if (roadNetworkLayer) {
      const calculator = new FeatureLayerCalculator(roadNetworkLayer);

      try {
        console.log('Running Feature Layer calculations...');
        const results = await calculator.calculateMaintenanceData(
          parameters,
          costs,
          selectedCounty
        );

        console.log('Feature Layer calculation results:', results);

        set({
          categoryLengths: results.categoryLengths,
          categoryCosts: results.categoryCosts,
          totalLength: results.totalLength,
          totalCost: results.totalCost
        });
      } catch (error) {
        console.error('Error calculating from Feature Layer:', error);
        // Set state to zero if calculations fail
        set(initialCalculationState);
      }
    } else {
      console.warn('Road network layer not available for calculations.');
      // Set state to zero if the layer isn't ready
      set(initialCalculationState);
    }
  }
});