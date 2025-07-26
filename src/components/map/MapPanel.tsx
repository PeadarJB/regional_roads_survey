// src/components/map/MapPanel.tsx
import React from 'react';
import { Card } from 'antd';
import MapComponent from './MapComponent';

const MapPanel: React.FC = () => {
  return (
    <Card 
      title="Road Network Map" 
      style={{ height: '100%' }}
      styles={{ body: { height: 'calc(100% - 57px)', padding: '12px' } }}
    >
      <MapComponent />
    </Card>
  );
};

export default MapPanel;