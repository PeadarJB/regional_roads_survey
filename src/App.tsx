// src/App.tsx
import React, { useEffect } from 'react';
import { Button, Layout, Spin, Switch, Typography, Space, Result } from 'antd';
import {
  LogoutOutlined,
  LoginOutlined,
  SunOutlined,
  MoonOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { ThemeProvider, useTheme } from 'antd-style';
import { usePavementStore } from './store/usePavementStore';
import { lightTheme, darkTheme } from './config/themeConfig';
import { useMobileDetection } from './hooks';
import Dashboard from './components/Dashboard';
import MobileDashboard from './components/MobileDashboard';

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
  const logout = usePavementStore((state) => state.logout);
  const user = usePavementStore((state) => state.user);
  const loading = usePavementStore((state) => state.loading);
  const fetchRoadNetworkData = usePavementStore(
    (state) => state.fetchRoadNetworkData,
  );
  const themeMode = usePavementStore((state) => state.themeMode);
  const setThemeMode = usePavementStore((state) => state.setThemeMode);
  const toggleParameterDrawer = usePavementStore(
    (state) => state.toggleParameterDrawer,
  );
  const isMobileView = useMobileDetection();
  const theme = useTheme();

  useEffect(() => {
    fetchRoadNetworkData();
  }, [fetchRoadNetworkData]);

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
            style={{
              borderColor: '#1890ff',
              color: '#1890ff',
            }}
          >
            {!isMobileView && 'Logout'}
          </Button>
        </Space>
      </Header>
      <Layout>
        {loading ? (
          <div
            style={{
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
