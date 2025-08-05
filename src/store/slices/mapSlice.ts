// src/store/slices/mapSlice.ts
// This slice manages all map-related state and interactions with ArcGIS
// FIXED: Corrected TypeScript errors by improving type inference for the roadNetworkLayer.

import type { StateCreator } from 'zustand';
import type { StoreState } from '../usePavementStore';
import type { MaintenanceCategory } from '../../types';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import type Field from '@arcgis/core/layers/support/Field';
import { API_KEY, WEB_MAP_ID } from '../../config/arcgis';

export interface MapSlice {
  // Map instances
  mapView: MapView | null;
  roadNetworkLayer: FeatureLayer | null; // The road network layer with all survey data
  
  // Map state
  selectedCategory: MaintenanceCategory | null;
  
  // Actions
  initializeMap: (container: HTMLDivElement) => Promise<void>;
  setSelectedCategory: (category: MaintenanceCategory | null) => void;
  clearMap: () => void;
}

export const createMapSlice: StateCreator<StoreState, [], [], MapSlice> = (set, get) => ({
  mapView: null,
  roadNetworkLayer: null,
  selectedCategory: null,
  
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
      
      // Wait for the web map to load
      await webMap.load();
      await view.when();
      
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
        roadNetworkLayer: roadNetworkLayer
      });
      
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  },
  
  setSelectedCategory: (category: MaintenanceCategory | null) => {
    set({ selectedCategory: category });
  },
  
  clearMap: () => {
    const { mapView } = get();
    if (mapView) {
      mapView.destroy();
    }
    set({
      mapView: null,
      roadNetworkLayer: null,
      selectedCategory: null
    });
  }
});
