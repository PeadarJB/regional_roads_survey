// src/App.tsx
// FIXED: Corrected Spin logic to allow dashboard to render and initialize.
import React from 'react';
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
import { generatePdfReport, generateCsvReport, type ReportData } from './utils/reportGenerator';

const { Header } = Layout;
const { Title, Text } = Typography;

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
      <div style={{ textAlign: 'center' }}>
        <Space size="large" style={{ marginBottom: 32 }}>
          <img src="/img/DoT_Logo.png" alt="Department of Transport, Tourism and Sport" style={{ height: 40 }} />
          <img src="/img/RMO-Logo-rebrand.jpg" alt="Regional & Local Roads Management Office" style={{ height: 40 }} />
          <img src="/img/PMS-Logo.png" alt="PMS" style={{ height: 40 }} />
        </Space>
        <Result
          icon={<LoginOutlined style={{ color: theme.colorPrimary }} />}
          title="Regional Roads Survey Dashboard"
          subTitle="Please log in to access the dashboard."
          extra={<Button type="primary" size="large" onClick={() => login({ username: 'RMO_User' })}>Log In</Button>}
        />
      </div>
    </Layout>
  );
};

const MainDashboard: React.FC = () => {
  const {
    logout,
    user,
    mapView,
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

  const handleGeneratePdf = async () => {
    setIsGeneratingReport(true);
    message.loading({ content: 'Generating PDF Report...', key: 'report' });
    try {
      const reportData: ReportData = { totalCost, totalLength, selectedCounty, parameters, costs, categoryLengths, categoryCosts };
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
      const reportData: ReportData = { totalCost, totalLength, selectedCounty, parameters, costs, categoryLengths, categoryCosts };
      generateCsvReport(reportData);
      message.success('CSV Data downloaded!');
    } catch (error) {
      console.error("Failed to generate CSV report:", error);
      message.error('Failed to generate CSV.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const menuItems: MenuProps['items'] = [
    { key: 'pdf', label: 'Download PDF Report', icon: <FilePdfOutlined />, onClick: handleGeneratePdf },
    { key: 'csv', label: 'Download CSV Data', icon: <FileExcelOutlined />, onClick: handleGenerateCsv },
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
          {isMobileView && <Button icon={<MenuOutlined />} onClick={toggleParameterDrawer} aria-label="Toggle parameters drawer" />}
          {!isMobileView && (
            <>
              <img src="/img/DoT_Logo.png" alt="DTTS" style={{ height: 32, marginRight: 8 }} />
              <img src="/img/RMO-Logo-rebrand.jpg" alt="RMO" style={{ height: 32, marginRight: 8 }} />
              <img src="/img/PMS-Logo.png" alt="PMS" style={{ height: 32, marginRight: 16 }} />
              <Title level={4} style={{ color: headerTextColor, margin: 0 }}>RMO Dashboard</Title>
            </>
          )}
        </Space>
        <Space>
          {!isMobileView && <Text style={{ color: headerTextColor }}>Welcome, {user?.username}</Text>}
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <Button icon={<DownloadOutlined />} loading={isGeneratingReport}>{!isMobileView && 'Generate Report'}</Button>
          </Dropdown>
          <Switch
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            checked={themeMode === 'dark'}
            onChange={(checked) => setThemeMode(checked ? 'dark' : 'light')}
          />
          <Button type="primary" ghost icon={<LogoutOutlined />} onClick={logout}>{!isMobileView && 'Logout'}</Button>
        </Space>
      </Header>
      <Layout>
        <Spin spinning={!mapView} tip="Initializing Map & Data..." size="large">
          <div style={{ height: 'calc(100vh - 64px)'}}>
            {isMobileView ? <MobileDashboard /> : <Dashboard />}
          </div>
        </Spin>
      </Layout>
    </Layout>
  );
};

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