import { useState } from 'react';
import { Form, Input, Button, Toast } from 'antd-mobile';
import { EyeInvisibleOutline, EyeOutline, UserOutline } from 'antd-mobile-icons';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import styles from '../styles/auth.module.less';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      await authService.login({
        username: values.email,
        password: values.password
      });
      Toast.show({
        icon: 'success',
        content: '登录成功'
      });
      navigate('/', { replace: true });
    } catch (error: any) {
      Toast.show({
        icon: 'fail',
        content: error.response?.data?.error || '登录失败'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <UserOutline />
          </div>
          <h1 className={styles.title}>欢迎回来</h1>
          <p className={styles.subtitle}>登录您的账号继续使用</p>
        </div>

        <Form
          className={styles.form}
          onFinish={handleLogin}
          footer={
            <Button
              block
              type="submit"
              color="primary"
              loading={loading}
              loadingText="登录中..."
            >
              登录
            </Button>
          }
        >
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              placeholder="请输入邮箱"
              clearable
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <div className="custom-input-password">
              <Input
                placeholder="请输入密码"
                clearable
                type={visible ? 'text' : 'password'}
                className="password-input"
              />
              <div className="password-icon" onClick={() => setVisible(!visible)}>
                {visible ? <EyeOutline /> : <EyeInvisibleOutline />}
              </div>
            </div>
          </Form.Item>
        </Form>

        <div className={styles.footer}>
          <Link to="/register">还没有账号？立即注册</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 