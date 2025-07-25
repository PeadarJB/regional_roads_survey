// src/App.tsx
// This is the main application component. It handles theming, authentication, and data loading.

import React, { useEffect } from 'react';
import { Button, Layout, Spin, Switch, Typography, Space, Result } from 'antd';
import { LogoutOutlined, LoginOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import { ThemeProvider } from 'antd-style';
import { usePavementStore } from './store/usePavementStore';
import { lightTheme, darkTheme } from './config/themeConfig';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

/**
 * The LoginScreen component is shown to unauthenticated users.
 */
const LoginScreen: React.FC = () => {
  const login = usePavementStore((state) => state.login);

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Result
        icon={<LoginOutlined />}
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
  const { logout, user } = usePavementStore((state) => ({
    logout: state.logout,
    user: state.user,
  }));
  const { loading, roadNetwork, fetchRoadNetworkData } = usePavementStore((state) => ({
    loading: state.loading,
    roadNetwork: state.roadNetwork,
    fetchRoadNetworkData: state.fetchRoadNetworkData,
  }));
  const { themeMode, setThemeMode } = usePavementStore((state) => ({
    themeMode: state.themeMode,
    setThemeMode: state.setThemeMode,
  }));

  // Fetch data on component mount
  useEffect(() => {
    fetchRoadNetworkData();
  }, [fetchRoadNetworkData]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
      <Content style={{ padding: '24px 48px' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 280, borderRadius: 8 }}>
          {loading ? (
            <div style={{ textAlign: 'center', paddingTop: 80 }}>
              <Spin size="large" tip="Loading Road Network Data..." />
            </div>
          ) : (
            <div>
              <Title level={3}>Data Loaded Successfully</Title>
              <Text>
                Total road segments loaded: <strong>{roadNetwork.length}</strong>
              </Text>
              <pre style={{ background: '#f5f5f5', padding: 16, marginTop: 16, borderRadius: 4, maxHeight: 400, overflow: 'auto' }}>
                {JSON.stringify(roadNetwork, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Content>
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
  const { themeMode, isAuthenticated } = usePavementStore((state) => ({
    themeMode: state.themeMode,
    isAuthenticated: state.isAuthenticated,
  }));

  return (
    <ThemeProvider theme={themeMode === 'dark' ? darkTheme : lightTheme}>
      {isAuthenticated ? <MainDashboard /> : <LoginScreen />}
    </ThemeProvider>
  );
};

export default App;
