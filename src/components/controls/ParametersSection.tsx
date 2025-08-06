// src/components/controls/ParametersSection.tsx
import React from 'react';
import { Typography, Divider } from 'antd';
import { usePavementStore } from '../../store/usePavementStore';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';
import ParameterInput from './ParameterInput';
import type { MaintenanceParameters } from '../../types';

const { Text } = Typography;

const ParametersSection: React.FC = () => {
  const parameters = usePavementStore((state) => state.parameters);
  const setParameters = usePavementStore((state) => state.setParameters);

  // No explicit type needed here anymore!
  const debouncedSetParameters = useDebouncedCallback(setParameters, 300);

  const handleParameterChange = (key: keyof MaintenanceParameters) => (value: number | null) => {
    if (value !== null) {
      debouncedSetParameters({ [key]: value });
    }
  };

  return (
    <div>
      {/* Road Reconstruction Section */}
      <Text strong style={{ display: 'block', marginBottom: 12 }}>
        Road Reconstruction
      </Text>
      <ParameterInput
        label="IRI ≥"
        value={parameters.roadReconstruction_iri}
        onChange={handleParameterChange('roadReconstruction_iri')}
        tooltip="International Roughness Index - measures road bumpiness"
        min={0}
        max={20}
        step={0.5}
      />
      <ParameterInput
        label="RUT ≥"
        value={parameters.roadReconstruction_rut}
        onChange={handleParameterChange('roadReconstruction_rut')}
        tooltip="Rut depth in mm - indicates structural damage"
        suffix="mm"
        min={0}
        max={50}
        step={1}
        precision={0}
      />
      <ParameterInput
        label="PSCI ≤"
        value={parameters.roadReconstruction_psci}
        onChange={handleParameterChange('roadReconstruction_psci')}
        tooltip="Pavement Surface Condition Index (1-10, lower is worse)"
        min={1}
        max={10}
        step={1}
        precision={0}
      />
      <Divider style={{ margin: '16px 0' }} />

      {/* Structural Overlay Section */}
      <Text strong style={{ display: 'block', marginBottom: 12 }}>
        Structural Overlay
      </Text>
      <ParameterInput
        label="IRI ≥"
        value={parameters.structuralOverlay_iri}
        onChange={handleParameterChange('structuralOverlay_iri')}
        tooltip="International Roughness Index threshold"
        min={0}
        max={20}
        step={0.5}
      />
      <ParameterInput
        label="RUT ≥"
        value={parameters.structuralOverlay_rut}
        onChange={handleParameterChange('structuralOverlay_rut')}
        tooltip="Rut depth threshold in mm"
        suffix="mm"
        min={0}
        max={50}
        step={1}
        precision={0}
      />
      <ParameterInput
        label="PSCI ≤"
        value={parameters.structuralOverlay_psci}
        onChange={handleParameterChange('structuralOverlay_psci')}
        tooltip="Pavement Surface Condition Index threshold"
        min={1}
        max={10}
        step={1}
        precision={0}
      />
      <Divider style={{ margin: '16px 0' }} />

      {/* Surface Restoration Section */}
      <Text strong style={{ display: 'block', marginBottom: 12 }}>
        Surface Restoration
      </Text>
      <ParameterInput
        label="PSCI ≤ (A)"
        value={parameters.surfaceRestoration_psci_a}
        onChange={handleParameterChange('surfaceRestoration_psci_a')}
        tooltip="Primary PSCI threshold"
        min={1}
        max={10}
        step={1}
        precision={0}
      />
      <ParameterInput
        label="PSCI ≤ (B) & IRI ≥"
        value={parameters.surfaceRestoration_psci_b}
        onChange={handleParameterChange('surfaceRestoration_psci_b')}
        tooltip="Secondary PSCI threshold (combined with IRI)"
        min={1}
        max={10}
        step={1}
        precision={0}
      />
      <ParameterInput
        label="IRI ≥"
        value={parameters.surfaceRestoration_iri}
        onChange={handleParameterChange('surfaceRestoration_iri')}
        tooltip="IRI threshold (combined with PSCI B)"
        min={0}
        max={20}
        step={0.5}
      />
      <ParameterInput
        label="PSCI ≤ (C)"
        value={parameters.surfaceRestoration_psci_c}
        onChange={handleParameterChange('surfaceRestoration_psci_c')}
        tooltip="Tertiary PSCI threshold"
        min={1}
        max={10}
        step={1}
        precision={0}
      />
      <Divider style={{ margin: '16px 0' }} />

      {/* Restoration of Skid Resistance Section */}
      <Text strong style={{ display: 'block', marginBottom: 12 }}>
        Restoration of Skid Resistance
      </Text>
      <ParameterInput
        label="PSCI ≤ (A)"
        value={parameters.skidResistance_psci_a}
        onChange={handleParameterChange('restorationOfSkidResistance_psci_a')}
        tooltip="Primary PSCI threshold for skid resistance"
        min={1}
        max={10}
        step={1}
        precision={0}
      />
      <ParameterInput
        label="PSCI ≤ (B) & CSC ≤"
        value={parameters.skidResistance_psci_b}
        onChange={handleParameterChange('restorationOfSkidResistance_psci_b')}
        tooltip="Secondary PSCI threshold (combined with CSC)"
        min={1}
        max={10}
        step={1}
        precision={0}
      />
      <ParameterInput
        label="CSC ≤"
        value={parameters.skidResistance_csc}
        onChange={handleParameterChange('restorationOfSkidResistance_csc')}
        tooltip="Characteristic SCRIM Coefficient - skid resistance measure"
        min={0}
        max={1}
        step={0.01}
        precision={2}
      />
      <ParameterInput
        label="PSCI ≤ (C) & MPD ≤"
        value={parameters.skidResistance_psci_c}
        onChange={handleParameterChange('restorationOfSkidResistance_psci_c')}
        tooltip="Tertiary PSCI threshold (combined with MPD)"
        min={1}
        max={10}
        step={1}
        precision={0}
      />
      <ParameterInput
        label="MPD ≤"
        value={parameters.skidResistance_mpd}
        onChange={handleParameterChange('restorationOfSkidResistance_mpd')}
        tooltip="Mean Profile Depth - texture depth measure"
        suffix="mm"
        min={0}
        max={2}
        step={0.01}
        precision={2}
      />
    </div>
  );
};

export default ParametersSection;