import { NavBar, List, Avatar, Badge } from 'antd-mobile';
import { SetOutline, StarFill, HeartOutline, SetOutline as PrivacyOutline, QuestionCircleOutline } from 'antd-mobile-icons';
import styles from './Profile.module.less';

const Profile = () => {
  const userInfo = {
    name: '用户名',
    avatar: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy02LjY2OjY2Njo2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Njb/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',  // 使用Base64编码的图片数据
    daysCount: 365,
    collectionCount: 12,
    startDate: '2023/03/25',  // 添加开始记录的日期
  };

  // 计算具体的开始日期到现在的天数
  const calculateDays = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const actualDays = calculateDays(userInfo.startDate);

  const menuItems = [
    {
      icon: <StarFill style={{ color: '#FFD700' }} />,
      title: '我的收藏',
      badge: userInfo.collectionCount,
      background: 'linear-gradient(135deg, #FFF6E5, #FFE1B3)',
    },
    {
      icon: <HeartOutline style={{ color: '#4E6EF2' }} />,
      title: '数据统计',
      background: 'linear-gradient(135deg, #F0F2FF, #E6E9FF)',
    },
    {
      icon: <PrivacyOutline style={{ color: '#00B578' }} />,
      title: '隐私设置',
      background: 'linear-gradient(135deg, #E8F8F0, #D5F2E5)',
    },
    {
      icon: <QuestionCircleOutline style={{ color: '#FF9F2E' }} />,
      title: '帮助与反馈',
      background: 'linear-gradient(135deg, #FFF3E5, #FFE5CC)',
    },
  ];

  return (
    <div className={styles.pageContainer}>
      <NavBar
        className={styles.navbar}
        right={<SetOutline className={styles.settingsIcon} />}
        back={null}
      >
        个人中心
      </NavBar>

      <div className={styles.content}>
        <div className={styles.userCard}>
          <div className={styles.userCardBg} />
          <div className={styles.userCardContent}>
            <Avatar 
              src={userInfo.avatar} 
              className={styles.avatar}
              fallback={
                <div className={styles.avatarFallback}>
                  {userInfo.name.slice(0, 1)}
                </div>
              }
            />
            <div className={styles.userInfo}>
              <div className={styles.name}>{userInfo.name}</div>
              <div className={styles.stats}>
                <span className={styles.daysCount}>{actualDays}</span>
                <span className={styles.daysLabel}>天</span>
                <span className={styles.statsText}>已坚持记录</span>
              </div>
              <div className={styles.startDate}>
                开始于 {userInfo.startDate.replace(/\//g, '.')}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <div 
              key={index} 
              className={styles.menuItem}
              style={{ background: item.background }}
            >
              <div className={styles.menuIcon}>
                {item.icon}
                {item.badge && (
                  <Badge 
                    content={item.badge} 
                    className={styles.menuBadge}
                  />
                )}
              </div>
              <div className={styles.menuTitle}>{item.title}</div>
            </div>
          ))}
        </div>

        <div className={styles.achievementCard}>
          <div className={styles.achievementTitle}>
            <span>成就徽章</span>
            <span className={styles.achievementMore}>查看全部</span>
          </div>
          <div className={styles.achievementList}>
            {/* 这里可以添加成就徽章列表 */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 