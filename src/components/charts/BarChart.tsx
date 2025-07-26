// src/components/charts/BarChart.tsx
// FIXED: Proper Chart.js registration and cleanup

import React, { useRef, useEffect } from 'react';
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

const BarChart: React.FC<BarChartProps> = ({ data, options, height = 250 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS<'bar'> | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!canvasRef.current) return;

    // FIXED: Destroy existing chart instance properly
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    // Create theme-aware default options
    const themeOptions: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
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
    };

    // Merge provided options with theme options
    const finalOptions = {
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

    try {
      // Create new chart instance
      chartRef.current = new ChartJS(canvasRef.current, {
        type: 'bar',
        data,
        options: finalOptions
      });
    } catch (error) {
      console.error('Error creating chart:', error);
    }

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, options, theme]);

  return (
    <div style={{ height: `${height}px`, position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default BarChart;