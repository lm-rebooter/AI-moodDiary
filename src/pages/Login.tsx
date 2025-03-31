import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, App } from 'antd';
import { userApi } from '../services/api';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      const response = await userApi.login(values);
      
      console.log(response);
      // 保存 token 到 localStorage
      localStorage.setItem('token', response.token);
      
      // 保存用户信息
      localStorage.setItem('user', JSON.stringify(response.user));
      
      message.success('登录成功');
      navigate('/home');
    } catch (error: any) {
      console.log(error);

      console.error('登录错误:', error);
      message.error(error.response?.data?.error || '登录失败，请稍后重试');
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