// src/components/map/MapController.tsx
// This component manages map reactivity based on application state

import { useEffect } from 'react';
import { usePavementStore } from '../../store/usePavementStore';
import { categorizeSegment } from '../../utils/mapUtils';

const MapController: React.FC = () => {
  // Get necessary state from store
  const roadNetworkLayer = usePavementStore((state) => state.roadNetworkLayer);
  const selectedCounty = usePavementStore((state) => state.selectedCounty);
  const selectedCategory = usePavementStore((state) => state.selectedCategory);
  const roadNetwork = usePavementStore((state) => state.roadNetwork);
  const parameters = usePavementStore((state) => state.parameters);

  useEffect(() => {
    if (!roadNetworkLayer) return;

    // Build the definition expression for filtering
    const expressions: string[] = [];

    // County filter - using 'LA' field from the Feature Layer
    if (selectedCounty !== 'all') {
      expressions.push(`LA = '${selectedCounty}'`);
    }

    // Category filter
    if (selectedCategory && roadNetwork.length > 0) {
      // TODO: Phase 2 - Build SQL queries directly from Feature Layer fields
      // For now, we use the static data approach with OBJECTID matching
      const segmentIds = roadNetwork
        .filter(segment => {
          const category = categorizeSegment(segment, parameters);
          return category === selectedCategory;
        })
        .map(segment => segment.id);

      if (segmentIds.length > 0) {
        expressions.push(`OBJECTID IN (${segmentIds.join(', ')})`);
      } else {
        // No segments match - hide all features
        expressions.push('1=0');
      }
    }

    // Apply the definition expression to filter the layer
    roadNetworkLayer.definitionExpression = expressions.length > 0 
      ? expressions.join(' AND ') 
      : '1=1'; // Show all if no filters

    // Refresh the layer to apply changes
    roadNetworkLayer.refresh();

  }, [roadNetworkLayer, selectedCounty, selectedCategory, roadNetwork, parameters]);

  // This component doesn't render anything
  return null;
};

export default MapController;