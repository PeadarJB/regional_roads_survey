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

// Road specifications
export const ROAD_SPECIFICATIONS = {
  STANDARD_WIDTH: 7.5, // meters
  SEGMENT_LENGTH: 100, // meters (fixed length per segment)
} as const;

// Map configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [-8.2439, 53.4129] as [number, number], // Ireland center
  DEFAULT_ZOOM: 7,
  MIN_ZOOM: 6,
  MAX_ZOOM: 18,
} as const;

// Feature Layer configuration
export const FEATURE_LAYER_CONFIG = {
  URL: 'https://services-eu1.arcgis.com/yKemAZ93UMQ59Hq1/arcgis/rest/services/RMO_RNM_gdb/FeatureServer/0',
  TITLE: 'Road Network',
  ID: 'road-network-layer',
} as const;

// Chart colors for maintenance categories
export const CATEGORY_COLORS = {
  'Road Reconstruction': '#ff4d4f',
  'Structural Overlay': '#ff7a45',
  'Surface Restoration': '#40a9ff',
  'Restoration of Skid Resistance': '#73d13d',
  'Routine Maintenance': '#36cfc9',
} as const;