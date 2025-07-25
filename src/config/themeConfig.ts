// src/config/themeConfig.ts
// This file defines the light and dark themes for the application using Ant Design's token system.
// It is based on the robust theme configuration from the reference TII Flood Risk Dashboard project.

import type { ThemeConfig } from 'antd';

/**
 * The light theme configuration for the application.
 */
export const lightTheme: ThemeConfig = {
  token: {
    // Brand Colors
    colorPrimary: '#0D47A1', // A deep, professional blue
    colorInfo: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',

    // Base Colors
    colorTextBase: '#333333',
    colorBgBase: '#ffffff',

    // Layout Colors
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f5f5',
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',

    // Font
    fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`,
    fontSize: 14,

    // Sizing
    borderRadius: 6,
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#ffffff',
    },
    Card: {
      headerBg: '#fafafa',
    },
  },
};

/**
 * The dark theme configuration for the application.
 */
export const darkTheme: ThemeConfig = {
  token: {
    // Brand Colors
    colorPrimary: '#1890ff', // A brighter blue for dark backgrounds
    colorInfo: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',

    // Base Colors
    colorTextBase: 'rgba(255, 255, 255, 0.85)',
    colorBgBase: '#000000',

    // Layout Colors
    colorBgContainer: '#141414',
    colorBgLayout: '#000000',
    colorBorder: '#424242',
    colorBorderSecondary: '#303030',

    // Font
    fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`,
    fontSize: 14,

    // Sizing
    borderRadius: 6,
  },
  components: {
    Layout: {
      headerBg: '#141414',
      siderBg: '#141414',
    },
    Card: {
      headerBg: '#1f1f1f',
    },
  },
};
