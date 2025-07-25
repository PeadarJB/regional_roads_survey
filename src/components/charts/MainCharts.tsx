// src/components/charts/MainCharts.tsx
// This component will contain the primary bar charts for the dashboard.

import React from 'react';
import { Card, Space, Typography } from 'antd';

const { Text } = Typography;

const MainCharts: React.FC = () => {
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card title="Maintenance Category Length">
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text type="secondary">Length bar chart will be rendered here.</Text>
        </div>
      </Card>
      <Card title="Maintenance Category Costs">
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text type="secondary">Costs bar chart will be rendered here.</Text>
        </div>
      </Card>
    </Space>
  );
};

export default MainCharts;
