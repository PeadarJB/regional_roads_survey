// src/components/Dashboard.tsx
import React from 'react';
import { Layout, Row, Col, Space } from 'antd';
import ControlsSidebar from './controls/ControlsSidebar';
import SummaryCards from './common/SummaryCards';
import MainCharts from './charts/MainCharts';
import MapPanel from './map/MapPanel';

const { Sider, Content } = Layout;

const Dashboard: React.FC = () => {
  return (
    <Layout style={{ height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <Sider
        width={350}
        collapsible
        theme="light"
        style={{
          position: 'absolute',
          zIndex: 10,
          height: '100%',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid #f0f0f0',
          padding: '16px',
        }}
      >
        <ControlsSidebar />
      </Sider>
      <Content style={{ padding: '24px' }}>
        <Row gutter={[16, 16]} style={{ height: '100%' }}>
          <Col xs={24} lg={12}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <SummaryCards />
              <MainCharts />
            </Space>
          </Col>
          <Col xs={24} lg={12}>
            <MapPanel />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Dashboard;