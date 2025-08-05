// src/components/map/EnhancedMapController.tsx
// Enhanced map controller that uses direct Feature Layer queries

import { useEffect, useRef } from 'react';
import { usePavementStore } from '../../store/usePavementStore';
import { MaintenanceQueryBuilder } from '../../utils/featureLayerQueries';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import Query from '@arcgis/core/rest/support/Query';
import type FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import type { MaintenanceCategory } from '../../types';

// Define colors for each maintenance category
const CATEGORY_COLORS: Record<MaintenanceCategory, string> = {
  'Road Reconstruction': '#FF0000',      // Red
  'Structural Overlay': '#FF8C00',       // Dark Orange
  'Surface Restoration': '#FFD700',      // Gold
  'Restoration of Skid Resistance': '#90EE90', // Light Green
  'Routine Maintenance': '#228B22'       // Forest Green
};

const EnhancedMapController: React.FC = () => {
  const highlightLayerRef = useRef<GraphicsLayer | null>(null);
  
  // Get necessary state from store
  const mapView = usePavementStore((state) => state.mapView);
  const roadNetworkLayer = usePavementStore((state) => state.roadNetworkLayer);
  const selectedCounty = usePavementStore((state) => state.selectedCounty);
  const selectedCategory = usePavementStore((state) => state.selectedCategory);
  const parameters = usePavementStore((state) => state.parameters);

  // Initialize highlight layer
  useEffect(() => {
    if (!mapView) return;

    // Create a graphics layer for highlighting
    const highlightLayer = new GraphicsLayer({
      id: 'maintenance-highlight-layer',
      title: 'Maintenance Category Highlights'
    });

    mapView.map.add(highlightLayer);
    highlightLayerRef.current = highlightLayer;

    // Cleanup on unmount
    return () => {
      if (mapView.map.findLayerById('maintenance-highlight-layer')) {
        mapView.map.remove(highlightLayer);
      }
    };
  }, [mapView]);

  // Apply feature layer filtering and highlighting
  useEffect(() => {
    if (!roadNetworkLayer || !highlightLayerRef.current) return;

    const applyFiltersAndHighlight = async () => {
      try {
        // Clear existing highlights
        highlightLayerRef.current!.removeAll();

        // Build the query
        const whereClause = MaintenanceQueryBuilder.buildCombinedQuery(
          parameters,
          selectedCounty,
          selectedCategory
        );

        // Apply definition expression for basic filtering
        roadNetworkLayer.definitionExpression = selectedCounty !== 'all' 
          ? `LA = '${selectedCounty}'`
          : '1=1';

        // If a category is selected, query and highlight those features
        if (selectedCategory) {
          const query = new Query({
            where: whereClause,
            outFields: ['OBJECTID'],
            returnGeometry: true,
            outSpatialReference: mapView.spatialReference
          });

          // Execute the query
          const featureSet: FeatureSet = await roadNetworkLayer.queryFeatures(query);
          
          console.log(`Found ${featureSet.features.length} features for ${selectedCategory}`);

          // Create highlight graphics
          const highlightSymbol = new SimpleFillSymbol({
            color: CATEGORY_COLORS[selectedCategory],
            outline: new SimpleLineSymbol({
              color: CATEGORY_COLORS[selectedCategory],
              width: 3
            })
          });

          // Add highlights for each feature
          featureSet.features.forEach((feature) => {
            const highlightGraphic = new Graphic({
              geometry: feature.geometry,
              symbol: highlightSymbol,
              attributes: {
                ...feature.attributes,
                category: selectedCategory
              }
            });
            highlightLayerRef.current!.add(highlightGraphic);
          });

          // Zoom to highlighted features if any found
          if (featureSet.features.length > 0) {
            const geometries = featureSet.features.map(f => f.geometry);
            const extent = geometries.reduce((acc, geom) => {
              return acc ? acc.union(geom.extent) : geom.extent;
            }, null);

            if (extent) {
              mapView.goTo(extent.expand(1.2), {
                duration: 1000
              });
            }
          }
        }

        // Refresh the layer
        roadNetworkLayer.refresh();

      } catch (error) {
        console.error('Error applying filters and highlights:', error);
      }
    };

    applyFiltersAndHighlight();

  }, [mapView, roadNetworkLayer, selectedCounty, selectedCategory, parameters]);

  // Add click handler for feature popups
  useEffect(() => {
    if (!mapView || !roadNetworkLayer) return;

    const handle = mapView.on('click', async (event) => {
      try {
        const response = await mapView.hitTest(event);
        const results = response.results.filter(
          (result: any) => result.graphic.layer === roadNetworkLayer
        );

        if (results.length > 0) {
          const graphic = results[0].graphic;
          const attributes = graphic.attributes;

          // Determine the maintenance category for this segment
          const categoryQuery = MaintenanceQueryBuilder.buildAllCategoryQueries(parameters);
          let segmentCategory: MaintenanceCategory = 'Routine Maintenance';

          // Check each category in order of priority
          for (const [category, query] of Object.entries(categoryQuery)) {
            // Build a query specific to this feature
            const featureQuery = `OBJECTID = ${attributes.OBJECTID} AND ${query}`;
            const result = await roadNetworkLayer.queryFeatureCount(new Query({ where: featureQuery }));
            
            if (result > 0) {
              segmentCategory = category as MaintenanceCategory;
              break;
            }
          }

          // Create a custom popup content
          mapView.popup.open({
            title: `Road Segment: ${attributes.Route || 'Unknown'}`,
            location: event.mapPoint,
            content: `
              <div style="padding: 10px;">
                <h4>Maintenance Category: <span style="color: ${CATEGORY_COLORS[segmentCategory]}">${segmentCategory}</span></h4>
                <table style="width: 100%; margin-top: 10px;">
                  <tr><td><strong>County:</strong></td><td>${attributes.LA}</td></tr>
                  <tr><td><strong>IRI (2018):</strong></td><td>${attributes.AIRI_2018?.toFixed(2) || 'N/A'}</td></tr>
                  <tr><td><strong>Rut Depth (2018):</strong></td><td>${attributes.LRUT_2018?.toFixed(2) || 'N/A'} mm</td></tr>
                  <tr><td><strong>PSCI (2018):</strong></td><td>${attributes.PSCI_Class_2018 || 'N/A'}</td></tr>
                  <tr><td><strong>CSC (2018):</strong></td><td>${attributes.CSC_Class_2018?.toFixed(2) || 'N/A'}</td></tr>
                  <tr><td><strong>MPD (2018):</strong></td><td>${attributes.MPD_2018?.toFixed(2) || 'N/A'} mm</td></tr>
                </table>
              </div>
            `
          });
        }
      } catch (error) {
        console.error('Error handling map click:', error);
      }
    });

    return () => {
      handle.remove();
    };
  }, [mapView, roadNetworkLayer, parameters]);

  // This component doesn't render anything
  return null;
};

export default EnhancedMapController;