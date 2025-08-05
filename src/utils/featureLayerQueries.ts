// src/utils/featureLayerQueries.ts
// UPDATED: Support for multiple county selection

import type { MaintenanceParameters, MaintenanceCategory } from '../types';

/**
 * Builds SQL WHERE clauses for each maintenance category based on parameters
 * Now supports multiple county selection
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
    // Exclude higher priority categories
    const notRoadReconstruction = `NOT ${this.buildRoadReconstructionQuery(params)}`;
    const notStructuralOverlay = `NOT (AIRI_2018 >= ${params.structuralOverlay_iri} OR LRUT_2018 >= ${params.structuralOverlay_rut} OR PSCI_Class_2018 <= ${params.structuralOverlay_psci})`;
    
    // Surface Restoration conditions to exclude
    const surfaceCondition1 = `PSCI_Class_2018 <= ${params.surfaceRestoration_psci_a}`;
    const surfaceCondition2 = `(PSCI_Class_2018 <= ${params.surfaceRestoration_psci_b} AND AIRI_2018 >= ${params.surfaceRestoration_iri})`;
    const surfaceCondition3 = `PSCI_Class_2018 <= ${params.surfaceRestoration_psci_c}`;
    const notSurfaceRestoration = `NOT (${surfaceCondition1} OR ${surfaceCondition2} OR ${surfaceCondition3})`;
    
    // Skid Resistance conditions
    const condition1 = `PSCI_Class_2018 >= ${params.restorationOfSkidResistance_psci_a}`;
    const condition2 = `(PSCI_Class_2018 >= ${params.restorationOfSkidResistance_psci_b} AND CSC_Class_2018 <= ${params.restorationOfSkidResistance_csc})`;
    const condition3 = `(PSCI_Class_2018 >= ${params.restorationOfSkidResistance_psci_c} AND MPD_2018 <= ${params.restorationOfSkidResistance_mpd})`;
    
    return `(${notRoadReconstruction} AND ${notStructuralOverlay} AND ${notSurfaceRestoration} AND (${condition1} OR ${condition2} OR ${condition3}))`;
  }

  /**
   * Builds SQL expression for Routine Maintenance category
   */
  static buildRoutineMaintenanceQuery(params: MaintenanceParameters): string {
    // Routine Maintenance is everything that doesn't fall into other categories
    const notRoadReconstruction = `NOT ${this.buildRoadReconstructionQuery(params)}`;
    const notStructuralOverlay = `NOT (AIRI_2018 >= ${params.structuralOverlay_iri} OR LRUT_2018 >= ${params.structuralOverlay_rut} OR PSCI_Class_2018 <= ${params.structuralOverlay_psci})`;
    
    // Surface Restoration conditions to exclude
    const surfaceCondition1 = `PSCI_Class_2018 <= ${params.surfaceRestoration_psci_a}`;
    const surfaceCondition2 = `(PSCI_Class_2018 <= ${params.surfaceRestoration_psci_b} AND AIRI_2018 >= ${params.surfaceRestoration_iri})`;
    const surfaceCondition3 = `PSCI_Class_2018 <= ${params.surfaceRestoration_psci_c}`;
    const notSurfaceRestoration = `NOT (${surfaceCondition1} OR ${surfaceCondition2} OR ${surfaceCondition3})`;
    
    // Skid Resistance conditions to exclude
    const skidCondition1 = `PSCI_Class_2018 >= ${params.restorationOfSkidResistance_psci_a}`;
    const skidCondition2 = `(PSCI_Class_2018 >= ${params.restorationOfSkidResistance_psci_b} AND CSC_Class_2018 <= ${params.restorationOfSkidResistance_csc})`;
    const skidCondition3 = `(PSCI_Class_2018 >= ${params.restorationOfSkidResistance_psci_c} AND MPD_2018 <= ${params.restorationOfSkidResistance_mpd})`;
    const notSkidResistance = `NOT (${skidCondition1} OR ${skidCondition2} OR ${skidCondition3})`;
    
    return `(${notRoadReconstruction} AND ${notStructuralOverlay} AND ${notSurfaceRestoration} AND ${notSkidResistance})`;
  }

  /**
   * Builds county filter SQL expression
   * Now supports multiple county selection
   */
  static buildCountyFilter(selectedCounty: string | 'all' | string[]): string {
    // Handle 'all' or empty selection
    if (selectedCounty === 'all' || 
        (Array.isArray(selectedCounty) && selectedCounty.length === 0)) {
      return '1=1';
    }
    
    // Handle single county (legacy support)
    if (typeof selectedCounty === 'string') {
      return `LA = '${selectedCounty}'`;
    }
    
    // Handle multiple counties
    if (Array.isArray(selectedCounty)) {
      if (selectedCounty.length === 1) {
        return `LA = '${selectedCounty[0]}'`;
      }
      // Build IN clause for multiple counties
      const countyList = selectedCounty.map(county => `'${county}'`).join(', ');
      return `LA IN (${countyList})`;
    }
    
    return '1=1';
  }

  /**
   * Builds combined query with category and county filter
   */
  static buildCombinedQuery(
    params: MaintenanceParameters,
    selectedCounty: string | 'all' | string[],
    category?: MaintenanceCategory | null
  ): string {
    const countyFilter = this.buildCountyFilter(selectedCounty);
    
    if (!category) {
      return countyFilter;
    }
    
    let categoryQuery: string;
    
    switch (category) {
      case 'Road Reconstruction':
        categoryQuery = this.buildRoadReconstructionQuery(params);
        break;
      case 'Structural Overlay':
        categoryQuery = this.buildStructuralOverlayQuery(params);
        break;
      case 'Surface Restoration':
        categoryQuery = this.buildSurfaceRestorationQuery(params);
        break;
      case 'Restoration of Skid Resistance':
        categoryQuery = this.buildSkidResistanceQuery(params);
        break;
      case 'Routine Maintenance':
        categoryQuery = this.buildRoutineMaintenanceQuery(params);
        break;
      default:
        return countyFilter;
    }
    
    // Combine county and category filters
    if (countyFilter === '1=1') {
      return categoryQuery;
    }
    
    return `${countyFilter} AND ${categoryQuery}`;
  }

  /**
   * Returns all category queries as a map
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