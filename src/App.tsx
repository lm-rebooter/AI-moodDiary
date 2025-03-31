import React from 'react';
// import { RouterProvider } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { App as AntdApp } from 'antd';
import { ConfigProvider } from 'antd-mobile';

import zhCN from 'antd-mobile/es/locales/zh-CN';
import routes from './router';

console.log(routes);
import './App.css';

const App: React.FC = () => {
  const renderRoutes = (routes: any[]) => {
    return routes.map((route) => {
      if (route.children) {
        return (
          <Route key={route.path} path={route.path} element={route.element}>
            {renderRoutes(route.children)}
          </Route>
        );
      }
      return <Route key={route.path} path={route.path} element={route.element} />;
    });
  };

  return (
    <AntdApp>
      <ConfigProvider locale={zhCN}>
        <Router>
          <Routes>
            {renderRoutes(routes)}
          </Routes>
        </Router>
      </ConfigProvider>
    </AntdApp>
  );
};

export default App;
