// src/components/controls/ParameterInput.tsx
import React from 'react';
import { Form, InputNumber, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

// The type for the value that antd's InputNumber can return.
type ValueType = string | number | null;

interface ParameterInputProps {
  label: string;
  value: number;
  onChange: (value: number | null) => void;
  tooltip?: string;
  suffix?: string;
  prefix?: string;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
}

const ParameterInput: React.FC<ParameterInputProps> = ({
  label,
  value,
  onChange,
  tooltip,
  suffix,
  prefix,
  min = 0,
  max,
  step = 0.1,
  precision = 1,
}) => {
  const handleChange = (newValue: ValueType) => {
    if (typeof newValue === 'number') {
      onChange(newValue);
    } else {
      onChange(null);
    }
  };

  const labelNode = tooltip ? (
    <span>
      {label}{' '}
      <Tooltip title={tooltip}>
        <QuestionCircleOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
      </Tooltip>
    </span>
  ) : (
    label
  );

  return (
    <Form.Item 
      label={labelNode} 
      style={{ marginBottom: 12 }}
      labelCol={{ span: 16 }}
      wrapperCol={{ span: 8 }}
      labelAlign="left"
    >
      <InputNumber
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        precision={precision}
        prefix={prefix}
        suffix={suffix}
        style={{ width: '100%' }}
        size="small"
      />
    </Form.Item>
  );
};

export default ParameterInput;