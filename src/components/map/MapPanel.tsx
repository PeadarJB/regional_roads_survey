// src/components/map/MapPanel.tsx
// This component will house the interactive ArcGIS Map.

import React from 'react';
import { Card, Typography } from 'antd';

const { Text } = Typography;

const MapPanel: React.FC = () => {
  return (
    <Card title="Road Network Map" style={{ height: '100%' }}>
      <div style={{ height: '100%', minHeight: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', borderRadius: '6px' }}>
        <Text type="secondary">Interactive Road Network Map</Text>
        <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px' }}>
          Click on a chart bar or select a filter to highlight specific road sections.
        </Text>
      </div>
    </Card>
  );
};

export default MapPanel;
