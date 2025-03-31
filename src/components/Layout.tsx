import React from 'react';
import { Layout as AntLayout } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, BookOutlined, BarChartOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';

const { Content } = AntLayout;

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页'
    },
    {
      key: '/diary',
      icon: <BookOutlined />,
      label: '日记'
    },
    {
      key: '/analysis',
      icon: <RobotOutlined />,
      label: 'AI分析'
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '我的'
    }
  ];

  return (
    <AntLayout className="min-h-screen bg-gray-50">
      <Content className="pb-16">
        <Outlet />
      </Content>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center h-16">
          {menuItems.map(item => (
            <div
              key={item.key}
              className={`flex flex-col items-center cursor-pointer ${
                location.pathname === item.key ? 'text-blue-500' : 'text-gray-500'
              }`}
              onClick={() => navigate(item.key)}
            >
              {React.cloneElement(item.icon as React.ReactElement, {
                className: 'text-xl mb-1'
              })}
              <span className="text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </AntLayout>
  );
}; 