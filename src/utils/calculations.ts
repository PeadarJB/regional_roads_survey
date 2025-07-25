// src/utils/calculations.ts
// This utility contains the core business logic for categorizing road segments
// and calculating maintenance costs based on user-defined parameters.

import type { RoadSegment, MaintenanceParameters, CostInputs, MaintenanceCategory } from '../types';

/**
 * Standard road width in meters used for cost calculations.
 */
const STANDARD_ROAD_WIDTH = 7.5;

/**
 * Length of each road segment in kilometers.
 */
const SEGMENT_LENGTH_KM = 0.1;

/**
 * Results from the maintenance calculation process.
 */
export interface MaintenanceCalculationResult {
  categoryLengths: Record<MaintenanceCategory, number>;
  categoryCosts: Record<MaintenanceCategory, number>;
  totalLength: number;
  totalCost: number;
}

/**
 * Calculates maintenance categories and costs for the road network based on current parameters.
 * 
 * @param roadNetwork - Array of road segments to analyze
 * @param parameters - User-defined maintenance threshold parameters
 * @param costs - User-defined costs per square meter for each maintenance type
 * @param selectedCounty - Selected county filter ('all' or specific county name)
 * @returns Calculated maintenance data including lengths and costs by category
 */
export function calculateMaintenanceData(
  roadNetwork: RoadSegment[],
  parameters: MaintenanceParameters,
  costs: CostInputs,
  selectedCounty: string | 'all'
): MaintenanceCalculationResult {
  // Initialize result object
  const result: MaintenanceCalculationResult = {
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

  // Filter road network based on selected county
  const filteredNetwork = selectedCounty === 'all' 
    ? roadNetwork 
    : roadNetwork.filter(segment => segment.county === selectedCounty);

  // Process each road segment
  filteredNetwork.forEach(segment => {
    // Determine maintenance category for this segment
    const category = categorizeSegment(segment, parameters);
    
    // Add segment length to the appropriate category
    result.categoryLengths[category] += SEGMENT_LENGTH_KM;
    
    // Calculate cost for this segment
    // Cost = length (km) * 1000 (to convert to m) * width (m) * cost per sqm
    const segmentArea = SEGMENT_LENGTH_KM * 1000 * STANDARD_ROAD_WIDTH;
    let costPerSqm = 0;
    
    switch (category) {
      case 'Road Reconstruction':
        costPerSqm = costs.rr;
        break;
      case 'Structural Overlay':
        costPerSqm = costs.so;
        break;
      case 'Surface Restoration':
        costPerSqm = costs.sr;
        break;
      case 'Restoration of Skid Resistance':
        costPerSqm = costs.rs;
        break;
      case 'Routine Maintenance':
        costPerSqm = costs.rm;
        break;
    }
    
    const segmentCost = segmentArea * costPerSqm;
    result.categoryCosts[category] += segmentCost;
  });

  // Calculate totals
  result.totalLength = Object.values(result.categoryLengths).reduce((sum, length) => sum + length, 0);
  result.totalCost = Object.values(result.categoryCosts).reduce((sum, cost) => sum + cost, 0);

  return result;
}

/**
 * Categorizes a road segment based on maintenance parameters.
 * The rules are applied in order of priority, from most severe to least severe.
 * 
 * @param segment - The road segment to categorize
 * @param params - Maintenance threshold parameters
 * @returns The maintenance category for the segment
 */
function categorizeSegment(segment: RoadSegment, params: MaintenanceParameters): MaintenanceCategory {
  // 1. Road Reconstruction (most severe)
  // Triggered by: IRI >= threshold OR RUT >= threshold OR PSCI <= threshold
  if (
    segment.iri >= params.roadReconstruction_iri ||
    segment.rut >= params.roadReconstruction_rut ||
    segment.psci <= params.roadReconstruction_psci
  ) {
    return 'Road Reconstruction';
  }

  // 2. Structural Overlay
  // Triggered by: IRI >= threshold OR RUT >= threshold OR PSCI <= threshold
  if (
    segment.iri >= params.structuralOverlay_iri ||
    segment.rut >= params.structuralOverlay_rut ||
    segment.psci <= params.structuralOverlay_psci
  ) {
    return 'Structural Overlay';
  }

  // 3. Surface Restoration
  // Complex rule with multiple PSCI conditions and IRI check
  if (
    (segment.psci <= params.surfaceRestoration_psci_a) ||
    (segment.psci <= params.surfaceRestoration_psci_b && segment.iri >= params.surfaceRestoration_iri) ||
    (segment.psci <= params.surfaceRestoration_psci_c)
  ) {
    return 'Surface Restoration';
  }

  // 4. Restoration of Skid Resistance
  // Complex rule involving PSCI, CSC, and MPD thresholds
  if (
    (segment.psci <= params.skidResistance_psci_a) ||
    (segment.psci <= params.skidResistance_psci_b && segment.csc <= params.skidResistance_csc) ||
    (segment.psci <= params.skidResistance_psci_c && segment.mpd <= params.skidResistance_mpd)
  ) {
    return 'Restoration of Skid Resistance';
  }

  // 5. Routine Maintenance (default - least severe)
  // All segments that don't meet any of the above criteria
  return 'Routine Maintenance';
}