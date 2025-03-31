import { FC, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard: FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    // 将用户重定向到登录页面，并记录他们试图访问的页面
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard; 