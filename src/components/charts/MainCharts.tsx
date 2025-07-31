// src/components/charts/MainCharts.tsx
// UPDATED: Removed all onClick functionality from the charts to prevent the 'removeChild' error and stabilize the component.
// The interactive filtering feature is now disabled pending a more robust solution.

import React, { useMemo } from 'react';
import { Card } from 'antd';
import { usePavementStore } from '../../store/usePavementStore';
import BarChart from './BarChart';
import type { ChartData, ChartOptions } from 'chart.js';
import type { MaintenanceCategory } from '../../types';
import { useTheme } from 'antd-style';
import ChartErrorBoundary from './ChartErrorBoundary';

const CATEGORIES: MaintenanceCategory[] = [
  'Road Reconstruction',
  'Structural Overlay',
  'Surface Restoration',
  'Restoration of Skid Resistance',
  'Routine Maintenance'
];

const CATEGORY_COLORS = {
  'Road Reconstruction': '#ff4d4f',
  'Structural Overlay': '#ff7a45',
  'Surface Restoration': '#40a9ff',
  'Restoration of Skid Resistance': '#73d13d',
  'Routine Maintenance': '#36cfc9'
} as const;

const MainCharts: React.FC = () => {
  const categoryLengths = usePavementStore((state) => state.categoryLengths);
  const categoryCosts = usePavementStore((state) => state.categoryCosts);
  const isMobileView = usePavementStore((state) => state.isMobileView);
  const theme = useTheme();

  // Simplified background colors - no longer changes on click
  const backgroundColors = useMemo(() => {
    return CATEGORIES.map(cat => CATEGORY_COLORS[cat]);
  }, []);

  const chartLabels = useMemo(() => {
    return CATEGORIES.map(cat => {
      const shortLabels: Record<MaintenanceCategory, string> = {
        'Road Reconstruction': isMobileView ? 'ROAD\nRECON' : 'ROAD RECONSTRUCTION',
        'Structural Overlay': isMobileView ? 'STRUCT\nOVERLAY' : 'STRUCTURAL OVERLAY',
        'Surface Restoration': isMobileView ? 'SURFACE\nRESTORE' : 'SURFACE RESTORATION',
        'Restoration of Skid Resistance': isMobileView ? 'SKID\nRESIST' : 'RESTORATION OF SKID\nRESISTANCE',
        'Routine Maintenance': isMobileView ? 'ROUTINE\nMAINT' : 'ROUTINE MAINTENANCE'
      };
      return shortLabels[cat];
    });
  }, [isMobileView]);

  const lengthData: ChartData<'bar'> = useMemo(() => ({
    labels: chartLabels,
    datasets: [{
      label: 'Length',
      data: CATEGORIES.map(cat => categoryLengths[cat]),
      backgroundColor: backgroundColors,
      borderWidth: 0,
      barPercentage: 0.8,
      categoryPercentage: 0.9
    }]
  }), [chartLabels, categoryLengths, backgroundColors]);

  const costsData: ChartData<'bar'> = useMemo(() => ({
    labels: chartLabels,
    datasets: [{
      label: 'Cost',
      data: CATEGORIES.map(cat => categoryCosts[cat] / 1e9),
      backgroundColor: backgroundColors,
      borderWidth: 0,
      barPercentage: 0.8,
      categoryPercentage: 0.9
    }]
  }), [chartLabels, categoryCosts, backgroundColors]);

  // Base options object without the onClick handler
  const baseOptions: ChartOptions<'bar'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: theme.colorBgElevated,
        titleColor: theme.colorText,
        bodyColor: theme.colorText,
        borderColor: theme.colorBorder,
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: { display: false, color: theme.colorBorderSecondary },
        ticks: { color: theme.colorTextSecondary, font: { size: isMobileView ? 7 : 8 }, maxRotation: 0, minRotation: 0, autoSkip: false }
      },
      y: {
        grid: { color: theme.colorBorderSecondary },
        ticks: { color: theme.colorTextSecondary, font: { size: 11 } },
        beginAtZero: true
      }
    }
  }), [theme, isMobileView]);

  const lengthOptions: ChartOptions<'bar'> = useMemo(() => ({
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        ...baseOptions.plugins?.tooltip,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            const total = CATEGORIES.reduce((sum, cat) => sum + categoryLengths[cat], 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return [`Length: ${value.toFixed(0)} km`, `Percentage: ${percentage}%`];
          }
        }
      }
    },
    scales: {
      ...baseOptions.scales,
      y: {
        ...baseOptions.scales?.y,
        title: { display: !isMobileView, text: '% of Total' },
        ticks: {
          ...baseOptions.scales?.y?.ticks,
          callback: function(value) {
            const total = CATEGORIES.reduce((sum, cat) => sum + categoryLengths[cat], 0);
            const percentage = total > 0 ? ((Number(value) / total) * 100).toFixed(0) : '0';
            return percentage + '%';
          }
        }
      }
    }
  }), [baseOptions, categoryLengths, isMobileView]);

  const costsOptions: ChartOptions<'bar'> = useMemo(() => ({
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        ...baseOptions.plugins?.tooltip,
        callbacks: {
          label: (context) => `Cost: €${context.parsed.y.toFixed(2)}B`
        }
      }
    },
    scales: {
      ...baseOptions.scales,
      y: {
        ...baseOptions.scales?.y,
        title: { display: !isMobileView, text: 'Cost (bil)' },
        ticks: {
          ...baseOptions.scales?.y?.ticks,
          callback: (value) => '€' + Number(value).toFixed(1) + 'B'
        }
      }
    }
  }), [baseOptions, isMobileView]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: isMobileView ? 16 : 0, paddingTop: isMobileView ? 16 : 0 }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Card id="length-chart-card" title="Maintenance Category Length" style={{ height: '100%' }} styles={{ body: { height: `calc(100% - ${isMobileView ? '38px' : '57px'})` } }} size={isMobileView ? 'small' : 'default'}>
          <ChartErrorBoundary>
            <BarChart datasetIdKey="lengthChart" data={lengthData} options={lengthOptions} />
          </ChartErrorBoundary>
        </Card>
      </div>
      <div style={{ flex: 1, minHeight: 0, marginTop: isMobileView ? 0 : '16px' }}>
        <Card id="costs-chart-card" title="Maintenance Category Costs" style={{ height: '100%' }} styles={{ body: { height: `calc(100% - ${isMobileView ? '38px' : '57px'})` } }} size={isMobileView ? 'small' : 'default'}>
          <ChartErrorBoundary>
            <BarChart datasetIdKey="costsChart" data={costsData} options={costsOptions} />
          </ChartErrorBoundary>
        </Card>
      </div>
    </div>
  );
};

export default MainCharts;
