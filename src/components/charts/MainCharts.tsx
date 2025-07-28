// src/components/charts/MainCharts.tsx
// FIXED: Memoized chart data and options to prevent unnecessary recreations

import React, { useMemo, useCallback } from 'react';
import { Card } from 'antd';
import { usePavementStore } from '../../store/usePavementStore';
import DebouncedChart from './DebouncedChart';
import type { ChartData, ChartOptions, ChartEvent, ActiveElement } from 'chart.js';
import type { MaintenanceCategory } from '../../types';

// Constants moved outside component since they never change
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
  // FIXED: Use individual selectors to prevent infinite loops
  const categoryLengths = usePavementStore((state) => state.categoryLengths);
  const categoryCosts = usePavementStore((state) => state.categoryCosts);
  const selectedCategory = usePavementStore((state) => state.selectedCategory);
  const setSelectedCategory = usePavementStore((state) => state.setSelectedCategory);
  const isMobileView = usePavementStore((state) => state.isMobileView);

  // Memoize background colors calculation
  const backgroundColors = useMemo(() => {
    return CATEGORIES.map(cat => {
      const baseColor = CATEGORY_COLORS[cat];
      // If a category is selected, dim others
      if (selectedCategory) {
        return cat === selectedCategory ? baseColor : baseColor + '40'; // 40 = 25% opacity
      }
      return baseColor;
    });
  }, [selectedCategory]);

  // Memoize label calculation
  const chartLabels = useMemo(() => {
    return CATEGORIES.map(cat => {
      // Shorten labels for better display
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

  // Memoize length data
  const lengthData: ChartData<'bar'> = useMemo(() => ({
    labels: chartLabels,
    datasets: [{
      data: CATEGORIES.map(cat => categoryLengths[cat]),
      backgroundColor: backgroundColors,
      borderWidth: 0,
      barPercentage: 0.8,
      categoryPercentage: 0.9
    }]
  }), [chartLabels, categoryLengths, backgroundColors]);

  // Memoize costs data
  const costsData: ChartData<'bar'> = useMemo(() => ({
    labels: chartLabels,
    datasets: [{
      data: CATEGORIES.map(cat => categoryCosts[cat] / 1e9), // Convert to billions
      backgroundColor: backgroundColors,
      borderWidth: 0,
      barPercentage: 0.8,
      categoryPercentage: 0.9
    }]
  }), [chartLabels, categoryCosts, backgroundColors]);

  // Handle chart click with useCallback to prevent recreation
  const handleChartClick = useCallback((_event: ChartEvent, elements: ActiveElement[]) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      const clickedCategory = CATEGORIES[index];
      
      // Toggle selection
      if (selectedCategory === clickedCategory) {
        setSelectedCategory(null);
      } else {
        setSelectedCategory(clickedCategory);
      }
    } else {
      // Clicked outside bars - clear selection
      setSelectedCategory(null);
    }
  }, [selectedCategory, setSelectedCategory]);

  // Memoize chart options for length chart
  const lengthOptions: ChartOptions<'bar'> = useMemo(() => ({
    onClick: handleChartClick,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            const total = CATEGORIES.reduce((sum, cat) => sum + categoryLengths[cat], 0);
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
          display: !isMobileView,
          text: '% of Total'
        },
        ticks: {
          callback: function(value) {
            const total = CATEGORIES.reduce((sum, cat) => sum + categoryLengths[cat], 0);
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
            size: isMobileView ? 7 : 8
          }
        }
      }
    }
  }), [handleChartClick, categoryLengths, isMobileView]);

  // Memoize chart options for costs chart
  const costsOptions: ChartOptions<'bar'> = useMemo(() => ({
    onClick: handleChartClick,
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
          display: !isMobileView,
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
            size: isMobileView ? 7 : 8
          }
        }
      }
    }
  }), [handleChartClick, isMobileView]);

  // Mobile layout
  if (isMobileView) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 0' }}>
        <Card 
          title="Maintenance Category Length" 
          size="small"
          style={{ height: '280px' }} 
          styles={{ body: { height: 'calc(100% - 38px)' } }}
        >
          <DebouncedChart data={lengthData} options={lengthOptions} debounceMs={150} />
        </Card>
        <Card 
          title="Maintenance Category Costs" 
          size="small"
          style={{ height: '280px' }} 
          styles={{ body: { height: 'calc(100% - 38px)' } }}
        >
          <DebouncedChart data={costsData} options={costsOptions} debounceMs={150} />
        </Card>
      </div>
    );
  }

  // Desktop layout
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Card title="Maintenance Category Length" style={{ height: '100%' }} styles={{ body: { height: 'calc(100% - 57px)' } }}>
          <DebouncedChart data={lengthData} options={lengthOptions} debounceMs={150} />
        </Card>
      </div>
      <div style={{ flex: 1, minHeight: 0, marginTop: '16px' }}>
        <Card title="Maintenance Category Costs" style={{ height: '100%' }} styles={{ body: { height: 'calc(100% - 57px)' } }}>
          <DebouncedChart data={costsData} options={costsOptions} debounceMs={150} />
        </Card>
      </div>
    </div>
  );
};

export default MainCharts;