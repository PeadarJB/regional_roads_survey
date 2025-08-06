// src/utils/mapUtils.ts
// Utility functions for map-related operations

import type { RoadSegment, MaintenanceParameters, MaintenanceCategory } from '../types';

/**
 * Categorizes a road segment based on maintenance parameters.
 * This is exported from calculations.ts for reuse in map filtering.
 * 
 * @param segment - The road segment to categorize
 * @param params - Maintenance threshold parameters
 * @returns The maintenance category for the segment
 */
export function categorizeSegment(segment: RoadSegment, params: MaintenanceParameters): MaintenanceCategory {
  // 1. Road Reconstruction (most severe)
  if (
    segment.iri >= params.roadReconstruction_iri ||
    segment.rut >= params.roadReconstruction_rut ||
    segment.psci <= params.roadReconstruction_psci
  ) {
    return 'Road Reconstruction';
  }

  // 2. Structural Overlay
  if (
    segment.iri >= params.structuralOverlay_iri ||
    segment.rut >= params.structuralOverlay_rut ||
    segment.psci <= params.structuralOverlay_psci
  ) {
    return 'Structural Overlay';
  }

  // 3. Surface Restoration
  if (
    (segment.psci <= params.surfaceRestoration_psci_a) ||
    (segment.psci <= params.surfaceRestoration_psci_b && segment.iri >= params.surfaceRestoration_iri) ||
    (segment.psci <= params.surfaceRestoration_psci_c)
  ) {
    return 'Surface Restoration';
  }

  // 4. Restoration of Skid Resistance
  if (
    (segment.psci <= params.restorationOfSkidResistance_psci_a) ||
    (segment.psci <= params.restorationOfSkidResistance_psci_b && segment.csc <= params.restorationOfSkidResistance_csc) ||
    (segment.psci <= params.restorationOfSkidResistance_psci_c && segment.mpd <= params.restorationOfSkidResistance_mpd)
  ) {
    return 'Restoration of Skid Resistance';
  }

  // 5. Routine Maintenance (default)
  return 'Routine Maintenance';
}