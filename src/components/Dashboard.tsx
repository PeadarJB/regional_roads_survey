import React, { useState } from 'react';
import { Layout, Row, Col } from 'antd';
import ControlsSidebar from './controls/ControlsSidebar';
import SummaryCards from './common/SummaryCards';
import MainCharts from './charts/MainCharts';
import MapPanel from './map/MapPanel';

const { Sider, Content } = Layout;

const Dashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const siderWidth = 350;
  const collapsedSiderWidth = 80;

  return (
    <Layout style={{ height: 'calc(100vh - 64px)', overflow: 'hidden', position: 'relative' }}>
      <Sider
        width={siderWidth}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="light"
        style={{
          position: 'absolute',
          zIndex: 10,
          height: 'calc(100% - 32px)',
          margin: '16px',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #f0f0f0',
        }}
      >
        <ControlsSidebar collapsed={collapsed} />
      </Sider>
      <Content style={{ 
          padding: '16px', 
          marginLeft: collapsed ? collapsedSiderWidth : siderWidth,
          transition: 'margin-left 0.2s',
        }}>
        <Row gutter={[16, 16]} style={{ height: '100%' }}>
          <Col xs={24} lg={12} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <SummaryCards />
            <div style={{ flex: 1, minHeight: 0, marginTop: '16px' }}>
              <MainCharts />
            </div>
          </Col>
          <Col xs={24} lg={12} style={{ height: '100%' }}>
            <MapPanel />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Dashboard;