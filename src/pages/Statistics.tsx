import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Spin, Empty } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { diaryApi } from '../services/api';

const { RangePicker } = DatePicker;

interface EmotionStats {
  type: string;
  count: number;
  percentage: number;
}

interface DailyStats {
  date: string;
  emotionIntensity: number;
  diaryCount: number;
}

interface Statistics {
  totalDiaries: number;
  averageEmotionIntensity: number;
  continuousWritingDays: number;
  emotionDistribution: EmotionStats[];
  dailyStats: DailyStats[];
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5'];

export const StatisticsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Empty description="暂无统计数据" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">情绪统计</h1>
        <RangePicker
          onChange={(dates) => {
            if (dates) {
              setDateRange([dates[0]?.toDate() as Date, dates[1]?.toDate() as Date]);
            } else {
              setDateRange(null);
            }
          }}
        />
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="日记总数"
              value={statistics.totalDiaries}
              suffix="篇"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="平均情绪强度"
              value={statistics.averageEmotionIntensity}
              precision={1}
              suffix="/5"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="连续写作天数"
              value={statistics.continuousWritingDays}
              suffix="天"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="情绪分布">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statistics.emotionDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statistics.emotionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="情绪趋势">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statistics.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="emotionIntensity"
                    stroke="#8884d8"
                    name="情绪强度"
                  />
                  <Line
                    type="monotone"
                    dataKey="diaryCount"
                    stroke="#82ca9d"
                    name="日记数量"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}; 