// src/components/map/MapComponent.tsx
// This component handles the ArcGIS Map rendering and lifecycle

import React, { useEffect, useRef } from 'react';
import { Typography, Tag } from 'antd';
import { usePavementStore } from '../../store/usePavementStore';
import EnhancedMapController from './EnhancedMapController';

const { Text } = Typography;

const MapComponent: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const initializeMap = usePavementStore((state) => state.initializeMap);
  const clearMap = usePavementStore((state) => state.clearMap);
  const selectedCategory = usePavementStore((state) => state.selectedCategory);
  const setSelectedCategory = usePavementStore((state) => state.setSelectedCategory);
  const isMobileView = usePavementStore((state) => state.isMobileView);

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
              top: isMobileView ? 8 : 16,
              left: isMobileView ? 8 : 16,
              right: isMobileView ? 8 : 16,
              background: 'rgba(255, 255, 255, 0.9)',
              padding: isMobileView ? '6px 12px' : '8px 16px',
              borderRadius: '4px',
              zIndex: 10,
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <Text type="secondary" style={{ fontSize: isMobileView ? 12 : 14 }}>
              {isMobileView ? 'Tap a chart bar to filter' : 'Click on a chart bar or select a filter to highlight specific road sections'}
            </Text>
          </div>
        )}
        
        {/* Show selected category */}
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
      {/* Enhanced Map Controller now handles all reactive updates using direct Feature Layer queries */}
      <EnhancedMapController />
    </>
  );
};

export default MapComponent;