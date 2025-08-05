// src/store/slices/mapSlice.ts
// This slice manages all map-related state and interactions with ArcGIS
// FIXED: Corrected TypeScript errors by improving type inference for the roadNetworkLayer.

import type { StateCreator } from 'zustand';
import type { StoreState } from '../usePavementStore';
import type { MaintenanceCategory } from '../../types';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import type Field from '@arcgis/core/layers/support/Field';
import { API_KEY, WEB_MAP_ID } from '../../config/arcgis';
import { MaintenanceQueryBuilder } from '../../utils/featureLayerQueries';
import Query from '@arcgis/core/rest/support/Query';
import type FeatureSet from '@arcgis/core/rest/support/FeatureSet';

export interface QueryResult {
  category: MaintenanceCategory;
  featureCount: number;
  totalLength: number;
}

export interface MapSlice {
  // Map instances
  mapView: MapView | null;
  roadNetworkLayer: FeatureLayer | null; // The road network layer with all survey data
  highlightLayer: GraphicsLayer | null;
  
  // Map state
  selectedCategory: MaintenanceCategory | null;
  isQuerying: boolean;
  queryResults: QueryResult[] | null;
  
  // Actions
  initializeMap: (container: HTMLDivElement) => Promise<void>;
  setSelectedCategory: (category: MaintenanceCategory | null) => void;
  executeMaintenanceQuery: (category?: MaintenanceCategory) => Promise<void>;
  calculateCategoryStatistics: () => Promise<void>;
  clearHighlights: () => void;
  clearMap: () => void;
}

