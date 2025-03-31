import { useEffect, useState } from 'react';
import { NavBar, Card, DotLoading } from 'antd-mobile';
import ReactECharts from 'echarts-for-react';
import styles from './Analysis.module.less';
import { diaryApi } from '../services/api';

interface EmotionSummary {
  dominantEmotion: string;
  emotionDistribution: Array<{
    type: string;
    percentage: number;
  }>;
  weeklyTrend: Array<{
    date: string;
    value: number;
  }>;
}

interface Insight {
  title: string;
  description: string;
  icon: string;
}

interface Suggestion {
  content: string;
  category: string;
  icon: string;
}

interface AIAnalysisData {
  emotionSummary: EmotionSummary;
  insights: Insight[];
  suggestions: Suggestion[];
}

const AIAnalysisPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AIAnalysisData | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await diaryApi.getAIAnalysis();
        setData(response.data);
      } catch (error) {
        console.error('获取AI分析数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  const renderTrendChart = () => {
    if (!data?.emotionSummary.weeklyTrend) return null;

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
        data: data.emotionSummary.weeklyTrend.map(item => item.date),
        axisLine: { lineStyle: { color: '#999' } },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLine: { lineStyle: { color: '#999' } },
        splitLine: { lineStyle: { color: '#eee' } },
      },
      series: [{
        data: data.emotionSummary.weeklyTrend.map(item => item.value),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#4E6EF2' },
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(78,110,242,0.2)' },
              { offset: 1, color: 'rgba(78,110,242,0)' }
            ],
          }
        },
      }]
    };

    return (
      <Card className={styles.chartCard}>
        <div className={styles.chartTitle}>情绪趋势</div>
        <ReactECharts option={option} style={{ height: '200px' }} />
      </Card>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <DotLoading color='primary' />
        <span>AI正在分析您的情绪数据...</span>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <NavBar className={styles.navbar} back={null}>
        AI 分析
      </NavBar>

      <div className={`${styles.scrollContent} scrollContent`}>
        {/* 主要情绪卡片 */}
        <Card className={styles.mainEmotionCard}>
          <div className={styles.emotionHeader}>
            <span className={styles.emoji}>
              {data?.emotionSummary.dominantEmotion}
            </span>
            <div className={styles.emotionInfo}>
              <span className={styles.label}>主导情绪</span>
              <span className={styles.value}>积极乐观</span>
            </div>
          </div>
        </Card>

        {/* 情绪趋势图表 */}
        {renderTrendChart()}

        {/* AI 洞察卡片 */}
        <div className={styles.sectionTitle}>AI 洞察</div>
        <div className={styles.insightsGrid}>
          {data?.insights.map((insight, index) => (
            <Card key={index} className={styles.insightCard}>
              <div className={styles.insightIcon}>{insight.icon}</div>
              <div className={styles.insightContent}>
                <div className={styles.insightTitle}>{insight.title}</div>
                <div className={styles.insightDescription}>
                  {insight.description}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 建议卡片 */}
        <div className={styles.sectionTitle}>个性化建议</div>
        <div className={styles.suggestionsContainer}>
          {data?.suggestions.map((suggestion, index) => (
            <Card key={index} className={styles.suggestionCard}>
              <div className={styles.suggestionHeader}>
                <span className={styles.suggestionIcon}>{suggestion.icon}</span>
                <span className={styles.suggestionCategory}>
                  {suggestion.category}
                </span>
              </div>
              <div className={styles.suggestionContent}>
                {suggestion.content}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisPage; 