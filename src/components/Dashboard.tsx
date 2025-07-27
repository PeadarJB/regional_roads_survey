import React from 'react';
import { Row, Col } from 'antd';
import ControlsSidebar from './controls/ControlsSidebar';
import SummaryCards from './common/SummaryCards';
import MainCharts from './charts/MainCharts';
import MapPanel from './map/MapPanel';

const Dashboard: React.FC = () => {
  return (
    <div style={{ height: 'calc(100vh - 64px)', padding: '24px', overflow: 'hidden' }}>
      <Row gutter={[24, 24]} style={{ height: '100%' }}>
        {/* Parameters & Costs Column */}
        <Col xs={24} md={8} lg={6} style={{ height: '100%' }}>
          <ControlsSidebar />
        </Col>
        
        {/* Charts Column */}
        <Col xs={24} md={16} lg={9} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <SummaryCards />
          <div style={{ flex: 1, minHeight: 0, marginTop: '24px' }}>
            <MainCharts />
          </div>
        </Col>
        
        {/* Map Column */}
        <Col xs={24} lg={9} style={{ height: '100%' }}>
          <MapPanel />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;