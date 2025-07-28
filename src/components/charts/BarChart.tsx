// src/components/charts/BarChart.tsx
// COMPLETELY REWRITTEN: Using ref callback and defensive DOM handling

import React, { useRef, useCallback, useEffect } from 'react';
import { useTheme } from 'antd-style';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController, 
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions, ChartData } from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController, 
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
  height?: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, options }) => {
  const chartRef = useRef<ChartJS<'bar'> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();

  // Create theme-aware default options
  const getThemeOptions = useCallback((): ChartOptions<'bar'> => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme.colorBgElevated || 'rgba(0, 0, 0, 0.8)',
        titleColor: theme.colorText || '#fff',
        bodyColor: theme.colorText || '#fff',
        borderColor: theme.colorBorder || '#333',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return label ? `${label}: ${value}` : `${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: theme.colorBorderSecondary
        },
        ticks: {
          color: theme.colorTextSecondary,
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: theme.colorBorderSecondary
        },
        ticks: {
          color: theme.colorTextSecondary,
          font: {
            size: 11
          }
        }
      }
    }
  }), [theme]);

  // Safe chart destruction
  const destroyChart = useCallback(() => {
    if (chartRef.current) {
      try {
        chartRef.current.destroy();
      } catch (error) {
        console.warn('Error destroying chart:', error);
      } finally {
        chartRef.current = null;
      }
    }
  }, []);

  // Create or update chart
  const createOrUpdateChart = useCallback(() => {
    if (!containerRef.current) return;

    const canvas = containerRef.current.querySelector('canvas');
    if (!canvas) return;

    try {
      const themeOptions = getThemeOptions();
      const finalOptions: ChartOptions<'bar'> = {
        ...themeOptions,
        ...options,
        plugins: {
          ...themeOptions.plugins,
          ...options?.plugins
        },
        scales: {
          ...themeOptions.scales,
          ...options?.scales
        }
      };

      if (chartRef.current) {
        // Update existing chart
        chartRef.current.data = data;
        chartRef.current.options = finalOptions;
        chartRef.current.update('none');
      } else {
        // Create new chart
        chartRef.current = new ChartJS(canvas, {
          type: 'bar',
          data,
          options: finalOptions
        });
      }
    } catch (error) {
      console.error('Error creating/updating chart:', error);
      destroyChart();
    }
  }, [data, options, getThemeOptions, destroyChart]);

  // Ref callback for the container
  const containerRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (containerRef.current !== node) {
      // Clean up previous chart if container changed
      if (containerRef.current) {
        destroyChart();
      }
      
      containerRef.current = node;
      
      if (node) {
        // Create canvas if it doesn't exist
        let canvas = node.querySelector('canvas');
        if (!canvas) {
          canvas = document.createElement('canvas');
          node.appendChild(canvas);
        }
        
        // Initialize chart
        setTimeout(() => createOrUpdateChart(), 0);
      }
    }
  }, [destroyChart, createOrUpdateChart]);

  // Update chart when data or options change
  useEffect(() => {
    if (containerRef.current) {
      createOrUpdateChart();
    }
  }, [createOrUpdateChart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyChart();
    };
  }, [destroyChart]);

  return (
    <div 
      ref={containerRefCallback}
      style={{ 
        height: '100%', 
        width: '100%', 
        position: 'relative',
        overflow: 'hidden'
      }}
    />
  );
};

export default BarChart;