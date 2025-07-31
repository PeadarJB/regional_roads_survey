// src/App.tsx
// UPDATED: Implemented the "Generate Report" dropdown and its handler functions.

import React, { useEffect } from 'react';
import { Button, Layout, Spin, Switch, Typography, Space, Result, Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import {
  LogoutOutlined,
  LoginOutlined,
  SunOutlined,
  MoonOutlined,
  MenuOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { ThemeProvider, useTheme } from 'antd-style';
import { usePavementStore } from './store/usePavementStore';
import { lightTheme, darkTheme } from './config/themeConfig';
import { useMobileDetection } from './hooks';
import Dashboard from './components/Dashboard';
import MobileDashboard from './components/MobileDashboard';
import { generatePdfReport, generateCsvReport } from './utils/reportGenerator';
import type { MaintenanceCategory } from './types';

const { Header } = Layout;
const { Title, Text } = Typography;

/**
 * The LoginScreen component is shown to unauthenticated users.
 */
const LoginScreen: React.FC = () => {
  const login = usePavementStore((state) => state.login);
  const theme = useTheme();

  return (
    <Layout
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.colorBgLayout,
      }}
    >
      <Result
        icon={<LoginOutlined style={{ color: theme.colorPrimary }} />}
        title="Regional Roads Survey Dashboard"
        subTitle="Please log in to access the dashboard."
        extra={
          <Button
            type="primary"
            size="large"
            onClick={() => login({ username: 'RMO_User' })}
          >
            Log In
          </Button>
        }
      />
    </Layout>
  );
};

/**
 * The MainDashboard component is the core application UI for authenticated users.
 */
const MainDashboard: React.FC = () => {
  // Select all necessary state and actions from the store
  const {
    logout,
    user,
    loading,
    fetchRoadNetworkData,
    themeMode,
    setThemeMode,
    toggleParameterDrawer,
    isGeneratingReport,
    setIsGeneratingReport,
    totalCost,
    totalLength,
    selectedCounty,
    parameters,
    costs,
    categoryLengths,
    categoryCosts,
  } = usePavementStore();

  const isMobileView = useMobileDetection();
  const theme = useTheme();

  useEffect(() => {
    fetchRoadNetworkData();
  }, [fetchRoadNetworkData]);

  const handleGeneratePdf = async () => {
    setIsGeneratingReport(true);
    message.loading({ content: 'Generating PDF Report...', key: 'report' });
    try {
      const reportData: ReportData = {
        totalCost,
        totalLength,
        selectedCounty,
        parameters,
        costs,
        categoryLengths,
        categoryCosts,
      };
      await generatePdfReport(reportData);
      message.success({ content: 'PDF Report downloaded!', key: 'report', duration: 2 });
    } catch (error) {
      console.error("Failed to generate PDF report:", error);
      message.error({ content: 'Failed to generate PDF.', key: 'report', duration: 2 });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleGenerateCsv = () => {
    setIsGeneratingReport(true);
    try {
      const reportData: ReportData = {
        totalCost,
        totalLength,
        selectedCounty,
        parameters,
        costs,
        categoryLengths,
        categoryCosts,
      };
      generateCsvReport(reportData);
    } catch (error) {
      console.error("Failed to generate CSV report:", error);
      message.error('Failed to generate CSV.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'pdf',
      label: 'Download PDF Report',
      icon: <FilePdfOutlined />,
      onClick: handleGeneratePdf,
    },
    {
      key: 'csv',
      label: 'Download CSV Data',
      icon: <FileExcelOutlined />,
      onClick: handleGenerateCsv,
    },
  ];

  const headerTextColor = themeMode === 'light' ? 'black' : 'white';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${isMobileView ? '16px' : '24px'}`,
          background: theme.colorBgContainer,
          borderBottom: `1px solid ${theme.colorBorder}`,
        }}
      >
        <Space>
          {isMobileView && (
            <Button
              icon={<MenuOutlined />}
              onClick={toggleParameterDrawer}
              aria-label="Toggle parameters drawer"
            />
          )}
          <Title level={4} style={{ color: headerTextColor, margin: 0 }}>
            RMO Dashboard
          </Title>
        </Space>
        <Space>
          {!isMobileView && (
            <Text style={{ color: headerTextColor }}>
              Welcome, {user?.username}
            </Text>
          )}
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <Button icon={<DownloadOutlined />} loading={isGeneratingReport}>
              Generate Report
            </Button>
          </Dropdown>
          <Switch
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            checked={themeMode === 'dark'}
            onChange={(checked) => setThemeMode(checked ? 'dark' : 'light')}
          />
          <Button
            type="primary"
            ghost
            icon={<LogoutOutlined />}
            onClick={logout}
          >
            {!isMobileView && 'Logout'}
          </Button>
        </Space>
      </Header>
      <Layout>
        {loading ? (
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'calc(100vh - 64px)',
            }}
          >
            <Spin size="large" tip="Loading Road Network Data..." />
          </div>
        ) : isMobileView ? (
          <MobileDashboard />
        ) : (
          <Dashboard />
        )}
      </Layout>
    </Layout>
  );
};

/**
 * The root component that provides the theme and handles the authentication check.
 */
const App: React.FC = () => {
  const themeMode = usePavementStore((state) => state.themeMode);
  const isAuthenticated = usePavementStore((state) => state.isAuthenticated);

  return (
    <ThemeProvider theme={themeMode === 'dark' ? darkTheme : lightTheme}>
      {isAuthenticated ? <MainDashboard /> : <LoginScreen />}
    </ThemeProvider>
  );
};

export default App;
