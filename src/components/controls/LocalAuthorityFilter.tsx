// src/components/controls/LocalAuthorityFilter.tsx
// NEW: Multi-select Local Authority filter component

import React, { useMemo } from 'react';
import { Select, Button, Space, Typography, Tag } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { usePavementStore } from '../../store/usePavementStore';
import { useTheme } from 'antd-style';

const { Text } = Typography;
const { Option } = Select;

const LocalAuthorityFilter: React.FC = () => {
  const theme = useTheme();
  const availableCounties = usePavementStore((state) => state.availableCounties);
  const selectedCounty = usePavementStore((state) => state.selectedCounty);
  const setSelectedCounty = usePavementStore((state) => state.setSelectedCounty);
  const selectAllCounties = usePavementStore((state) => state.selectAllCounties);
  const clearCountySelection = usePavementStore((state) => state.clearCountySelection);
  const isMobileView = usePavementStore((state) => state.isMobileView);

  // Convert selection to array format for the Select component
  const selectValue = useMemo(() => {
    if (selectedCounty === 'all') {
      return availableCounties;
    } else if (typeof selectedCounty === 'string') {
      return [selectedCounty];
    } else if (Array.isArray(selectedCounty)) {
      return selectedCounty;
    }
    return [];
  }, [selectedCounty, availableCounties]);

  // Handle selection change
  const handleChange = (value: string[]) => {
    if (value.length === 0) {
      // If nothing selected, default to 'all'
      selectAllCounties();
    } else if (value.length === availableCounties.length) {
      // If all counties selected, use 'all' for efficiency
      selectAllCounties();
    } else {
      // Otherwise, set the specific selection
      setSelectedCounty(value);
    }
  };

  // Custom tag render for selected items
  const tagRender = (props: any) => {
    const { label, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {label}
      </Tag>
    );
  };

  // Display text showing selection status
  const getSelectionText = () => {
    if (selectedCounty === 'all' || selectValue.length === availableCounties.length) {
      return 'All Local Authorities';
    } else if (selectValue.length === 0) {
      return 'No selection';
    } else if (selectValue.length === 1) {
      return `${selectValue[0]}`;
    } else {
      return `${selectValue.length} counties selected`;
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <Text strong style={{ display: 'block', marginBottom: 8 }}>
        Local Authority Filter
      </Text>
      
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder="Select Local Authorities"
        value={selectValue}
        onChange={handleChange}
        tagRender={tagRender}
        maxTagCount={isMobileView ? 1 : 3}
        maxTagTextLength={10}
        allowClear
        showSearch
        filterOption={(input, option) =>
          option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
        }
        dropdownRender={(menu) => (
          <>
            <div style={{ padding: '8px', borderBottom: `1px solid ${theme.colorBorder}` }}>
              <Space>
                <Button
                  type="link"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => {
                    selectAllCounties();
                  }}
                >
                  Select All
                </Button>
                <Button
                  type="link"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => {
                    clearCountySelection();
                  }}
                >
                  Clear All
                </Button>
              </Space>
            </div>
            {menu}
          </>
        )}
      >
        {availableCounties.map((county) => (
          <Option key={county} value={county}>
            {county}
          </Option>
        ))}
      </Select>
      
      <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
        {getSelectionText()}
      </Text>
    </div>
  );
};

export default LocalAuthorityFilter;