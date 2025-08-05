// src/utils/featureLayerCalculations.ts
// FIXED: Using fixed 100m segment length instead of Shape_Length field

import type FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Query from '@arcgis/core/rest/support/Query';
import type { MaintenanceCategory, MaintenanceParameters, CostInputs } from '../types';
import { MaintenanceQueryBuilder } from './featureLayerQueries';

// Fixed segment length in meters (given that each segment is 100m)
const SEGMENT_LENGTH_METERS = 100;
const STANDARD_ROAD_WIDTH = 7.5; // meters

export interface FeatureLayerCalculationResult {
  categoryLengths: Record<MaintenanceCategory, number>;
  categoryCosts: Record<MaintenanceCategory, number>;
  totalLength: number;
  totalCost: number;
  segmentCounts: Record<MaintenanceCategory, number>;
}

/**
 * Performs maintenance calculations directly on the Feature Layer
 * Now using fixed 100m segment length for all calculations
 */
export class FeatureLayerCalculator {
  private featureLayer: FeatureLayer;
  
  constructor(featureLayer: FeatureLayer) {
    this.featureLayer = featureLayer;
  }

  /**
   * Calculate maintenance data for all categories
   */
  async calculateMaintenanceData(
    parameters: MaintenanceParameters,
    costs: CostInputs,
    selectedCounty: string | 'all' | string[]
  ): Promise<FeatureLayerCalculationResult> {
    const result: FeatureLayerCalculationResult = {
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
      segmentCounts: {
        'Road Reconstruction': 0,
        'Structural Overlay': 0,
        'Surface Restoration': 0,
        'Restoration of Skid Resistance': 0,
        'Routine Maintenance': 0
      },
      totalLength: 0,
      totalCost: 0
    };

    const categories: MaintenanceCategory[] = [
      'Road Reconstruction',
      'Structural Overlay',
      'Surface Restoration',
      'Restoration of Skid Resistance',
      'Routine Maintenance'
    ];

    try {
      // Calculate data for each category
      for (const category of categories) {
        const categoryData = await this.calculateCategoryData(
          category,
          parameters,
          costs,
          selectedCounty
        );
        
        result.categoryLengths[category] = categoryData.length;
        result.categoryCosts[category] = categoryData.cost;
        result.segmentCounts[category] = categoryData.count;
        
        result.totalLength += categoryData.length;
        result.totalCost += categoryData.cost;
      }
    } catch (error) {
      console.error('Error calculating maintenance data:', error);
      throw error;
    }

    return result;
  }

  /**
   * Calculate data for a specific maintenance category
   */
  private async calculateCategoryData(
    category: MaintenanceCategory,
    parameters: MaintenanceParameters,
    costs: CostInputs,
    selectedCounty: string | 'all' | string[]
  ): Promise<{ length: number; cost: number; count: number }> {
    try {
      // Build the WHERE clause for this category
      const whereClause = MaintenanceQueryBuilder.buildCombinedQuery(
        parameters,
        selectedCounty,
        category
      );

      // Query to get the count of segments
      const countQuery = new Query({
        where: whereClause,
        returnGeometry: false,
        outFields: ['OBJECTID'] // Minimal field for counting
      });

      // Get the count of segments
      const featureCount = await this.featureLayer.queryFeatureCount(countQuery);
      
      // Calculate total length using fixed segment length
      // Each segment is 100m = 0.1km
      const totalLengthKm = featureCount * (SEGMENT_LENGTH_METERS / 1000);
      
      // Calculate total area (length * width)
      const totalAreaSqM = featureCount * SEGMENT_LENGTH_METERS * STANDARD_ROAD_WIDTH;
      
      // Calculate cost based on category
      const costPerSqM = this.getCostForCategory(category, costs);
      const totalCost = (totalAreaSqM * costPerSqM) / 1_000_000_000; // Convert to billions
      
      return {
        length: totalLengthKm,
        cost: totalCost,
        count: featureCount
      };
    } catch (error) {
      console.error(`Error calculating data for ${category}:`, error);
      return { length: 0, cost: 0, count: 0 };
    }
  }

  /**
   * Get road width for a segment (with fallback to standard width)
   */
  private async getAverageRoadWidth(whereClause: string): Promise<number> {
    try {
      // Query for road width if available
      const query = new Query({
        where: whereClause,
        outFields: ['Road_Width_2018'],
        returnGeometry: false,
        outStatistics: [{
          statisticType: 'avg',
          onStatisticField: 'Road_Width_2018',
          outStatisticFieldName: 'avgWidth'
        }]
      });

      const result = await this.featureLayer.queryFeatures(query);
      
      if (result.features.length > 0 && result.features[0].attributes.avgWidth) {
        return result.features[0].attributes.avgWidth;
      }
    } catch (error) {
      console.warn('Could not get average road width, using standard width:', error);
    }
    
    return STANDARD_ROAD_WIDTH;
  }

  /**
   * Get the cost per square meter for a maintenance category
   */
  private getCostForCategory(category: MaintenanceCategory, costs: CostInputs): number {
    const costMap: Record<MaintenanceCategory, keyof CostInputs> = {
      'Road Reconstruction': 'roadReconstruction',
      'Structural Overlay': 'structuralOverlay',
      'Surface Restoration': 'surfaceRestoration',
      'Restoration of Skid Resistance': 'restorationOfSkidResistance',
      'Routine Maintenance': 'routineMaintenance'
    };
    
    return costs[costMap[category]];
  }

  /**
   * Query segments for a specific category (for debugging/verification)
   */
  async queryCategorySegments(
    category: MaintenanceCategory,
    parameters: MaintenanceParameters,
    selectedCounty: string | 'all' | string[],
    maxResults: number = 100
  ) {
    const whereClause = MaintenanceQueryBuilder.buildCombinedQuery(
      parameters,
      selectedCounty,
      category
    );

    const query = new Query({
      where: whereClause,
      outFields: ['OBJECTID', 'Route', 'LA', 'AIRI_2018', 'LRUT_2018', 'PSCI_Class_2018'],
      returnGeometry: true,
      num: maxResults
    });

    return await this.featureLayer.queryFeatures(query);
  }
}