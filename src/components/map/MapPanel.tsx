// src/components/map/MapPanel.tsx
import React from 'react';
import { Card } from 'antd';
import { usePavementStore } from '../../store/usePavementStore';
import MapComponent from './MapComponent';

const MapPanel: React.FC = () => {
  const isMobileView = usePavementStore((state) => state.isMobileView);
  
  return (
    <Card 
      title="Road Network Map" 
      size={isMobileView ? 'small' : 'default'}
      style={{ height: '100%' }}
      styles={{ 
        body: { 
          height: isMobileView ? 'calc(100% - 38px)' : 'calc(100% - 57px)', 
          padding: isMobileView ? '8px' : '12px' 
        } 
      }}
    >
      <MapComponent />
    </Card>
  );
};

export default MapPanel;