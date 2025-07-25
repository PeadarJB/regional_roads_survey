// src/components/common/SummaryCards.tsx
// FIXED: Optimized selectors to prevent infinite loops

import React from 'react';
import { Row, Col, Card, Statistic, Select } from 'antd';
import { EuroCircleOutlined, AreaChartOutlined } from '@ant-design/icons';
import { usePavementStore } from '../../store/usePavementStore';

const SummaryCards: React.FC = () => {
  // FIXED: Use individual selectors instead of object selectors to prevent infinite loops
  const totalCost = usePavementStore((state) => state.totalCost);
  const totalLength = usePavementStore((state) => state.totalLength);
  const selectedCounty = usePavementStore((state) => state.selectedCounty);
  const availableCounties = usePavementStore((state) => state.availableCounties);
  const setSelectedCounty = usePavementStore((state) => state.setSelectedCounty);

  // Format total cost for display
  const formatCost = (cost: number): { value: number; suffix: string } => {
    if (cost >= 1e9) {
      return { value: cost / 1e9, suffix: 'B' };
    } else if (cost >= 1e6) {
      return { value: cost / 1e6, suffix: 'M' };
    } else if (cost >= 1e3) {
      return { value: cost / 1e3, suffix: 'K' };
    }
    return { value: cost, suffix: '' };
  };

  const formattedCost = formatCost(totalCost);

  // Create options for the county selector
  const countyOptions = [
    { value: 'all', label: 'Local Authority (All)' },
    ...availableCounties.map(county => ({ value: county, label: county }))
  ];

  return (
    <Row gutter={[16, 16]} align="middle" justify="space-between" style={{ width: '100%' }}>
      <Col xs={24} sm={12} md={8} lg={6}>
        <Card>
          <Statistic
            title="Total Cost"
            value={formattedCost.value}
            precision={2}
            prefix={<EuroCircleOutlined />}
            suffix={formattedCost.suffix}
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6}>
        <Card>
          <Statistic
            title="Total Length"
            value={totalLength}
            precision={0}
            prefix={<AreaChartOutlined />}
            suffix="km"
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={24} md={8} lg={6} style={{ textAlign: 'right' }}>
        <Select
          value={selectedCounty}
          style={{ width: '100%' }}
          options={countyOptions}
          onChange={setSelectedCounty}
          placeholder="Select Local Authority"
        />
      </Col>
    </Row>
  );
};

export default SummaryCards;