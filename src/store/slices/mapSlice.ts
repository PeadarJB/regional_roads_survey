// src/store/slices/mapSlice.ts
// This slice manages all map-related state and interactions with ArcGIS

import type { StateCreator } from 'zustand';
import type { StoreState } from '../usePavementStore';
import type { MaintenanceCategory } from '../../types';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { API_KEY, WEB_MAP_ID } from '../../config/arcgis';

export interface MapSlice {
  // Map instances
  mapView: MapView | null;
  roadLayer: FeatureLayer | null;
  
  // Map state
  selectedCategory: MaintenanceCategory | null;
  
  // Actions
  initializeMap: (container: HTMLDivElement) => Promise<void>;
  setSelectedCategory: (category: MaintenanceCategory | null) => void;
  clearMap: () => void;
}

export const createMapSlice: StateCreator<StoreState, [], [], MapSlice> = (set, get) => ({
  mapView: null,
  roadLayer: null,
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
      
      // Find the road network layer in the web map
      // You may need to adjust this based on the actual layer name in your web map
      const roadLayer = webMap.layers.find(layer => 
        typeof layer.title === 'string' &&
        (layer.title.toLowerCase().includes('road') || 
         layer.title.toLowerCase().includes('network'))
      ) as FeatureLayer;
      
      if (!roadLayer) {
        console.error('Road network layer not found in web map');
        return;
      }
      
      // Store references in state
      set({
        mapView: view,
        roadLayer: roadLayer
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
      roadLayer: null,
      selectedCategory: null
    });
  }
});