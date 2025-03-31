import { Card, Space, NavBar, DotLoading } from 'antd-mobile';
import { BellOutline } from 'antd-mobile-icons';
import ReactECharts from 'echarts-for-react';
import { useEffect, useState } from 'react';
import styles from './Home.module.less';
import { moodService } from '../services/moodService';
import type { MoodData, EmotionTrend, AISuggestion } from '../types/mood';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [currentMood, setCurrentMood] = useState<MoodData>({
    time: '',
    type: '',
    content: '',
    emotion: '',
    weather: '',
    location: '',
    tags: [],
    imageUrls: []
  });
  const [emotionData, setEmotionData] = useState<EmotionTrend>({
    dates: [],
    values: [],
  });
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion>({
    content: '',
    type: ''
  });

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [moodData, trendData, suggestionData] = await Promise.all([
        moodService.getTodayMood(),
        moodService.getEmotionTrend(),
        moodService.getAISuggestion(),
      ]);

      setCurrentMood(moodData);
      setEmotionData(trendData);
      setAiSuggestion(suggestionData);
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

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
      <NavBar
        className={styles.navbar}
        right={<BellOutline className={styles.bellIcon} />}
        back={null}
      >
        首页
      </NavBar>

      <div className={`${styles.scrollContent} scrollContent`}>
        <div className={styles.moodCard}>
          {currentMood ? (
            <>
              <div className={styles.moodHeader}>
                <span className={styles.emoji}>{currentMood.emotion}</span>
                <div className={styles.timeInfo}>
                  <span className={styles.time}>今日心情</span>
                  <span className={styles.type}>{currentMood.time} {currentMood.type}</span>
                </div>
              </div>
              <div className={styles.moodText}>
                {currentMood.content}
              </div>
              {(currentMood.weather || currentMood.location) && (
                <div className={styles.moodMeta}>
                  {currentMood.weather && <span>{currentMood.weather}</span>}
                  {currentMood.location && <span>{currentMood.location}</span>}
                </div>
              )}
              {currentMood.tags?.length > 0 && (
                <div className={styles.moodTags}>
                  {currentMood.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>#{tag}</span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={styles.moodEmpty}>
              <span className={styles.emoji}>😊</span>
              <span>今天还没有记录心情哦~</span>
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