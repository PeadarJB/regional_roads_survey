// src/store/slices/enhancedMapSlice.ts
// Enhanced map slice with spatial query capabilities
// UPDATED: Calculates length based on a fixed 100m segment length.

import type { StateCreator } from 'zustand';
import type { StoreState } from '../../store/usePavementStore';
import type { MaintenanceCategory } from '../../types';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Query from '@arcgis/core/rest/support/Query';
import type Field from '@arcgis/core/layers/support/Field';
import { API_KEY, WEB_MAP_ID } from '../../config/arcgis';
import { MaintenanceQueryBuilder } from '../../utils/featureLayerQueries';

export interface QueryResult {
  category: MaintenanceCategory;
  featureCount: number;
  totalLength: number;
}

export interface EnhancedMapSlice {
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

export const createEnhancedMapSlice: StateCreator<StoreState, [], [], EnhancedMapSlice> = (set, get) => ({
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
          defaultPopupTemplateEnabled: false // We'll create custom popups
        }
      });
      
      // Create highlight layer
      const highlightLayer = new GraphicsLayer({
        id: 'maintenance-highlights',
        title: 'Maintenance Category Highlights'
      });
      
      // Wait for the web map to load
      await webMap.load();
      await view.when();
      
      // Add highlight layer to map
      webMap.add(highlightLayer);
      
      // Find the road network layer
      const roadNetworkLayer = webMap.layers.find(layer => {
        const title = layer.title?.toLowerCase() || '';
        return layer.type === 'feature' && (title.includes('road network') || title.includes('road'));
      }) as FeatureLayer | null;

      if (roadNetworkLayer) {
        await roadNetworkLayer.load();
        
        console.log('Road Network Layer loaded:', roadNetworkLayer.title);
        
        // Verify required fields
        const requiredFields = [
          'OBJECTID', 
          'LA', 
          'Route',
          'AIRI_2018', 
          'LRUT_2018', 
          'PSCI_Class_2018', 
          'CSC_Class_2018', 
          'MPD_2018',
        ];
        
        const availableFields = roadNetworkLayer.fields.map((f: Field) => f.name);
        const missingFields = requiredFields.filter(field => !availableFields.includes(field));
        
        if (missingFields.length > 0) {
          console.warn('Missing expected fields:', missingFields);
        }
        
        // Ensure all fields are requested
        roadNetworkLayer.outFields = ["*"];
      } else {
        console.error('Road Network Layer not found in web map');
      }
      
      // Store references in state
      set({
        mapView: view,
        roadNetworkLayer: roadNetworkLayer,
        highlightLayer: highlightLayer
      });
      
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  },
  
  setSelectedCategory: (category: MaintenanceCategory | null) => {
    set({ selectedCategory: category });
    
    // Trigger query for the selected category
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
      
      // Build the query
      const whereClause = MaintenanceQueryBuilder.buildCombinedQuery(
        parameters,
        selectedCounty,
        targetCategory
      );
      
      const query = new Query({
        where: whereClause,
        outFields: ['OBJECTID', 'Route', 'LA'],
        returnGeometry: false, // Geometry not needed for count
      });
      
      // Execute the query to get the count of features
      const featureCount = await roadNetworkLayer.queryFeatureCount(query);
      
      console.log(`Query results for ${targetCategory}: ${featureCount} features`);
      
      // Calculate total length (each segment is 100m = 0.1km)
      const totalLength = featureCount * 0.1;
      
      // Update query results
      set({
        queryResults: [{
          category: targetCategory,
          featureCount: featureCount,
          totalLength: totalLength
        }]
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
        'Routine Maintenance'
      ];
      
      // Query each category to get the count
      for (const category of categories) {
        const whereClause = MaintenanceQueryBuilder.buildCombinedQuery(
          parameters,
          selectedCounty,
          category
        );
        
        const countQuery = new Query({
          where: whereClause,
          returnGeometry: false
        });
        
        const featureCount = await roadNetworkLayer.queryFeatureCount(countQuery);
        
        // Calculate length from count (100m per segment)
        const totalLength = featureCount * 0.1;
        
        results.push({
          category,
          featureCount,
          totalLength
        });
      }
      
      set({ queryResults: results });
      
      console.log('Category statistics calculated:', results);
      
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
    const { mapView, highlightLayer } = get();
    if (mapView) {
      mapView.destroy();
    }
    if (highlightLayer) {
      highlightLayer.removeAll();
    }
    set({
      mapView: null,
      roadNetworkLayer: null,
      highlightLayer: null,
      selectedCategory: null,
      queryResults: null
    });
  }
});