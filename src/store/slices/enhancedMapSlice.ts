// src/store/slices/enhancedMapSlice.ts
// UPDATED: Triggers initial calculations after map initialization.

import type { StateCreator } from 'zustand';
import type { StoreState } from '../../store/usePavementStore';
import type { MaintenanceCategory } from '../../types';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Query from '@arcgis/core/rest/support/Query';
import { API_KEY, WEB_MAP_ID } from '../../config/arcgis';
import { MaintenanceQueryBuilder } from '../../utils/featureLayerQueries';

export interface QueryResult {
  category: MaintenanceCategory;
  featureCount: number;
  totalLength: number;
}

export interface EnhancedMapSlice {
  mapView: MapView | null;
  roadNetworkLayer: FeatureLayer | null;
  highlightLayer: GraphicsLayer | null;
  selectedCategory: MaintenanceCategory | null;
  isQuerying: boolean;
  queryResults: QueryResult[] | null;
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
      const esriConfig = await import('@arcgis/core/config');
      esriConfig.default.apiKey = API_KEY;
      
      const webMap = new WebMap({
        portalItem: { id: WEB_MAP_ID }
      });
      
      const view = new MapView({
        container,
        map: webMap,
        center: [-8.0, 53.3],
        zoom: 7,
        popup: { defaultPopupTemplateEnabled: false }
      });
      
      const highlightLayer = new GraphicsLayer({
        id: 'maintenance-highlights',
        title: 'Maintenance Category Highlights'
      });
      
      await webMap.load();
      await view.when();
      webMap.add(highlightLayer);
      
      const roadNetworkLayer = webMap.layers.find(layer => {
        const title = layer.title?.toLowerCase() || '';
        return layer.type === 'feature' && (title.includes('road network') || title.includes('road'));
      }) as FeatureLayer | null;

      if (roadNetworkLayer) {
        await roadNetworkLayer.load();
        roadNetworkLayer.outFields = ["*"];
        
        set({
          mapView: view,
          roadNetworkLayer: roadNetworkLayer,
          highlightLayer: highlightLayer
        });

        // Trigger initial calculations after map is ready
        setTimeout(() => {
          const state = get();
          if (state.runCalculations) {
            console.log('Triggering initial calculations from map...');
            state.runCalculations();
          }
        }, 500);
        
      } else {
        console.error('Road Network Layer not found in web map');
        set({
          mapView: view,
          roadNetworkLayer: null,
          highlightLayer: highlightLayer
        });
      }
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
    if (!roadNetworkLayer) return;
    set({ isQuerying: true });
    try {
      const targetCategory = category || state.selectedCategory;
      if (!targetCategory) return;
      
      const whereClause = MaintenanceQueryBuilder.buildCombinedQuery(parameters, selectedCounty, targetCategory);
      const query = new Query({ where: whereClause, returnGeometry: false });
      const featureCount = await roadNetworkLayer.queryFeatureCount(query);
      const totalLength = featureCount * 0.1;
      
      set({ queryResults: [{ category: targetCategory, featureCount, totalLength }] });
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
      const categories: MaintenanceCategory[] = ['Road Reconstruction', 'Structural Overlay', 'Surface Restoration', 'Restoration of Skid Resistance', 'Routine Maintenance'];
      
      for (const category of categories) {
        const whereClause = MaintenanceQueryBuilder.buildCombinedQuery(parameters, selectedCounty, category);
        const countQuery = new Query({ where: whereClause, returnGeometry: false });
        const featureCount = await roadNetworkLayer.queryFeatureCount(countQuery);
        const totalLength = featureCount * 0.1;
        results.push({ category, featureCount, totalLength });
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
    if (highlightLayer) highlightLayer.removeAll();
  },
  
  clearMap: () => {
    const { mapView } = get();
    if (mapView) mapView.destroy();
    set({
      mapView: null,
      roadNetworkLayer: null,
      highlightLayer: null,
      selectedCategory: null,
      queryResults: null
    });
  }
});