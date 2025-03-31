import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/api';
import { useEffect, useState } from 'react';
import { Toast } from 'antd-mobile';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (!token || !user) {
          setIsAuthed(false);
          Toast.show({
            content: '请先登录',
          });
          return;
        }

        // 验证token格式
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          setIsAuthed(false);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          Toast.show({
            content: '登录信息无效，请重新登录',
          });
          return;
        }

        setIsAuthed(true);
      } catch (error) {
        console.error('权限检查失败:', error);
        setIsAuthed(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  if (isChecking) {
    return null; // 或者显示加载状态
  }

  if (!isAuthed) {
    // 保存当前路径，以便登录后返回
    const currentPath = location.pathname;
    if (currentPath !== '/login' && currentPath !== '/register') {
      return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}; 