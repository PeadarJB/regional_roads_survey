// src/components/charts/BarChart.tsx
// UPDATED: Added `datasetIdKey` to the props to allow it to be passed to the underlying <Bar> component.

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions, ChartData } from 'chart.js';

// Register the necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: ChartData<'bar'>;
  options: ChartOptions<'bar'>;
  datasetIdKey?: string; // Added this prop
}

const BarChart: React.FC<BarChartProps> = ({ data, options, datasetIdKey }) => {
  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <Bar data={data} options={options} datasetIdKey={datasetIdKey} />
    </div>
  );
};

export default BarChart;
