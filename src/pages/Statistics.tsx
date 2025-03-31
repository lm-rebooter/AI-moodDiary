import { useEffect, useState } from 'react';
import { NavBar, Card, DotLoading } from 'antd-mobile';
import { diaryApi } from '../services/api';
import styles from './Analysis.module.less';

interface EmotionStatistic {
  type: string;
  emoji: string;
  count: number;
  avgIntensity: number;
}

interface StatisticsData {
  statistics: EmotionStatistic[];
  total: number;
}

export const StatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await diaryApi.getStatistics();
        setStatistics(response.data);
      } catch (error) {
        console.error('获取统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <DotLoading color='primary' />
        <span>加载中...</span>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <NavBar className={styles.navbar} back={null}>
        统计
      </NavBar>

      <div className={`${styles.scrollContent} scrollContent`}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>情绪分布</span>
          <span className={styles.sectionSubtitle}>
            共记录 {statistics?.total || 0} 条
          </span>
        </div>

        <div className={styles.statisticsGrid}>
          {statistics?.statistics.map((item) => (
            <Card key={item.type} className={styles.statisticCard}>
              <div className={styles.statisticContent}>
                <div className={styles.emotionInfo}>
                  <span className={styles.emoji}>{item.emoji}</span>
                  <span className={styles.type}>{item.type}</span>
                </div>
                <div className={styles.stats}>
                  <div className={styles.statItem}>
                    <span className={styles.label}>次数</span>
                    <span className={styles.value}>{item.count}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.label}>平均强度</span>
                    <span className={styles.value}>{item.avgIntensity}%</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}; 