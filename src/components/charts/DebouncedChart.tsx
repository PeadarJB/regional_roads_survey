// src/components/charts/DebouncedChart.tsx
// FIXED: Provided a default value for the options prop to prevent passing `undefined` to the BarChart component.

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
  options = {}, // Default options to an empty object if not provided
  debounceMs = 100 
}) => {
  const [debouncedData, setDebouncedData] = useState(data);
  // Initialize state with a guaranteed value, preventing it from being undefined.
  const [debouncedOptions, setDebouncedOptions] = useState<ChartOptions<'bar'>>(options);
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

  // Cleanup on unmount - this effect can be combined with the one above, but is fine as is.
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <ChartErrorBoundary>
      {/* This is now type-safe as debouncedOptions is guaranteed to be an object. */}
      <BarChart data={debouncedData} options={debouncedOptions} />
    </ChartErrorBoundary>
  );
};

export default DebouncedChart;
