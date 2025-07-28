// src/components/charts/ChartErrorBoundary.tsx
// Error boundary to catch and handle Chart.js DOM manipulation errors

import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { Result, Button } from 'antd';
import { ReloadOutlined, WarningOutlined } from '@ant-design/icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    console.error('Chart Error Boundary caught an error:', error, errorInfo);
    
    // Check if it's the specific DOM removeChild error we're trying to handle
    if (error.message.includes('removeChild') || error.message.includes('Node')) {
      console.warn('Chart DOM manipulation error caught and handled by error boundary');
    }
  }

  handleRetry = () => {
    // Reset the error state to try rendering again
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div style={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '200px'
        }}>
          <Result
            icon={<WarningOutlined style={{ color: '#faad14' }} />}
            title="Chart Loading Error"
            subTitle="There was an issue rendering the chart. Please try refreshing."
            extra={
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={this.handleRetry}
                size="small"
              >
                Retry
              </Button>
            }
            style={{ padding: '20px' }}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;