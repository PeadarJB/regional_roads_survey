// src/components/map/MapPanel.tsx
// This component houses the interactive ArcGIS Map.

import React from 'react';
import { Card } from 'antd';
import MapComponent from './MapComponent';

const MapPanel: React.FC = () => {
  return (
    <Card 
      title="Road Network Map" 
      style={{ height: '100%' }}
      bodyStyle={{ height: 'calc(100% - 57px)', padding: '12px' }}
    >
      <MapComponent />
    </Card>
  );
};

export default MapPanel;