// src/components/charts/MainCharts.tsx
// This component contains the primary bar charts for the dashboard.

import React from 'react';
import { Card, Space } from 'antd';
import { usePavementStore } from '../../store/usePavementStore';
import BarChart from './BarChart';
import type { ChartData, ChartOptions } from 'chart.js';
import type { MaintenanceCategory } from '../../types';

const MainCharts: React.FC = () => {
  // Get calculated data from the store
  const { categoryLengths, categoryCosts } = usePavementStore((state) => ({
    categoryLengths: state.categoryLengths,
    categoryCosts: state.categoryCosts
  }));

  // Define category order and colors
  const categories: MaintenanceCategory[] = [
    'Road Reconstruction',
    'Structural Overlay',
    'Surface Restoration',
    'Restoration of Skid Resistance',
    'Routine Maintenance'
  ];

  const categoryColors = {
    'Road Reconstruction': '#ff4d4f',
    'Structural Overlay': '#ff7a45',
    'Surface Restoration': '#40a9ff',
    'Restoration of Skid Resistance': '#73d13d',
    'Routine Maintenance': '#36cfc9'
  };

  // Prepare data for the length chart
  const lengthData: ChartData<'bar'> = {
    labels: categories.map(cat => {
      // Shorten labels for better display
      const shortLabels: Record<MaintenanceCategory, string> = {
        'Road Reconstruction': 'ROAD RECONSTRUCTION',
        'Structural Overlay': 'STRUCTURAL OVERLAY',
        'Surface Restoration': 'SURFACE RESTORATION',
        'Restoration of Skid Resistance': 'RESTORATION OF SKID\nRESISTANCE',
        'Routine Maintenance': 'ROUTINE MAINTENANCE'
      };
      return shortLabels[cat];
    }),
    datasets: [{
      data: categories.map(cat => categoryLengths[cat]),
      backgroundColor: categories.map(cat => categoryColors[cat]),
      borderWidth: 0,
      barPercentage: 0.8,
      categoryPercentage: 0.9
    }]
  };

  // Prepare data for the costs chart
  const costsData: ChartData<'bar'> = {
    labels: categories.map(cat => {
      // Shorten labels for better display
      const shortLabels: Record<MaintenanceCategory, string> = {
        'Road Reconstruction': 'ROAD RECONSTRUCTION',
        'Structural Overlay': 'STRUCTURAL OVERLAY',
        'Surface Restoration': 'SURFACE RESTORATION',
        'Restoration of Skid Resistance': 'RESTORATION OF SKID\nRESISTANCE',
        'Routine Maintenance': 'ROUTINE MAINTENANCE'
      };
      return shortLabels[cat];
    }),
    datasets: [{
      data: categories.map(cat => categoryCosts[cat] / 1e9), // Convert to billions
      backgroundColor: categories.map(cat => categoryColors[cat]),
      borderWidth: 0,
      barPercentage: 0.8,
      categoryPercentage: 0.9
    }]
  };

  // Chart options for length chart
  const lengthOptions: ChartOptions<'bar'> = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            const total = categories.reduce((sum, cat) => sum + categoryLengths[cat], 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return [
              `Length: ${value.toFixed(0)} km`,
              `Percentage: ${percentage}%`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '% of Total'
        },
        ticks: {
          callback: function(value) {
            const total = categories.reduce((sum, cat) => sum + categoryLengths[cat], 0);
            const percentage = total > 0 ? ((Number(value) / total) * 100).toFixed(0) : '0';
            return percentage + '%';
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          autoSkip: false,
          font: {
            size: 10
          }
        }
      }
    }
  };

  // Chart options for costs chart
  const costsOptions: ChartOptions<'bar'> = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return `Cost: €${value.toFixed(2)}B`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cost (bil)'
        },
        ticks: {
          callback: function(value) {
            return '€' + Number(value).toFixed(1) + 'B';
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          autoSkip: false,
          font: {
            size: 10
          }
        }
      }
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card title="Maintenance Category Length">
        <BarChart data={lengthData} options={lengthOptions} height={250} />
      </Card>
      <Card title="Maintenance Category Costs">
        <BarChart data={costsData} options={costsOptions} height={250} />
      </Card>
    </Space>
  );
};

export default MainCharts;