export const createMapSlice: StateCreator<StoreState, [], [], MapSlice> = (set, get) => ({
  mapView: null,
  roadNetworkLayer: null,
  highlightLayer: null,
  selectedCategory: null,
  isQuerying: false,
  queryResults: null,
  
  initializeMap: async (container: HTMLDivElement) => {
    try {
      // Import ArcGIS config module
      const esriConfig = await import('@arcgis/core/config');
      
      // Set the API key
      esriConfig.default.apiKey = API_KEY;
      
      // Create the web map from the provided ID
      const webMap = new WebMap({
        portalItem: {
          id: WEB_MAP_ID
        }
      });
      
      // Create the map view
      const view = new MapView({
        container,
        map: webMap,
        center: [-8.0, 53.3], // Center on Ireland
        zoom: 7,
        popup: {
          defaultPopupTemplateEnabled: true
        }
      });
      
      const highlightLayer = new GraphicsLayer({
        id: 'maintenance-highlights',
        title: 'Maintenance Category Highlights'
      });

      // Wait for the web map to load
      await webMap.load();
      await view.when();

      webMap.add(highlightLayer);
      
      // Find the road network layer in the web map using a more direct `find` method
      const roadNetworkLayer = webMap.layers.find(layer => {
        const title = layer.title?.toLowerCase() || '';
        return layer.type === 'feature' && (title.includes('road network') || title.includes('road'));
      }) as FeatureLayer | null; // Cast the result to the expected type

      // Verify the layer has the expected survey data fields
      if (roadNetworkLayer) {
        await roadNetworkLayer.load();
        
        console.log('Found Road Network Layer:', roadNetworkLayer.title);

        const requiredFields = [
          'OBJECTID', 
          'LA', 
          'AIRI_2018', 
          'LRUT_2018', 
          'PSCI_Class_2018', 
          'CSC_Class_2018', 
          'MPD_2018'
        ];
        
        // Explicitly type the 'f' parameter in the map function
        const availableFields = roadNetworkLayer.fields.map((f: Field) => f.name);
        
        console.log('Road Network Layer - Available fields:', availableFields);
        
        const missingFields = requiredFields.filter(field => !availableFields.includes(field));
        if (missingFields.length > 0) {
          console.warn('Road Network Layer - Missing expected fields:', missingFields);
        } else {
          console.log('Road Network Layer - All required fields present');
        }
        
        // Ensure all fields are requested
        roadNetworkLayer.outFields = ["*"];
      } else {
        console.error('Road Network Layer not found in web map. Please ensure the web map contains a feature layer with "road network" in its title.');
      }
      
      // Store references in state
      set({
        mapView: view,
        roadNetworkLayer: roadNetworkLayer,
        highlightLayer: highlightLayer,
      });
      
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  },
  
  setSelectedCategory: (category: MaintenanceCategory | null) => {
    set({ selectedCategory: category });
    if (category) {
        get().executeMaintenanceQuery(category);
    } else {
        get().clearHighlights();
    }
  },

  executeMaintenanceQuery: async (category?: MaintenanceCategory) => {
    const state = get();
    const { roadNetworkLayer, parameters, selectedCounty } = state;

    if (!roadNetworkLayer) {
      console.error('Road network layer not initialized');
      return;
    }

    set({ isQuerying: true });

    try {
      const targetCategory = category || state.selectedCategory;
      if (!targetCategory) return;

      const whereClause = MaintenanceQueryBuilder.buildCombinedQuery(
        parameters,
        selectedCounty,
        targetCategory
      );

      const query = new Query({
        where: whereClause,
        outFields: ['OBJECTID', 'Shape_Length', 'Route', 'LA'],
        returnGeometry: true,
        outSpatialReference: state.mapView?.spatialReference,
      });

      const featureSet: FeatureSet = await roadNetworkLayer.queryFeatures(query);

      const totalLength =
        featureSet.features.reduce((sum, feature) => {
          return sum + (feature.attributes.Shape_Length || 0);
        }, 0) / 1000;

      set({
        queryResults: [
          {
            category: targetCategory,
            featureCount: featureSet.features.length,
            totalLength: totalLength,
          },
        ],
      });
    } catch (error) {
      console.error('Error executing maintenance query:', error);
    } finally {
      set({ isQuerying: false });
    }
  },

  calculateCategoryStatistics: async () => {
    const state = get();
    const { roadNetworkLayer, parameters, selectedCounty } = state;

    if (!roadNetworkLayer) return;

    set({ isQuerying: true });

    try {
      const results: QueryResult[] = [];
      const categories: MaintenanceCategory[] = [
        'Road Reconstruction',
        'Structural Overlay',
        'Surface Restoration',
        'Restoration of Skid Resistance',
        'Routine Maintenance',
      ];

      for (const category of categories) {
        const whereClause = MaintenanceQueryBuilder.buildCombinedQuery(
          parameters,
          selectedCounty,
          category
        );

        const countQuery = new Query({
          where: whereClause,
          returnGeometry: false,
        });

        const featureCount = await roadNetworkLayer.queryFeatureCount(countQuery);

        const statsQuery = new Query({
          where: whereClause,
          outStatistics: [
            {
              statisticType: 'sum',
              onStatisticField: 'Shape_Length',
              outStatisticFieldName: 'total_length',
            },
          ],
          returnGeometry: false,
        });

        const statsResult = await roadNetworkLayer.queryFeatures(statsQuery);
        const totalLength =
          statsResult.features[0]?.attributes.total_length / 1000 || 0;

        results.push({
          category,
          featureCount,
          totalLength,
        });
      }

      set({ queryResults: results });
    } catch (error) {
      console.error('Error calculating category statistics:', error);
    } finally {
      set({ isQuerying: false });
    }
  },

  clearHighlights: () => {
    const { highlightLayer } = get();
    if (highlightLayer) {
      highlightLayer.removeAll();
    }
  },
  
  clearMap: () => {
    const { mapView } = get();
    if (mapView) {
      mapView.destroy();
    }
    set({
      mapView: null,
      roadNetworkLayer: null,
      selectedCategory: null,
      highlightLayer: null,
      queryResults: null,
    });
  }
});