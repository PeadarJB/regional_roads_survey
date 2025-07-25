// src/components/Dashboard.tsx
// This component assembles the complete UI layout for the main dashboard view.

import React from 'react';
import { Layout, Row, Col, Space } from 'antd';
import ControlsSidebar from './controls/ControlsSidebar';
import SummaryCards from './common/SummaryCards';
import MainCharts from './charts/MainCharts';
import MapPanel from './map/MapPanel';

const { Sider, Content } = Layout;

const Dashboard: React.FC = () => {
  return (
    <Layout style={{ minHeight: 'calc(100vh - 64px)' }}>
      <Sider
        width={350}
        collapsible
        theme="light"
        style={{ padding: '16px', borderRight: '1px solid #f0f0f0' }}
      >
        <ControlsSidebar />
      </Sider>
      <Content style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <SummaryCards />
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <MainCharts />
            </Col>
            <Col xs={24} lg={12}>
              <MapPanel />
            </Col>
          </Row>
        </Space>
      </Content>
    </Layout>
  );
};

export default Dashboard;
