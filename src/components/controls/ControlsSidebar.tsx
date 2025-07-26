import React from 'react';
import { Card } from 'antd';

interface ControlsSidebarProps {
  collapsed: boolean;
}

const ControlsSidebar: React.FC<ControlsSidebarProps> = ({ collapsed }) => {
  return (
    <Card 
      title="Parameters & Costs" 
      style={{ 
        height: '100%', 
        background: 'transparent',
        border: 'none',
        opacity: collapsed ? 0 : 1,
        transition: 'opacity 0.2s'
      }}
      headStyle={{ borderBottom: '1px solid #f0f0f0' }}
    >
      {/* Parameter and cost input controls will be placed here. */}
    </Card>
  );
};

export default ControlsSidebar;