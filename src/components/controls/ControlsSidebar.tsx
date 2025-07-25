// src/components/controls/ControlsSidebar.tsx
// This component will house all user-facing controls for parameters and costs.

import React from 'react';
import { Card, Typography } from 'antd';

const { Text } = Typography;

const ControlsSidebar: React.FC = () => {
  return (
    <Card title="Maintenance Parameters & Costs" style={{ height: '100%' }}>
      <Text type="secondary">
        Parameter and cost input controls will be placed here.
      </Text>
    </Card>
  );
};

export default ControlsSidebar;
