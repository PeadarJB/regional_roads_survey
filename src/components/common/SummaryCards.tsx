// src/components/common/SummaryCards.tsx
// This component displays the high-level summary statistics for the dashboard.

import React from 'react';
import { Row, Col, Card, Statistic, Select } from 'antd';
import { EuroCircleOutlined, AreaChartOutlined } from '@ant-design/icons';

const SummaryCards: React.FC = () => {
  return (
    <Row gutter={[16, 16]} align="middle" justify="space-between" style={{ width: '100%' }}>
      <Col xs={24} sm={12} md={8} lg={6}>
        <Card>
          <Statistic
            title="Total Cost"
            value={1.15}
            precision={2}
            prefix={<EuroCircleOutlined />}
            suffix="B"
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6}>
        <Card>
          <Statistic
            title="Total Length"
            value={12974}
            precision={0}
            prefix={<AreaChartOutlined />}
            suffix="km"
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={24} md={8} lg={6} style={{ textAlign: 'right' }}>
         <Select
            defaultValue="all"
            style={{ width: '100%' }}
            options={[{ value: 'all', label: 'Local Authority (All)' }]}
          />
      </Col>
    </Row>
  );
};

export default SummaryCards;
