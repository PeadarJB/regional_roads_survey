// src/components/map/MapComponent.tsx
// FIXED: Corrected useEffect dependency array to prevent infinite loop.

import React, { useEffect, useRef } from 'react';
import { usePavementStore } from '../../store/usePavementStore';
import { Tag } from 'antd';
import EnhancedMapController from './EnhancedMapController';

const MapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { 
    initializeMap, 
    clearMap, 
    mapView, 
    selectedCategory, 
    setSelectedCategory,
    roadNetworkLayer 
  } = usePavementStore();
  
  const isMobileView = usePavementStore((state) => state.isMobileView);

  // This effect now runs ONLY once on mount and cleans up on unmount.
  useEffect(() => {
    if (mapRef.current) {
      initializeMap(mapRef.current);
    }
    
    // Cleanup function
    return () => {
      clearMap();
    };
  }, [initializeMap, clearMap]); // REMOVED mapView from dependencies

  return (
    <>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'relative'
        }}
      >
        {/* Selected category tag overlay */}
        {selectedCategory && (
          <div
            style={{
              position: 'absolute',
              top: isMobileView ? 8 : 16,
              left: isMobileView ? 8 : 16,
              zIndex: 10,
            }}
          >
            <Tag 
              color="blue" 
              closable 
              onClose={() => setSelectedCategory(null)}
              style={{ 
                fontSize: isMobileView ? 12 : 14,
                padding: isMobileView ? '2px 8px' : '4px 12px'
              }}
            >
              Showing: {selectedCategory}
            </Tag>
          </div>
        )}
      </div>
      
      {mapView && roadNetworkLayer && <EnhancedMapController />}
    </>
  );
};

export default MapComponent;