// src/components/controls/ParametersDrawer.tsx
import React from 'react';
import { Drawer, Collapse, Button, Form, Space, Typography } from 'antd';
import { CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { usePavementStore } from '../../store/usePavementStore';
import ParametersSection from './ParametersSection';
import CostsSection from './CostsSection';

const { Panel } = Collapse;
const { Title } = Typography;

const ParametersDrawer: React.FC = () => {
  const isOpen = usePavementStore((state) => state.isParameterDrawerOpen);
  const setParameterDrawerOpen = usePavementStore((state) => state.setParameterDrawerOpen);
  const resetParameters = usePavementStore((state) => state.resetParameters);
  const resetCosts = usePavementStore((state) => state.resetCosts);

  // Custom title with logos and text
  const drawerTitle = (
    <Space direction="vertical" align="center" style={{ width: '100%' }}>
      <Space size="middle" style={{ marginBottom: 8 }}>
        <img 
          src='/img/DoT_Logo.png' 
          alt="DTTS" 
          style={{ height: 24 }}
        />
        <img 
          src='/img/RMO-Logo-rebrand.jpg' 
          alt="RMO" 
          style={{ height: 24 }}
        />
        <img 
          src='/img/PMS-Logo.png'
          alt="PMS" 
          style={{ height: 24 }}
        />
      </Space>
      <Title level={5} style={{ margin: 0 }}>
        RMO Dashboard
      </Title>
    </Space>
  );

  return (
    <Drawer
      title={drawerTitle}
      placement="left"
      onClose={() => setParameterDrawerOpen(false)}
      open={isOpen}
      width="85%"
      styles={{
        body: { paddingTop: 16 },
        header: { paddingBottom: 16 }
      }}
      closeIcon={<CloseOutlined />}
    >
      <Title level={5} style={{ marginBottom: 16 }}>
        Parameters & Costs
      </Title>
      <Form layout="horizontal" colon={false}>
        <Collapse 
          defaultActiveKey={['parameters', 'costs']}
          expandIconPosition="end"
          style={{ background: 'transparent', border: 'none' }}
        >
          <Panel 
            header="Maintenance Parameters" 
            key="parameters"
            extra={
              <Button
                type="link"
                size="small"
                icon={<ReloadOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  resetParameters();
                }}
                style={{ padding: '0 8px' }}
              >
                Reset
              </Button>
            }
            style={{ marginBottom: 16 }}
          >
            <ParametersSection />
          </Panel>
          
          <Panel 
            header="Costs (€/sqm)" 
            key="costs"
            extra={
              <Button
                type="link"
                size="small"
                icon={<ReloadOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  resetCosts();
                }}
                style={{ padding: '0 8px' }}
              >
                Reset
              </Button>
            }
          >
            <CostsSection />
          </Panel>
        </Collapse>
      </Form>
    </Drawer>
  );
};

export default ParametersDrawer;