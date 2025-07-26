// src/components/map/MapComponent.tsx
// This component handles the ArcGIS Map rendering and lifecycle

import React, { useEffect, useRef } from 'react';
import { Typography } from 'antd';
import { usePavementStore } from '../../store/usePavementStore';
import MapController from './MapController';

const { Text } = Typography;

const MapComponent: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const initializeMap = usePavementStore((state) => state.initializeMap);
  const clearMap = usePavementStore((state) => state.clearMap);
  const selectedCategory = usePavementStore((state) => state.selectedCategory);

  // Initialize map on mount
  useEffect(() => {
    if (mapContainerRef.current) {
      initializeMap(mapContainerRef.current);
    }

    // Cleanup on unmount
    return () => {
      clearMap();
    };
  }, [initializeMap, clearMap]);

  return (
    <>
      <div 
        ref={mapContainerRef}
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'relative',
          borderRadius: '6px',
          overflow: 'hidden'
        }}
      >
        {/* Overlay text when no category is selected */}
        {!selectedCategory && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              right: 16,
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '8px 16px',
              borderRadius: '4px',
              zIndex: 10,
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <Text type="secondary">
              Click on a chart bar or select a filter to highlight specific road sections
            </Text>
          </div>
        )}
      </div>
      {/* Map Controller handles reactive updates based on state changes */}
      <MapController />
    </>
  );
};

export default MapComponent;