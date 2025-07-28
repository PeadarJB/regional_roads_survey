// src/components/controls/ParametersDrawer.tsx
import React from 'react';
import { Drawer, Collapse, Button, Form } from 'antd';
import { CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { usePavementStore } from '../../store/usePavementStore';
import ParametersSection from './ParametersSection';
import CostsSection from './CostsSection';

const { Panel } = Collapse;

const ParametersDrawer: React.FC = () => {
  const isOpen = usePavementStore((state) => state.isParameterDrawerOpen);
  const setParameterDrawerOpen = usePavementStore((state) => state.setParameterDrawerOpen);
  const resetParameters = usePavementStore((state) => state.resetParameters);
  const resetCosts = usePavementStore((state) => state.resetCosts);

  return (
    <Drawer
      title="Parameters & Costs"
      placement="left"
      onClose={() => setParameterDrawerOpen(false)}
      open={isOpen}
      width="85%"
      styles={{
        body: { paddingTop: 0 }
      }}
      closeIcon={<CloseOutlined />}
    >
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