// src/utils/featureLayerQueries.ts
// Utility functions for building dynamic SQL queries for the Feature Layer

import type { MaintenanceParameters, MaintenanceCategory } from '../types';

/**
 * Builds SQL WHERE clauses for each maintenance category based on parameters
 */
export class MaintenanceQueryBuilder {
  /**
   * Builds SQL expression for Road Reconstruction category
   */
  static buildRoadReconstructionQuery(params: MaintenanceParameters): string {
    return `(AIRI_2018 >= ${params.roadReconstruction_iri} OR LRUT_2018 >= ${params.roadReconstruction_rut} OR PSCI_Class_2018 <= ${params.roadReconstruction_psci})`;
  }

  /**
   * Builds SQL expression for Structural Overlay category
   */
  static buildStructuralOverlayQuery(params: MaintenanceParameters): string {
    // First check if segment doesn't meet Road Reconstruction criteria
    const notRoadReconstruction = `NOT ${this.buildRoadReconstructionQuery(params)}`;
    
    // Then check if it meets Structural Overlay criteria
    const structuralOverlay = `(AIRI_2018 >= ${params.structuralOverlay_iri} OR LRUT_2018 >= ${params.structuralOverlay_rut} OR PSCI_Class_2018 <= ${params.structuralOverlay_psci})`;
    
    return `(${notRoadReconstruction} AND ${structuralOverlay})`;
  }

  /**
   * Builds SQL expression for Surface Restoration category
   */
  static buildSurfaceRestorationQuery(params: MaintenanceParameters): string {
    // Exclude segments that meet higher priority categories
    const notRoadReconstruction = `NOT ${this.buildRoadReconstructionQuery(params)}`;
    const notStructuralOverlay = `NOT (AIRI_2018 >= ${params.structuralOverlay_iri} OR LRUT_2018 >= ${params.structuralOverlay_rut} OR PSCI_Class_2018 <= ${params.structuralOverlay_psci})`;
    
    // Surface Restoration conditions
    const condition1 = `PSCI_Class_2018 <= ${params.surfaceRestoration_psci_a}`;
    const condition2 = `(PSCI_Class_2018 <= ${params.surfaceRestoration_psci_b} AND AIRI_2018 >= ${params.surfaceRestoration_iri})`;
    const condition3 = `PSCI_Class_2018 <= ${params.surfaceRestoration_psci_c}`;
    
    return `(${notRoadReconstruction} AND ${notStructuralOverlay} AND (${condition1} OR ${condition2} OR ${condition3}))`;
  }

  /**
   * Builds SQL expression for Restoration of Skid Resistance category
   */
  static buildSkidResistanceQuery(params: MaintenanceParameters): string {
    // Exclude segments that meet higher priority categories
    const notRoadReconstruction = `NOT ${this.buildRoadReconstructionQuery(params)}`;
    const notStructuralOverlay = `NOT (AIRI_2018 >= ${params.structuralOverlay_iri} OR LRUT_2018 >= ${params.structuralOverlay_rut} OR PSCI_Class_2018 <= ${params.structuralOverlay_psci})`;
    
    // Exclude Surface Restoration
    const notSurfaceRestoration = `NOT ((PSCI_Class_2018 <= ${params.surfaceRestoration_psci_a}) OR (PSCI_Class_2018 <= ${params.surfaceRestoration_psci_b} AND AIRI_2018 >= ${params.surfaceRestoration_iri}) OR (PSCI_Class_2018 <= ${params.surfaceRestoration_psci_c}))`;
    
    // Skid Resistance conditions
    const condition1 = `PSCI_Class_2018 <= ${params.skidResistance_psci_a}`;
    const condition2 = `(PSCI_Class_2018 <= ${params.skidResistance_psci_b} AND CSC_Class_2018 <= ${params.skidResistance_csc})`;
    const condition3 = `(PSCI_Class_2018 <= ${params.skidResistance_psci_c} AND MPD_2018 <= ${params.skidResistance_mpd})`;
    
    return `(${notRoadReconstruction} AND ${notStructuralOverlay} AND ${notSurfaceRestoration} AND (${condition1} OR ${condition2} OR ${condition3}))`;
  }

  /**
   * Builds SQL expression for Routine Maintenance category
   */
  static buildRoutineMaintenanceQuery(params: MaintenanceParameters): string {
    // Routine Maintenance is everything that doesn't meet other categories
    const notRoadReconstruction = `NOT ${this.buildRoadReconstructionQuery(params)}`;
    const notStructuralOverlay = `NOT (AIRI_2018 >= ${params.structuralOverlay_iri} OR LRUT_2018 >= ${params.structuralOverlay_rut} OR PSCI_Class_2018 <= ${params.structuralOverlay_psci})`;
    const notSurfaceRestoration = `NOT ((PSCI_Class_2018 <= ${params.surfaceRestoration_psci_a}) OR (PSCI_Class_2018 <= ${params.surfaceRestoration_psci_b} AND AIRI_2018 >= ${params.surfaceRestoration_iri}) OR (PSCI_Class_2018 <= ${params.surfaceRestoration_psci_c}))`;
    const notSkidResistance = `NOT ((PSCI_Class_2018 <= ${params.skidResistance_psci_a}) OR (PSCI_Class_2018 <= ${params.skidResistance_psci_b} AND CSC_Class_2018 <= ${params.skidResistance_csc}) OR (PSCI_Class_2018 <= ${params.skidResistance_psci_c} AND MPD_2018 <= ${params.skidResistance_mpd}))`;
    
    return `(${notRoadReconstruction} AND ${notStructuralOverlay} AND ${notSurfaceRestoration} AND ${notSkidResistance})`;
  }

  /**
   * Gets the SQL query for a specific maintenance category
   */
  static getCategoryQuery(category: MaintenanceCategory, params: MaintenanceParameters): string {
    switch (category) {
      case 'Road Reconstruction':
        return this.buildRoadReconstructionQuery(params);
      case 'Structural Overlay':
        return this.buildStructuralOverlayQuery(params);
      case 'Surface Restoration':
        return this.buildSurfaceRestorationQuery(params);
      case 'Restoration of Skid Resistance':
        return this.buildSkidResistanceQuery(params);
      case 'Routine Maintenance':
        return this.buildRoutineMaintenanceQuery(params);
      default:
        return '1=1'; // Show all if no category
    }
  }

  /**
   * Builds a combined query including county filter and category filter
   */
  static buildCombinedQuery(
    params: MaintenanceParameters,
    selectedCounty?: string,
    selectedCategory?: MaintenanceCategory | null
  ): string {
    const conditions: string[] = [];

    // Add county filter if specified
    if (selectedCounty && selectedCounty !== 'all') {
      conditions.push(`LA = '${selectedCounty}'`);
    }

    // Add category filter if specified
    if (selectedCategory) {
      conditions.push(this.getCategoryQuery(selectedCategory, params));
    }

    // Combine all conditions with AND
    return conditions.length > 0 ? conditions.join(' AND ') : '1=1';
  }

  /**
   * Builds queries for all categories (useful for calculating totals)
   */
  static buildAllCategoryQueries(params: MaintenanceParameters): Record<MaintenanceCategory, string> {
    return {
      'Road Reconstruction': this.buildRoadReconstructionQuery(params),
      'Structural Overlay': this.buildStructuralOverlayQuery(params),
      'Surface Restoration': this.buildSurfaceRestorationQuery(params),
      'Restoration of Skid Resistance': this.buildSkidResistanceQuery(params),
      'Routine Maintenance': this.buildRoutineMaintenanceQuery(params)
    };
  }
}