// src/components/controls/CostsPanel.tsx
import React from 'react';
import { InputNumber, Typography, Space, Button, Tooltip, Row, Col } from 'antd';
import { QuestionCircleOutlined, ReloadOutlined, EuroOutlined } from '@ant-design/icons';
import { usePavementStore } from '../../store/usePavementStore';
import { useTheme } from 'antd-style';

const { Text, Title } = Typography;

const CostsPanel: React.FC = () => {
  const theme = useTheme();
  const costs = usePavementStore((state) => state.costs);
  const setCosts = usePavementStore((state) => state.setCosts);
  const resetCosts = usePavementStore((state) => state.resetCosts);
  const isMobileView = usePavementStore((state) => state.isMobileView);

  const handleCostChange = (key: string, value: number | null) => {
    if (value !== null) {
      setCosts({ [key]: value });
    }
  };

  // Category labels and their corresponding cost keys
  const costCategories = [
    { 
      label: 'Road Reconstruction', 
      key: 'rr',
      color: '#ff4d4f',
      tooltip: 'Cost per square meter for complete road reconstruction'
    },
    { 
      label: 'Structural Overlay', 
      key: 'so',
      color: '#ff7a45',
      tooltip: 'Cost per square meter for structural overlay treatment'
    },
    { 
      label: 'Surface Restoration', 
      key: 'sr',
      color: '#40a9ff',
      tooltip: 'Cost per square meter for surface restoration'
    },
    { 
      label: 'Restoration of Skid Resistance', 
      key: 'rs',
      color: '#73d13d',
      tooltip: 'Cost per square meter for skid resistance restoration'
    },
    { 
      label: 'Routine Maintenance', 
      key: 'rm',
      color: '#36cfc9',
      tooltip: 'Cost per square meter for routine maintenance'
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>
          Costs (€/sqm)
          <Tooltip title="Adjust the cost per square meter for each maintenance category">
            <QuestionCircleOutlined style={{ marginLeft: 8, fontSize: 14, color: theme.colorTextSecondary }} />
          </Tooltip>
        </Title>
        <Tooltip title="Reset to default values">
          <Button 
            size="small" 
            icon={<ReloadOutlined />} 
            onClick={resetCosts}
          >
            Reset
          </Button>
        </Tooltip>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size={isMobileView ? 'small' : 'middle'}>
        {costCategories.map((category) => (
          <div key={category.key}>
            <Row align="middle" gutter={[8, 0]}>
              <Col span={isMobileView ? 24 : 12}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: isMobileView ? 4 : 0 }}>
                  <div 
                    style={{ 
                      width: 12, 
                      height: 12, 
                      backgroundColor: category.color, 
                      marginRight: 8,
                      borderRadius: 2
                    }} 
                  />
                  <Text style={{ fontSize: isMobileView ? 12 : 14 }}>
                    {isMobileView && category.label === 'Restoration of Skid Resistance' 
                      ? 'Skid Resistance' 
                      : category.label}
                  </Text>
                  <Tooltip title={category.tooltip}>
                    <QuestionCircleOutlined 
                      style={{ 
                        marginLeft: 4, 
                        fontSize: 12, 
                        color: theme.colorTextSecondary 
                      }} 
                    />
                  </Tooltip>
                </div>
              </Col>
              <Col span={isMobileView ? 24 : 12}>
                <InputNumber
                  value={costs[category.key as keyof typeof costs]}
                  onChange={(value) => handleCostChange(category.key, value)}
                  min={0}
                  max={200}
                  step={1}
                  formatter={(value) => `€ ${value}`}
                  parser={(value) => value?.replace('€ ', '') as unknown as number}
                  style={{ width: isMobileView ? '100%' : 120 }}
                  size={isMobileView ? 'small' : 'middle'}
                  prefix={<EuroOutlined />}
                />
              </Col>
            </Row>
          </div>
        ))}
      </Space>

      <div style={{ 
        marginTop: 16, 
        padding: 12, 
        backgroundColor: theme.colorBgContainer, 
        borderRadius: theme.borderRadius,
        border: `1px solid ${theme.colorBorder}`
      }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <strong>Note:</strong> These costs represent the price per square meter of road surface. 
          Total costs are calculated as: Length (km) × Width (7.5m) × Cost (€/sqm)
        </Text>
      </div>
    </div>
  );
};

export default CostsPanel;