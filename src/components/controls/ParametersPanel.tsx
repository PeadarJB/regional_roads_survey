// src/components/controls/ParametersPanel.tsx
import React from 'react';
import { InputNumber, Typography, Space, Collapse, Button, Tooltip } from 'antd';
import { QuestionCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { usePavementStore } from '../../store/usePavementStore';
import { useTheme } from 'antd-style';

const { Text, Title } = Typography;
const { Panel } = Collapse;

const ParametersPanel: React.FC = () => {
  const theme = useTheme();
  const parameters = usePavementStore((state) => state.parameters);
  const setParameters = usePavementStore((state) => state.setParameters);
  const resetParameters = usePavementStore((state) => state.resetParameters);
  const isMobileView = usePavementStore((state) => state.isMobileView);

  const handleParameterChange = (key: string, value: number | null) => {
    if (value !== null) {
      setParameters({ [key]: value });
    }
  };

  const inputStyle = { width: isMobileView ? '100%' : '120px' };
  const labelStyle = { fontSize: isMobileView ? 12 : 14 };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>Maintenance Parameters</Title>
        <Tooltip title="Reset to default values">
          <Button 
            size="small" 
            icon={<ReloadOutlined />} 
            onClick={resetParameters}
          >
            Reset
          </Button>
        </Tooltip>
      </div>

      <Collapse 
        defaultActiveKey={['road-reconstruction']} 
        ghost
        size={isMobileView ? 'small' : undefined}
      >
        {/* Road Reconstruction */}
        <Panel 
          header={
            <Text strong style={labelStyle}>
              Road Reconstruction
              <Tooltip title="Thresholds for complete road reconstruction">
                <QuestionCircleOutlined style={{ marginLeft: 8, color: theme.colorTextSecondary }} />
              </Tooltip>
            </Text>
          } 
          key="road-reconstruction"
        >
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <div>
              <Text style={labelStyle}>IRI &gt;</Text>
              <InputNumber
                value={parameters.roadReconstruction_iri}
                onChange={(value) => handleParameterChange('roadReconstruction_iri', value)}
                min={0}
                max={20}
                step={0.5}
                style={inputStyle}
                size={isMobileView ? 'small' : 'middle'}
              />
            </div>
            <div>
              <Text style={labelStyle}>OR RUT &gt;</Text>
              <InputNumber
                value={parameters.roadReconstruction_rut}
                onChange={(value) => handleParameterChange('roadReconstruction_rut', value)}
                min={0}
                max={100}
                step={5}
                style={inputStyle}
                size={isMobileView ? 'small' : 'middle'}
              />
            </div>
            <div>
              <Text style={labelStyle}>OR PSCI &lt;/=</Text>
              <InputNumber
                value={parameters.roadReconstruction_psci}
                onChange={(value) => handleParameterChange('roadReconstruction_psci', value)}
                min={1}
                max={10}
                step={1}
                style={inputStyle}
                size={isMobileView ? 'small' : 'middle'}
              />
            </div>
          </Space>
        </Panel>

        {/* Structural Overlay */}
        <Panel 
          header={
            <Text strong style={labelStyle}>
              Structural Overlay
              <Tooltip title="Thresholds for structural overlay treatment">
                <QuestionCircleOutlined style={{ marginLeft: 8, color: theme.colorTextSecondary }} />
              </Tooltip>
            </Text>
          } 
          key="structural-overlay"
        >
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <div>
              <Text style={labelStyle}>IRI &gt;/=</Text>
              <InputNumber
                value={parameters.structuralOverlay_iri}
                onChange={(value) => handleParameterChange('structuralOverlay_iri', value)}
                min={0}
                max={20}
                step={0.5}
                style={inputStyle}
                size={isMobileView ? 'small' : 'middle'}
              />
            </div>
            <div>
              <Text style={labelStyle}>OR RUT &gt;/=</Text>
              <InputNumber
                value={parameters.structuralOverlay_rut}
                onChange={(value) => handleParameterChange('structuralOverlay_rut', value)}
                min={0}
                max={100}
                step={5}
                style={inputStyle}
                size={isMobileView ? 'small' : 'middle'}
              />
            </div>
            <div>
              <Text style={labelStyle}>OR PSCI &lt;/=</Text>
              <InputNumber
                value={parameters.structuralOverlay_psci}
                onChange={(value) => handleParameterChange('structuralOverlay_psci', value)}
                min={1}
                max={10}
                step={1}
                style={inputStyle}
                size={isMobileView ? 'small' : 'middle'}
              />
            </div>
          </Space>
        </Panel>

        {/* Surface Restoration */}
        <Panel 
          header={
            <Text strong style={labelStyle}>
              Surface Restoration
              <Tooltip title="Thresholds for surface restoration treatment">
                <QuestionCircleOutlined style={{ marginLeft: 8, color: theme.colorTextSecondary }} />
              </Tooltip>
            </Text>
          } 
          key="surface-restoration"
        >
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <div>
              <Text style={labelStyle}>PSCI =</Text>
              <InputNumber
                value={parameters.surfaceRestoration_psci_a}
                onChange={(value) => handleParameterChange('surfaceRestoration_psci_a', value)}
                min={1}
                max={10}
                step={1}
                style={inputStyle}
                size={isMobileView ? 'small' : 'middle'}
              />
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>OR</Text>
            <div>
              <Text style={labelStyle}>PSCI =</Text>
              <InputNumber
                value={parameters.surfaceRestoration_psci_b}
                onChange={(value) => handleParameterChange('surfaceRestoration_psci_b', value)}
                min={1}
                max={10}
                step={1}
                style={inputStyle}
                size={isMobileView ? 'small' : 'middle'}
              />
              <Text style={{ marginLeft: 8, ...labelStyle }}>& IRI &gt;/=</Text>
              <InputNumber
                value={parameters.surfaceRestoration_iri}
                onChange={(value) => handleParameterChange('surfaceRestoration_iri', value)}
                min={0}
                max={20}
                step={0.5}
                style={inputStyle}
                size={isMobileView ? 'small' : 'middle'}
              />
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>OR</Text>
            <div>
              <Text style={labelStyle}>PSCI &lt;/=</Text>
              <InputNumber
                value={parameters.surfaceRestoration_psci_c}
                onChange={(value) => handleParameterChange('surfaceRestoration_psci_c', value)}
                min={1}
                max={10}
                step={1}
                style={inputStyle}
                size={isMobileView ? 'small' : 'middle'}
              />
            </div>
          </Space>
        </Panel>

        {/* Restoration of Skid Resistance */}
        <Panel 
          header={
            <Text strong style={labelStyle}>
              Restoration of Skid Resistance
              <Tooltip title="Thresholds for skid resistance restoration">
                <QuestionCircleOutlined style={{ marginLeft: 8, color: theme.colorTextSecondary }} />
              </Tooltip>
            </Text>
          } 
          key="skid-resistance"
        >
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <div>
              <Text style={labelStyle}>PSCI =</Text>
              <InputNumber
                value={parameters.restorationOfSkidResistance_psci_a}
                onChange={(value) => handleParameterChange('restorationOfSkidResistance_psci_a', value)}
                min={1}
                max={10}
                step={1}
                style={inputStyle}
                size={isMobileView ? 'small' : 'middle'}
              />
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>OR</Text>
            <div>
              <Text style={labelStyle}>PSCI &gt;/=</Text>
              <InputNumber
                value={parameters.restorationOfSkidResistance_psci_b}
                onChange={(value) => handleParameterChange('restorationOfSkidResistance_psci_b', value)}
                min={1}
                max={10}
                step={1}
                style={inputStyle}
                size={isMobileView ? 'small' : 'middle'}
              />
              <Text style={{ marginLeft: 8, ...labelStyle }}>& CSC &lt;/=</Text>
              <InputNumber
                value={parameters.restorationOfSkidResistance_csc}
                onChange={(value) => handleParameterChange('restorationOfSkidResistance_csc', value)}
                min={0}
                max={1}
                step={0.05}
                style={inputStyle}
                size={isMobileView ? 'small' : 'middle'}
              />
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>OR</Text>
            <div>
              <Text style={labelStyle}>PSCI &gt;/=</Text>
              <InputNumber
                value={parameters.restorationOfSkidResistance_psci_c}
                onChange={(value) => handleParameterChange('restorationOfSkidResistance_psci_c', value)}
                min={1}
                max={10}
                step={1}
                style={inputStyle}
                size={isMobileView ? 'small' : 'middle'}
              />
              <Text style={{ marginLeft: 8, ...labelStyle }}>& MPD &lt;/=</Text>
              <InputNumber
                value={parameters.restorationOfSkidResistance_mpd}
                onChange={(value) => handleParameterChange('restorationOfSkidResistance_mpd', value)}
                min={0}
                max={2}
                step={0.1}
                style={inputStyle}
                size={isMobileView ? 'small' : 'middle'}
              />
            </div>
          </Space>
        </Panel>

        {/* Routine Maintenance */}
        <Panel 
          header={
            <Text strong style={labelStyle}>
              Routine Maintenance
              <Tooltip title="All segments not meeting other category thresholds">
                <QuestionCircleOutlined style={{ marginLeft: 8, color: theme.colorTextSecondary }} />
              </Tooltip>
            </Text>
          } 
          key="routine-maintenance"
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            All road segments that don't meet the thresholds for other maintenance categories 
            automatically fall into Routine Maintenance.
          </Text>
        </Panel>
      </Collapse>
    </div>
  );
};

export default ParametersPanel;