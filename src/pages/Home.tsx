import { Card, Space, NavBar } from 'antd-mobile';
import { BellOutline } from 'antd-mobile-icons';
import ReactECharts from 'echarts-for-react';
import { useEffect, useState } from 'react';
import styles from './Home.module.less';

const Home = () => {
  // 模拟情绪数据
  const emotionData = {
    dates: ['3/20', '3/21', '3/22', '3/23', '3/24', '3/25', '3/26'],
    values: [75, 68, 80, 85, 65, 72, 78],
  };

  const [currentMood, setCurrentMood] = useState({
    time: '',
    type: '',
    content: '',
    emotion: '',
  });

  useEffect(() => {
    // 获取最新保存的日记内容
    const latestDiary = localStorage.getItem('latestDiary');
    if (latestDiary) {
      setCurrentMood(JSON.parse(latestDiary));
    }

    // 监听storage变化，实时更新内容
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'latestDiary' && e.newValue) {
        setCurrentMood(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const aiSuggestion = {
    content: '今天是个适合户外活动的好天气，建议您出去散步放松一下心情。'
  };

  const option = {
    grid: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 40,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: emotionData.dates,
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
      splitLine: {
        lineStyle: {
          color: '#eee',
        },
      },
    },
    series: [
      {
        data: emotionData.values,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#4E6EF2',
        },
        lineStyle: {
          width: 3,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(78,110,242,0.2)',
              },
              {
                offset: 1,
                color: 'rgba(78,110,242,0)',
              },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className={styles.pageContainer}>
      <NavBar
        className={styles.navbar}
        right={<BellOutline className={styles.bellIcon} />}
        back={null}
      >
        首页
      </NavBar>

      <div className={styles.scrollContent}>
        <div className={styles.moodCard}>
          <div className={styles.moodTitle}>今日心情</div>
          {currentMood.content ? (
            <div className={styles.moodContent}>
              <div className={styles.moodHeader}>
                <Space align="center">
                  <span className={styles.emoji}>{currentMood.emotion}</span>
                  <div className={styles.timeInfo}>
                    <span className={styles.time}>{currentMood.time}</span>
                    <span className={styles.type}>{currentMood.type}</span>
                  </div>
                </Space>
              </div>
              <div className={styles.moodText}>
                {currentMood.content}
              </div>
            </div>
          ) : (
            <div className={styles.moodEmpty}>
              还没有记录今天的心情哦~
            </div>
          )}
        </div>

        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>情绪趋势</span>
          <span className={styles.sectionSubtitle}>近7天</span>
        </div>

        <Card className={styles.trendCard}>
          <ReactECharts option={option} style={{ height: '300px' }} />
        </Card>

        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>AI助手建议</span>
        </div>

        <div className={styles.aiCard}>
          <div className={styles.aiContent}>
            <div className={styles.aiIcon}>🤖</div>
            <div className={styles.aiMessage}>{aiSuggestion.content}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 