// src/components/controls/ControlsSidebar.tsx
// PARTIAL UPDATE: Shows how to integrate the new LocalAuthorityFilter

import React from 'react';
import { Card, Divider } from 'antd';
import { useTheme } from 'antd-style';
import { usePavementStore } from '../../store/usePavementStore';
import ParametersPanel from './ParametersPanel';
import CostsPanel from './CostsPanel';
import LocalAuthorityFilter from './LocalAuthorityFilter'; // NEW IMPORT

const ControlsSidebar: React.FC = () => {
  const theme = useTheme();
  const isMobileView = usePavementStore((state) => state.isMobileView);

  return (
    <Card 
      title="Dashboard Controls" 
      style={{ 
        height: '100%',
        overflowY: 'auto',
        borderRadius: theme.borderRadius,
      }}
      styles={{
        body: {
          padding: isMobileView ? '12px' : '24px',
        }
      }}
      size={isMobileView ? 'small' : 'default'}
    >
      {/* NEW: Multi-select Local Authority Filter */}
      <LocalAuthorityFilter />
      
      <Divider />
      
      {/* Existing Parameters Panel */}
      <ParametersPanel />
      
      <Divider />
      
      {/* Existing Costs Panel */}
      <CostsPanel />
    </Card>
  );
};

export default ControlsSidebar;