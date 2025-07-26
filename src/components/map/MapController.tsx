// src/components/map/MapController.tsx
// This component manages map reactivity based on application state

import { useEffect } from 'react';
import { usePavementStore } from '../../store/usePavementStore';
import { categorizeSegment } from '../../utils/mapUtils';

const MapController: React.FC = () => {
  // Get necessary state from store
  const roadLayer = usePavementStore((state) => state.roadLayer);
  const selectedCounty = usePavementStore((state) => state.selectedCounty);
  const selectedCategory = usePavementStore((state) => state.selectedCategory);
  const roadNetwork = usePavementStore((state) => state.roadNetwork);
  const parameters = usePavementStore((state) => state.parameters);

  useEffect(() => {
    if (!roadLayer) return;

    // Build the definition expression
    const expressions: string[] = [];

    // County filter
    if (selectedCounty !== 'all') {
      expressions.push(`county = '${selectedCounty}'`);
    }

    // Category filter
    if (selectedCategory && roadNetwork.length > 0) {
      // Get all road segment IDs that belong to the selected category
      const segmentIds = roadNetwork
        .filter(segment => {
          const category = categorizeSegment(segment, parameters);
          return category === selectedCategory;
        })
        .map(segment => segment.id);

      if (segmentIds.length > 0) {
        // Create an IN clause for the segment IDs
        expressions.push(`OBJECTID IN (${segmentIds.join(', ')})`);
      } else {
        // No segments match - show nothing
        expressions.push('1=0');
      }
    }

    // Apply the definition expression
    roadLayer.definitionExpression = expressions.length > 0 
      ? expressions.join(' AND ') 
      : '1=1'; // Show all if no filters

    // Update the layer to refresh the view
    roadLayer.refresh();

  }, [roadLayer, selectedCounty, selectedCategory, roadNetwork, parameters]);

  // This component doesn't render anything
  return null;
};

export default MapController;