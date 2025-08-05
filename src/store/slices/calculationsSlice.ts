// src/store/slices/calculationsSlice.ts
// This slice manages the calculated maintenance data and provides actions to trigger recalculation.

import type { StateCreator } from 'zustand';
import type { StoreState } from '../usePavementStore';
import type { MaintenanceCategory } from '../../types';
import { calculateMaintenanceData } from '../../utils/calculations';
import { FeatureLayerCalculator } from '../../utils/featureLayerCalculations';

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
  
  runCalculations: async () => {
    const state = get();
    
    // Get required data from other slices
    const { roadNetwork, roadNetworkLayer, parameters, costs, selectedCounty } = state;
    
    // If Feature Layer is available, use it for calculations
    if (roadNetworkLayer) {
      const calculator = new FeatureLayerCalculator(roadNetworkLayer);
      
      try {
        const results = await calculator.calculateMaintenanceData(
          parameters,
          costs,
          selectedCounty
        );
        
        set({
          categoryLengths: results.categoryLengths,
          categoryCosts: results.categoryCosts,
          totalLength: results.totalLength,
          totalCost: results.totalCost
        });
      } catch (error) {
        console.error('Error calculating from Feature Layer:', error);
        // Fallback to static data if needed
        if (roadNetwork.length > 0) {
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
      }
    } else if (roadNetwork.length > 0) {
        // Existing static data calculation logic
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
  }
});