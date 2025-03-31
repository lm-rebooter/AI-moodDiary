import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Form, Input, Button, App } from 'antd';
import { authService } from '../services/api';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { message } = App.useApp();

  // 获取重定向路径
  const redirect = searchParams.get('redirect') || '/home';

  // 如果已经登录，直接重定向
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate(redirect, { replace: true });
    }
  }, [navigate, redirect]);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      await authService.login({
        username: values.email,
        password: values.password
      });
      
      message.success('登录成功');
      // 登录成功后跳转到重定向路径
      navigate(redirect, { replace: true });
    } catch (error: any) {
      console.error('登录错误:', error);
      const errorMessage = error.response?.data?.error || '登录失败，请稍后重试';
      message.error(errorMessage);
      
      // 如果是token相关错误，清除本地存储
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录您的账户
          </h2>
        </div>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input size="large" placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password size="large" placeholder="请输入密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>

          <div className="text-center">
            <Link to="/register" className="text-blue-600 hover:text-blue-800">
              还没有账户？立即注册
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}; 