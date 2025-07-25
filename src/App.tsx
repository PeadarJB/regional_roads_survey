// src/App.tsx
// FIXED: Optimized selectors to prevent unnecessary re-renders

import React, { useEffect } from 'react';
import { Button, Layout, Spin, Switch, Typography, Space, Result } from 'antd';
import { LogoutOutlined, LoginOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import { ThemeProvider, useTheme } from 'antd-style';
import { usePavementStore } from './store/usePavementStore';
import { lightTheme, darkTheme } from './config/themeConfig';
import Dashboard from './components/Dashboard';

const { Header, Footer } = Layout;
const { Title, Text } = Typography;

/**
 * The LoginScreen component is shown to unauthenticated users.
 */
const LoginScreen: React.FC = () => {
  const login = usePavementStore((state) => state.login);
  const theme = useTheme();

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.colorBgLayout }}>
      <Result
        icon={<LoginOutlined style={{ color: theme.colorPrimary }}/>}
        title="Regional Roads Survey Dashboard"
        subTitle="Please log in to access the dashboard."
        extra={
          <Button type="primary" size="large" onClick={() => login({ username: 'RMO_User' })}>
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
  // Optimized selectors - extract individual values instead of creating objects
  const logout = usePavementStore((state) => state.logout);
  const user = usePavementStore((state) => state.user);
  const loading = usePavementStore((state) => state.loading);
  const fetchRoadNetworkData = usePavementStore((state) => state.fetchRoadNetworkData);
  const themeMode = usePavementStore((state) => state.themeMode);
  const setThemeMode = usePavementStore((state) => state.setThemeMode);

  // Fetch data on component mount
  useEffect(() => {
    fetchRoadNetworkData();
  }, [fetchRoadNetworkData]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <Title level={4} style={{ color: 'white', margin: 0 }}>
          RMO Dashboard
        </Title>
        <Space>
          <Text style={{ color: 'white' }}>Welcome, {user?.username}</Text>
          <Switch
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            checked={themeMode === 'dark'}
            onChange={(checked) => setThemeMode(checked ? 'dark' : 'light')}
          />
          <Button ghost icon={<LogoutOutlined />} onClick={logout}>
            Logout
          </Button>
        </Space>
      </Header>
      <Layout>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 128px)' }}>
            <Spin size="large" tip="Loading Road Network Data..." />
          </div>
        ) : (
          <Dashboard />
        )}
      </Layout>
      <Footer style={{ textAlign: 'center' }}>
        Regional Roads Survey ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

/**
 * The root component that provides the theme and handles the authentication check.
 */
const App: React.FC = () => {
  // Optimized selectors
  const themeMode = usePavementStore((state) => state.themeMode);
  const isAuthenticated = usePavementStore((state) => state.isAuthenticated);

  return (
    <ThemeProvider theme={themeMode === 'dark' ? darkTheme : lightTheme}>
      {isAuthenticated ? <MainDashboard /> : <LoginScreen />}
    </ThemeProvider>
  );
};

export default App;