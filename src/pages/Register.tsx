import { useState } from 'react';
import { Form, Input, Button, Toast } from 'antd-mobile';
import { EyeInvisibleOutline, EyeOutline, AddOutline } from 'antd-mobile-icons';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import styles from '../styles/auth.module.less';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (values: { email: string; password: string; name: string }) => {
    try {
      setLoading(true);
      await authService.register({
        username: values.email,
        email: values.email,
        password: values.password
      });
      Toast.show({
        icon: 'success',
        content: '注册成功'
      });
      navigate('/login', { replace: true });
    } catch (error: any) {
      Toast.show({
        icon: 'fail',
        content: error.response?.data?.error || '注册失败'
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
            <AddOutline />
          </div>
          <h1 className={styles.title}>创建账号</h1>
          <p className={styles.subtitle}>开始您的心情记录之旅</p>
        </div>

        <Form
          className={styles.form}
          onFinish={handleRegister}
          footer={
            <Button
              block
              type="submit"
              color="primary"
              loading={loading}
              loadingText="注册中..."
            >
              注册
            </Button>
          }
        >
          <Form.Item
            name="name"
            label="昵称"
            rules={[
              { required: true, message: '请输入昵称' },
              { min: 2, message: '昵称至少2个字符' }
            ]}
          >
            <Input
              placeholder="请输入昵称"
              clearable
            />
          </Form.Item>

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
          <Link to="/login">已有账号？立即登录</Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 