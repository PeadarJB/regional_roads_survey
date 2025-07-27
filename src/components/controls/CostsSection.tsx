// src/components/controls/CostsSection.tsx
import React from 'react';
import { Typography } from 'antd';
import { usePavementStore } from '../../store/usePavementStore';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';
import ParameterInput from './ParameterInput';
import type { CostInputs } from '../../types';

const { Text } = Typography;

const CostsSection: React.FC = () => {
  const costs = usePavementStore((state) => state.costs);
  const setCosts = usePavementStore((state) => state.setCosts);

  // Debounce the cost updates to prevent excessive recalculations
  const debouncedSetCosts = useDebouncedCallback(setCosts, 300);

  const handleCostChange = (key: keyof CostInputs) => (value: number | null) => {
    if (value !== null) {
      debouncedSetCosts({ [key]: value });
    }
  };

  const costLabels: Record<keyof CostInputs, { label: string; tooltip: string }> = {
    rr: {
      label: 'RR (Road Reconstruction)',
      tooltip: 'Cost per square meter for complete road reconstruction'
    },
    so: {
      label: 'SO (Structural Overlay)',
      tooltip: 'Cost per square meter for structural overlay treatment'
    },
    sr: {
      label: 'SR (Surface Restoration)',
      tooltip: 'Cost per square meter for surface restoration'
    },
    rs: {
      label: 'RS (Restoration of Skid Resistance)',
      tooltip: 'Cost per square meter for skid resistance restoration'
    },
    rm: {
      label: 'RM (Routine Maintenance)',
      tooltip: 'Cost per square meter for routine maintenance'
    }
  };

  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 12 }}>
        Enter costs in Euros per square meter (€/sqm)
      </Text>
      
      {Object.entries(costLabels).map(([key, { label, tooltip }]) => (
        <ParameterInput
          key={key}
          label={label}
          value={costs[key as keyof CostInputs]}
          onChange={handleCostChange(key as keyof CostInputs)}
          tooltip={tooltip}
          prefix="€"
          suffix="/sqm"
          min={0}
          max={200}
          step={1}
          precision={0}
        />
      ))}
    </div>
  );
};

export default CostsSection;