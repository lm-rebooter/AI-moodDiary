import { useEffect, useState } from 'react';
import { NavBar, Card, Button, Toast, Dialog } from 'antd-mobile';
import { 
  SetOutline,
  BellOutline,
  GlobalOutline,
  RightOutline,
  UserOutline,
  EditSOutline,
  PictureOutline,
  HeartOutline,
  StarOutline
} from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import styles from './Profile.module.less';

interface UserInfo {
  id: number;
  email: string;
  name: string | null;
  avatar: string | null;
  settings: {
    theme: string;
    language: string;
    reminderEnabled: boolean;
  };
  statistics: {
    totalDays: number;      // 记录天数
    positiveRate: number;   // 积极情绪占比
    streakDays: number;     // 连续打卡天数
    lastUpdated?: string;   // 最后更新时间
  };
}

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const response = await authService.getCurrentUser();
      setUserInfo(response.data);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      Toast.show({
        icon: 'fail',
        content: '获取用户信息失败'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const result = await Dialog.confirm({
      content: '确定要退出登录吗？',
      confirmText: '退出登录',
      cancelText: '取消'
    });

    if (result) {
      try {
        authService.logout();
        Toast.show({
          icon: 'success',
          content: '退出成功'
        });
        navigate('/login', { replace: true });
      } catch (error) {
        console.error('退出失败:', error);
        Toast.show({
          icon: 'fail',
          content: '退出失败，请重试'
        });
      }
    }
  };

  const handleSettingClick = (type: string) => {
    Toast.show({
      content: `${type}功能开发中`,
      position: 'bottom'
    });
  };

  const handleQuickAction = (action: string) => {
    Toast.show({
      content: `${action}功能开发中`,
      position: 'bottom'
    });
  };

  // 格式化百分比
  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  return (
    <div className={styles.pageContainer}>
      <NavBar className={styles.navbar} back={null}>
        个人中心
      </NavBar>

      <div className={`${styles.scrollContent} scrollContent`}>
        {/* 用户信息卡片 */}
        <Card className={styles.userCard}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {userInfo?.avatar ? (
                <img src={userInfo.avatar} alt="头像" />
              ) : (
                <div className={styles.defaultAvatar}>
                  {userInfo?.name?.[0]?.toUpperCase() || userInfo?.email?.[0]?.toUpperCase() || <UserOutline />}
                </div>
              )}
            </div>
            <div className={styles.info}>
              <div className={styles.name}>{userInfo?.name || '未设置昵称'}</div>
              <div className={styles.email}>{userInfo?.email}</div>
            </div>
          </div>
          <div className={styles.userStats}>
            <div className={styles.statItem}>
              <div className={styles.value}>{userInfo?.statistics.totalDays || 0}</div>
              <div className={styles.label}>记录天数</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.value}>{formatPercentage(userInfo?.statistics.positiveRate || 0)}</div>
              <div className={styles.label}>积极情绪</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.value}>{userInfo?.statistics.streakDays || 0}</div>
              <div className={styles.label}>连续打卡</div>
            </div>
          </div>
        </Card>

        {/* 快捷操作 */}
        <div className={styles.quickActions}>
          <div className={styles.actionItem} onClick={() => handleQuickAction('编辑资料')}>
            <div className={styles.icon}><EditSOutline /></div>
            <div className={styles.label}>编辑资料</div>
          </div>
          <div className={styles.actionItem} onClick={() => handleQuickAction('我的相册')}>
            <div className={styles.icon}><PictureOutline /></div>
            <div className={styles.label}>我的相册</div>
          </div>
          <div className={styles.actionItem} onClick={() => handleQuickAction('情绪记录')}>
            <div className={styles.icon}><HeartOutline /></div>
            <div className={styles.label}>情绪记录</div>
          </div>
          <div className={styles.actionItem} onClick={() => handleQuickAction('我的收藏')}>
            <div className={styles.icon}><StarOutline /></div>
            <div className={styles.label}>我的收藏</div>
          </div>
        </div>

        {/* 设置选项 */}
        <Card className={styles.settingsCard}>
          <div className={styles.settingItem} onClick={() => handleSettingClick('主题')}>
            <span className={styles.label}>
              <SetOutline /> 主题设置
            </span>
            <span className={styles.value}>
              {userInfo?.settings?.theme === 'dark' ? '深色' : '浅色'}
              <RightOutline />
            </span>
          </div>
          <div className={styles.settingItem} onClick={() => handleSettingClick('提醒')}>
            <span className={styles.label}>
              <BellOutline /> 提醒设置
            </span>
            <span className={styles.value}>
              {userInfo?.settings?.reminderEnabled ? '已开启' : '已关闭'}
              <RightOutline />
            </span>
          </div>
          <div className={styles.settingItem} onClick={() => handleSettingClick('语言')}>
            <span className={styles.label}>
              <GlobalOutline /> 语言设置
            </span>
            <span className={styles.value}>
              {userInfo?.settings?.language === 'zh-CN' ? '中文' : 'English'}
              <RightOutline />
            </span>
          </div>
        </Card>

        {/* 退出按钮 */}
        <div className={styles.logoutButtonContainer}>
          <Button
            block
            color='danger'
            size='large'
            onClick={handleLogout}
            loading={loading}
          >
            退出登录
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 