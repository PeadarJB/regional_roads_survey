// src/components/controls/ControlsSidebar.tsx
import React from 'react';
import { Card, Collapse, Button, Form } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { usePavementStore } from '../../store/usePavementStore';
import ParametersSection from './ParametersSection';
import CostsSection from './CostsSection';

const { Panel } = Collapse;

const ControlsSidebar: React.FC = () => {
  const resetParameters = usePavementStore((state) => state.resetParameters);
  const resetCosts = usePavementStore((state) => state.resetCosts);

  return (
    <Card 
      title="Parameters & Costs" 
      style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      styles={{
        header: { 
          borderBottom: '1px solid #f0f0f0',
          flexShrink: 0
        },
        body: { 
          padding: '0 16px 16px',
          overflowY: 'auto',
          flex: 1,
          minHeight: 0
        },
      }}
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
    </Card>
  );
};

export default ControlsSidebar;