import { NavBar } from 'antd-mobile';
import { SetOutline } from 'antd-mobile-icons';
import ReactECharts from 'echarts-for-react';
import styles from './Analysis.module.less';

const Analysis = () => {
  // 模拟情绪数据
  const emotionData = {
    positive: 75,
    negative: 25,
    suggestions: [
      '每天进行15分钟冥想',
      '增加户外运动时间',
      '尝试新的兴趣爱好'
    ],
    trend: {
      dates: ['3/20', '3/21', '3/22', '3/23', '3/24', '3/25', '3/26'],
      values: [75, 68, 80, 85, 65, 72, 78],
    }
  };

  const trendOption = {
    grid: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 40,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: emotionData.trend.dates,
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
      axisLabel: {
        color: '#666',
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#666',
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
        },
      },
    },
    series: [
      {
        data: emotionData.trend.values,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#4E6EF2',
        },
        lineStyle: {
          width: 3,
          color: '#4E6EF2',
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
        right={<SetOutline className={styles.shareIcon} />}
        back={null}
      >
        AI分析
      </NavBar>

      <div className={styles.content}>
        <div className={styles.analysisCard}>
          <div className={styles.cardTitle}>情绪分析</div>
          <div className={styles.emotionStats}>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <span className={styles.dot} style={{ background: '#4E6EF2' }} />
                积极情绪
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressInner} 
                  style={{ 
                    width: `${emotionData.positive}%`,
                    background: 'linear-gradient(90deg, #4E6EF2, #6E89FF)'
                  }} 
                />
                <span className={styles.progressText}>{emotionData.positive}%</span>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <span className={styles.dot} style={{ background: '#FF4D4F' }} />
                消极情绪
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressInner} 
                  style={{ 
                    width: `${emotionData.negative}%`,
                    background: 'linear-gradient(90deg, #FF4D4F, #FF7875)'
                  }} 
                />
                <span className={styles.progressText}>{emotionData.negative}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.analysisCard}>
          <div className={styles.cardTitle}>情绪趋势</div>
          <div className={styles.trendChart}>
            <ReactECharts option={trendOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        <div className={styles.analysisCard}>
          <div className={styles.cardTitle}>AI建议</div>
          <div className={styles.cardSubtitle}>根据您最近的情绪状态，建议：</div>
          <div className={styles.suggestionList}>
            {emotionData.suggestions.map((suggestion, index) => (
              <div key={index} className={styles.suggestionItem}>
                <div className={styles.suggestionIcon}>•</div>
                <div className={styles.suggestionText}>{suggestion}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis; 