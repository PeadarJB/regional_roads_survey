// src/components/charts/DebouncedChart.tsx
// Wrapper to debounce chart updates and prevent rapid re-renders

import React, { useState, useEffect, useRef } from 'react';
import BarChart from './BarChart';
import ChartErrorBoundary from './ChartErrorBoundary';
import type { ChartData, ChartOptions } from 'chart.js';

interface DebouncedChartProps {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
  debounceMs?: number;
}

const DebouncedChart: React.FC<DebouncedChartProps> = ({ 
  data, 
  options, 
  debounceMs = 100 
}) => {
  const [debouncedData, setDebouncedData] = useState(data);
  const [debouncedOptions, setDebouncedOptions] = useState<ChartOptions<'bar'> | undefined>(options);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedData(data);
      setDebouncedOptions(options);
    }, debounceMs);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, options, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <ChartErrorBoundary>
      <BarChart data={debouncedData} options={debouncedOptions} />
    </ChartErrorBoundary>
  );
};

export default DebouncedChart;