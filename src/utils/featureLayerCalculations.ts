// src/utils/featureLayerCalculations.ts
// Utility for performing calculations directly on the Feature Layer

import type FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Query from '@arcgis/core/rest/support/Query';
import type { MaintenanceCategory, MaintenanceParameters, CostInputs } from '../types';
import { MaintenanceQueryBuilder } from './featureLayerQueries';

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
    selectedCounty: string | 'all'
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

    try {
      // Calculate for each category
      const categories: MaintenanceCategory[] = [
        'Road Reconstruction',
        'Structural Overlay',
        'Surface Restoration',
        'Restoration of Skid Resistance',
        'Routine Maintenance'
      ];

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

      return result;
    } catch (error) {
      console.error('Error calculating maintenance data:', error);
      throw error;
    }
  }

  /**
   * Calculate data for a specific category
   */
  private async calculateCategoryData(
    category: MaintenanceCategory,
    parameters: MaintenanceParameters,
    costs: CostInputs,
    selectedCounty: string | 'all'
  ): Promise<{ length: number; cost: number; count: number }> {
    const whereClause = MaintenanceQueryBuilder.buildCombinedQuery(
      parameters,
      selectedCounty,
      category
    );

    // Query for statistics
    const query = new Query({
      where: whereClause,
      outStatistics: [
        {
          statisticType: 'sum',
          onStatisticField: 'Shape_Length',
          outStatisticFieldName: 'total_length'
        },
        {
          statisticType: 'count',
          onStatisticField: 'OBJECTID',
          outStatisticFieldName: 'segment_count'
        }
      ],
      returnGeometry: false
    });

    const result = await this.featureLayer.queryFeatures(query);
    
    if (result.features.length === 0) {
      return { length: 0, cost: 0, count: 0 };
    }

    const stats = result.features[0].attributes;
    const lengthKm = (stats.total_length || 0) / 1000; // Convert meters to kilometers
    const segmentCount = stats.segment_count || 0;

    // Calculate cost
    const costPerSqm = this.getCostForCategory(category, costs);
    const cost = lengthKm * 1000 * STANDARD_ROAD_WIDTH * costPerSqm;

    return {
      length: lengthKm,
      cost: cost,
      count: segmentCount
    };
  }

  /**
   * Get cost per square meter for a category
   */
  private getCostForCategory(category: MaintenanceCategory, costs: CostInputs): number {
    switch (category) {
      case 'Road Reconstruction':
        return costs.rr;
      case 'Structural Overlay':
        return costs.so;
      case 'Surface Restoration':
        return costs.sr;
      case 'Restoration of Skid Resistance':
        return costs.rs;
      case 'Routine Maintenance':
        return costs.rm;
      default:
        return 0;
    }
  }

  /**
   * Get segments for a specific category (with pagination for large datasets)
   */
  async getCategorySegments(
    category: MaintenanceCategory,
    parameters: MaintenanceParameters,
    selectedCounty: string | 'all',
    options: {
      start?: number;
      num?: number;
      includeGeometry?: boolean;
    } = {}
  ) {
    const { start = 0, num = 1000, includeGeometry = false } = options;

    const whereClause = MaintenanceQueryBuilder.buildCombinedQuery(
      parameters,
      selectedCounty,
      category
    );

    const query = new Query({
      where: whereClause,
      outFields: ['OBJECTID', 'Route', 'LA', 'AIRI_2018', 'LRUT_2018', 'PSCI_Class_2018', 'CSC_Class_2018', 'MPD_2018'],
      returnGeometry: includeGeometry,
      start: start,
      num: num,
      orderByFields: ['OBJECTID ASC']
    });

    return await this.featureLayer.queryFeatures(query);
  }

  /**
   * Validate that required fields exist in the Feature Layer
   */
  async validateFields(): Promise<{ isValid: boolean; missingFields: string[] }> {
    await this.featureLayer.load();

    const requiredFields = [
      'AIRI_2018',
      'LRUT_2018',
      'PSCI_Class_2018',
      'CSC_Class_2018',
      'MPD_2018',
      'Shape_Length',
      'LA'
    ];

    const availableFields = this.featureLayer.fields.map(f => f.name);
    const missingFields = requiredFields.filter(field => !availableFields.includes(field));

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }
}