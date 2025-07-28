// src/components/MobileDashboard.tsx
import React from 'react';
import { Tabs } from 'antd';
import { BarChartOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { usePavementStore } from '../store/usePavementStore';
import SummaryCards from './common/SummaryCards';
import MainCharts from './charts/MainCharts';
import MapPanel from './map/MapPanel';
import ParametersDrawer from './controls/ParametersDrawer';

const MobileDashboard: React.FC = () => {
  const activeMobileTab = usePavementStore((state) => state.activeMobileTab);
  const setActiveMobileTab = usePavementStore((state) => state.setActiveMobileTab);

  const tabItems = [
    {
      key: 'map',
      label: (
        <span>
          <EnvironmentOutlined />
          Map
        </span>
      ),
      children: (
        <div style={{ height: 'calc(100vh - 64px - 140px - 48px)', overflow: 'hidden' }}>
          <MapPanel />
        </div>
      ),
    },
    {
      key: 'charts',
      label: (
        <span>
          <BarChartOutlined />
          Charts
        </span>
      ),
      children: (
        <div style={{ height: 'calc(100vh - 64px - 140px - 48px)', overflow: 'auto' }}>
          <MainCharts />
        </div>
      ),
    },
  ];

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Summary Cards at the top */}
      <div style={{ padding: '16px 16px 0' }}>
        <SummaryCards />
      </div>
      
      {/* Tabs for Map and Charts */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '0 16px 16px' }}>
        <Tabs
          activeKey={activeMobileTab}
          onChange={(key) => setActiveMobileTab(key as 'map' | 'charts')}
          items={tabItems}
          style={{ height: '100%' }}
          className="mobile-tabs"
        />
      </div>
      
      {/* Parameters Drawer */}
      <ParametersDrawer />
    </div>
  );
};

export default MobileDashboard;