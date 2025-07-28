import React from 'react';
import { Row, Col, Card, Statistic, Select } from 'antd';
import { EuroCircleOutlined, AreaChartOutlined } from '@ant-design/icons';
import { usePavementStore } from '../../store/usePavementStore';

const SummaryCards: React.FC = () => {
  const totalCost = usePavementStore((state) => state.totalCost);
  const totalLength = usePavementStore((state) => state.totalLength);
  const selectedCounty = usePavementStore((state) => state.selectedCounty);
  const availableCounties = usePavementStore((state) => state.availableCounties);
  const setSelectedCounty = usePavementStore((state) => state.setSelectedCounty);
  const isMobileView = usePavementStore((state) => state.isMobileView);

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

  const countyOptions = [
    { value: 'all', label: isMobileView ? 'All' : 'Local Authority (All)' },
    ...availableCounties.map(county => ({ value: county, label: county }))
  ];

  // Mobile layout: stack everything vertically
  if (isMobileView) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Row gutter={8}>
          <Col span={12}>
            <Card size="small">
              <Statistic
                title="Total Cost"
                value={formattedCost.value}
                precision={2}
                prefix={isMobileView ? '€' : <EuroCircleOutlined />}
                suffix={formattedCost.suffix}
                valueStyle={{ color: '#cf1322', fontSize: 20 }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small">
              <Statistic
                title="Total Length"
                value={totalLength}
                precision={0}
                prefix={isMobileView ? '' : <AreaChartOutlined />}
                suffix="km"
                valueStyle={{ color: '#3f8600', fontSize: 20 }}
              />
            </Card>
          </Col>
        </Row>
        <Select
          value={selectedCounty}
          style={{ width: '100%' }}
          options={countyOptions}
          onChange={setSelectedCounty}
          placeholder="Select Local Authority"
          size="middle"
        />
      </div>
    );
  }

  // Desktop layout
  return (
    <Row gutter={[24, 24]} align="middle">
      <Col xs={24} sm={12} md={8}>
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
      <Col xs={24} sm={12} md={8}>
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
      <Col xs={24} sm={24} md={8}>
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