// src/store/slices/mapSlice.ts
// This slice manages all map-related state and interactions with ArcGIS
// FIXED: Improved layer initialization and error handling

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

export interface QueryResult {
  category: MaintenanceCategory;
  featureCount: number;
  totalLength: number;
}

export interface MapSlice {
  // Map instances
  mapView: MapView | null;
  roadNetworkLayer: FeatureLayer | null;
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
      console.log('Initializing map...');
      
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
          defaultPopupTemplateEnabled: false
        }
      });
      
      // Wait for the web map to load
      await webMap.load();
      await view.when();
      
      console.log('Web map loaded, looking for road network layer...');
      
      // Find the road network layer in the web map
      let roadNetworkLayer: FeatureLayer | null = null;
      
      // Search through all layers in the web map
      webMap.allLayers.forEach(layer => {
        console.log(`Found layer: ${layer.title} (type: ${layer.type})`);
        
        if (layer.type === 'feature') {
          const featureLayer = layer as FeatureLayer;
          const title = featureLayer.title?.toLowerCase() || '';
          
          // Look for layers with road-related keywords
          if (title.includes('road') || title.includes('network') || title.includes('regional')) {
            roadNetworkLayer = featureLayer;
            console.log(`Selected road network layer: ${featureLayer.title}`);
          }
        }
      });
      
      // If not found by title, try to find the first feature layer
      if (!roadNetworkLayer) {
        const firstFeatureLayer = webMap.allLayers.find(layer => layer.type === 'feature') as FeatureLayer;
        if (firstFeatureLayer) {
          roadNetworkLayer = firstFeatureLayer;
          console.log(`Using first feature layer as road network: ${firstFeatureLayer.title}`);
        }
      }
      
      // Verify the layer has the expected survey data fields
      if (roadNetworkLayer) {
        await roadNetworkLayer.load();
        
        console.log('Road Network Layer loaded:', roadNetworkLayer.title);
        
        // Log all available fields
        const availableFields = roadNetworkLayer.fields.map((f: Field) => f.name);
        console.log('Available fields:', availableFields);
        
        // Check for required fields
        const requiredFields = [
          'OBJECTID', 
          'LA', 
          'AIRI_2018', 
          'LRUT_2018', 
          'PSCI_Class_2018', 
          'CSC_Class_2018', 
          'MPD_2018'
        ];
        
        const missingFields = requiredFields.filter(field => !availableFields.includes(field));
        if (missingFields.length > 0) {
          console.warn('Missing expected fields:', missingFields);
          console.warn('This may affect calculations and filtering');
        } else {
          console.log('All required fields present');
        }
        
        // Ensure all fields are requested
        roadNetworkLayer.outFields = ["*"];
        
        // Set a definition expression to test the layer
        roadNetworkLayer.definitionExpression = "1=1"; // Show all features
        
        // Store the layer and trigger calculations
        set({
          mapView: view,
          roadNetworkLayer: roadNetworkLayer
        });
        
        // Trigger initial calculations after map is ready
        setTimeout(() => {
          const state = get();
          if (state.runCalculations) {
            console.log('Triggering initial calculations from map...');
            state.runCalculations();
          }
        }, 1000);
        
      } else {
        console.error('Road Network Layer not found in web map');
        console.error('Available layers:', webMap.allLayers.map(l => l.title).join(', '));
        
        // Still set the map view even if layer not found
        set({
          mapView: view,
          roadNetworkLayer: null
        });
      }
      
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  },
  
  setSelectedCategory: (category: MaintenanceCategory | null) => {
    console.log('Setting selected category:', category);
    set({ selectedCategory: category });
    
    if (category) {
      get().executeMaintenanceQuery(category);
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

      console.log('Executing query for category:', targetCategory);

      const whereClause = MaintenanceQueryBuilder.buildCombinedQuery(
        parameters,
        selectedCounty,
        targetCategory
      );

      const query = new Query({
        where: whereClause,
        outFields: ['OBJECTID', 'Route', 'LA'],
        returnGeometry: false
      });

      const featureCount = await roadNetworkLayer.queryFeatureCount(query);
      
      // Calculate total length (100m per segment)
      const totalLength = featureCount * 0.1; // Each segment is 100m = 0.1km

      console.log(`Query results for ${targetCategory}: ${featureCount} features, ${totalLength}km`);

      set({
        queryResults: [
          {
            category: targetCategory,
            featureCount: featureCount,
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
        const totalLength = featureCount * 0.1; // 100m per segment

        results.push({
          category,
          featureCount,
          totalLength
        });
      }

      console.log('Category statistics:', results);
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
      highlightLayer: null,
      selectedCategory: null,
      isQuerying: false,
      queryResults: null
    });
  }
});