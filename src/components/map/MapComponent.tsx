// src/components/map/MapComponent.tsx
// FIXED: Proper map initialization and component lifecycle management

import React, { useEffect, useRef } from 'react';
import { usePavementStore } from '../../store/usePavementStore';
import { Tag } from 'antd';
import EnhancedMapController from './EnhancedMapController';

const MapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const initializeMap = usePavementStore((state) => state.initializeMap);
  const mapView = usePavementStore((state) => state.mapView);
  const selectedCategory = usePavementStore((state) => state.selectedCategory);
  const setSelectedCategory = usePavementStore((state) => state.setSelectedCategory);
  const isMobileView = usePavementStore((state) => state.isMobileView);
  const roadNetworkLayer = usePavementStore((state) => state.roadNetworkLayer);

  // Initialize the map when component mounts
  useEffect(() => {
    if (mapRef.current && !mapView) {
      console.log('Initializing map from MapComponent...');
      initializeMap(mapRef.current);
    }
    
    // Cleanup function
    return () => {
      // Map cleanup is handled by the store
    };
  }, [initializeMap, mapView]);

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
        
        {/* Loading indicator */}
        {!mapView && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            Loading map...
          </div>
        )}
      </div>
      
      {/* Enhanced Map Controller handles all reactive updates */}
      {mapView && roadNetworkLayer && <EnhancedMapController />}
    </>
  );
};

export default MapComponent;