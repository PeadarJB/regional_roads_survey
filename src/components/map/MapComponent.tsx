// src/components/map/MapComponent.tsx
// FIXED: Proper map initialization and component lifecycle management

import React, { useEffect, useRef } from 'react';
import { usePavementStore } from '../../store/usePavementStore';
import { Tag } from 'antd';
import EnhancedMapController from './EnhancedMapController';

const MapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  // Select actions and state from the store
  const { 
    initializeMap, 
    clearMap, 
    mapView, 
    selectedCategory, 
    setSelectedCategory,
    roadNetworkLayer 
  } = usePavementStore();
  
  const isMobileView = usePavementStore((state) => state.isMobileView);

  // Initialize the map when component mounts and clean up on unmount
  useEffect(() => {
    if (mapRef.current) {
      console.log('Initializing map from MapComponent...');
      initializeMap(mapRef.current);
    }
    
    // Cleanup function: This will run when the component is unmounted
    return () => {
      console.log('Cleaning up map...');
      clearMap();
    };
  }, [initializeMap, clearMap]); // Dependencies for the effect

  // Log layer status for debugging
  useEffect(() => {
    if (roadNetworkLayer) {
      console.log('Road network layer is ready in MapComponent');
    }
  }, [roadNetworkLayer]);

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
        
        {/* This loading indicator is now handled in App.tsx */}
      </div>
      
      {/* Enhanced Map Controller handles all reactive updates */}
      {mapView && roadNetworkLayer && <EnhancedMapController />}
    </>
  );
};

export default MapComponent;