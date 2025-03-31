import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TabBar } from 'antd-mobile';
import {
  AppOutline,
  MessageOutline,
  UnorderedListOutline,
  UserOutline,
} from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import styles from './MainLayout.module.less';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 路由变化时重置滚动位置
  useEffect(() => {
    window.scrollTo(0, 0);
    // 找到所有可滚动的容器并重置
    document.querySelectorAll('.scrollContent').forEach(element => {
      if (element instanceof HTMLElement) {
        element.scrollTop = 0;
      }
    });
  }, [location.pathname]);

  const tabs = [
    {
      key: '/home',
      title: '首页',
      icon: <AppOutline />,
    },
    {
      key: '/diary',
      title: '写日记',
      icon: <MessageOutline />,
    },
    {
      key: '/analysis',//  analysis statistics
      title: '统计',
      icon: <UnorderedListOutline />,
    },
    {
      key: '/profile',
      title: '我的',
      icon: <UserOutline />,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Outlet />
      </div>
      <TabBar
        className={styles.tabBar}
        activeKey={location.pathname}
        onChange={value => navigate(value)}
        safeArea
      >
        {tabs.map(item => (
          <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
        ))}
      </TabBar>
    </div>
  );
};

export default MainLayout; 