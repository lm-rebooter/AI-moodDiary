import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TabBar } from 'antd-mobile';
import {
  AppOutline,
  ContentOutline,
  HistogramOutline,
  UserOutline,
} from 'antd-mobile-icons';
import styles from './MainLayout.module.less';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const tabs = [
    {
      key: '/home',
      title: '首页',
      icon: <AppOutline />,
    },
    {
      key: '/diary',
      title: '写日记',
      icon: <ContentOutline />,
    },
    {
      key: '/analysis',
      title: 'AI分析',
      icon: <HistogramOutline />,
    },
    {
      key: '/profile',
      title: '个人中心',
      icon: <UserOutline />,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Outlet />
      </div>

      <div className={styles.tabBarWrapper}>
        <TabBar 
          activeKey={pathname} 
          onChange={value => navigate(value)}
        >
          {tabs.map(item => (
            <TabBar.Item 
              key={item.key} 
              icon={item.icon} 
              title={item.title}
            />
          ))}
        </TabBar>
      </div>
    </div>
  );
};

export default MainLayout; 