// src/config/constants.ts
// This file centralizes the default values for the application's state.

import type { MaintenanceParameters, CostInputs } from '../types';

/**
 * Default values for the maintenance parameters, based on the original Tableau dashboard.
 * These values define the thresholds for categorizing road segments.
 */
export const DEFAULT_MAINTENANCE_PARAMETERS: MaintenanceParameters = {
  // Road Reconstruction
  roadReconstruction_iri: 12,
  roadReconstruction_rut: 40,
  roadReconstruction_psci: 2,

  // Structural Overlay
  structuralOverlay_iri: 7,
  structuralOverlay_rut: 20,
  structuralOverlay_psci: 4,

  // Surface Restoration
  surfaceRestoration_psci_a: 5,
  surfaceRestoration_psci_b: 6,
  surfaceRestoration_iri: 6,
  surfaceRestoration_psci_c: 7,

  // Restoration of Skid Resistance
  restorationOfSkidResistance_psci_a: 7,
  restorationOfSkidResistance_psci_b: 8,
  restorationOfSkidResistance_csc: 0.35, // Coefficient of Surface Condition
  restorationOfSkidResistance_psci_c: 9,
  restorationOfSkidResistance_mpd: 0.7 // Minimum Pavement Depth
};

/**
 * Default values for the cost inputs in Euros per square meter (€/sqm).
 */
export const DEFAULT_COST_INPUTS: CostInputs = {
  rr: 60, // Road Reconstruction
  so: 40, // Structural Overlay
  sr: 15, // Surface Restoration
  rs: 5,  // Restoration of Skid Resistance
  rm: 1,  // Routine Maintenance
};
