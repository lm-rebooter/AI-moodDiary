import { Request, Response } from 'express';
import { IMood, MoodModel } from '../models/mood';

interface CustomRequest extends Request {
  user?: {
    id: string;
  };
}

export const moodController = {
  // 获取今日心情
  async getTodayMood(req: CustomRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayMood = await MoodModel.findOne({
        userId,
        createdAt: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }).sort({ createdAt: -1 });

      if (!todayMood) {
        return res.json({
          time: '',
          type: '',
          content: '',
          emotion: '',
        });
      }

      res.json({
        time: todayMood.createdAt.toLocaleTimeString(),
        type: todayMood.type,
        content: todayMood.content,
        emotion: todayMood.emotion,
      });
    } catch (error) {
      res.status(500).json({ error: '获取今日心情失败' });
    }
  },

  // 获取情绪趋势
  async getEmotionTrend(req: CustomRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const days = Number(req.query.days) || 7;
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days + 1);
      startDate.setHours(0, 0, 0, 0);

      const moods = await MoodModel.find({
        userId,
        createdAt: { $gte: startDate }
      }).sort({ createdAt: 1 });

      const trendData = {
        dates: [] as string[],
        values: [] as number[],
      };

      // 填充日期数据
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        trendData.dates.push(date.toLocaleDateString());
        
        const dayMoods = moods.filter((mood: IMood) => {
          const moodDate = new Date(mood.createdAt);
          return moodDate.getDate() === date.getDate() &&
                 moodDate.getMonth() === date.getMonth() &&
                 moodDate.getFullYear() === date.getFullYear();
        });

        // 计算当天的平均情绪值
        const avgValue = dayMoods.length > 0
          ? dayMoods.reduce((sum: number, mood: IMood) => sum + mood.value, 0) / dayMoods.length
          : 0;
        
        trendData.values.push(Math.round(avgValue));
      }

      res.json(trendData);
    } catch (error) {
      res.status(500).json({ error: '获取情绪趋势失败' });
    }
  },

  // 获取 AI 建议
  async getAISuggestion(req: CustomRequest, res: Response) {
    try {
      const userId = req.user?.id;
      
      // 获取用户最近的情绪数据
      const recentMoods = await MoodModel.find({
        userId,
        createdAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }).sort({ createdAt: -1 });

      // 分析情绪趋势
      const emotionValues = recentMoods.map((mood: IMood) => mood.value);
      const avgEmotion = emotionValues.reduce((a: number, b: number) => a + b, 0) / emotionValues.length;
      const trend = emotionValues[0] - avgEmotion;

      // 根据情绪趋势生成建议
      let suggestion = '';
      if (trend > 10) {
        suggestion = '您最近的心情不错！建议继续保持积极乐观的心态，多参与户外活动，让好心情持续下去。';
      } else if (trend < -10) {
        suggestion = '看起来您最近的心情有些低落。建议尝试一些放松的活动，比如听音乐、散步或者与朋友聊天，这些都能帮助改善心情。';
      } else {
        suggestion = '您的情绪状态比较稳定。建议保持规律的作息和运动习惯，让生活更有规律和活力。';
      }

      res.json({
        content: suggestion,
        tags: ['情绪管理', '生活建议']
      });
    } catch (error) {
      res.status(500).json({ error: '获取 AI 建议失败' });
    }
  },

  // 创建日记
  async createDiary(req: CustomRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { content, emotion, type, value } = req.body;

      // 验证必填字段
      if (!content?.trim() || !emotion || !type || typeof value !== 'number') {
        return res.status(400).json({ error: '请填写完整的日记内容' });
      }

      // 创建新的日记
      const newMood = await MoodModel.create({
        userId,
        content: content.trim(),
        emotion,
        type,
        value
      });

      res.status(201).json({
        id: newMood._id,
        content: newMood.content,
        emotion: newMood.emotion,
        type: newMood.type,
        value: newMood.value,
        createdAt: newMood.createdAt,
        updatedAt: newMood.updatedAt
      });
    } catch (error) {
      res.status(500).json({ error: '保存日记失败' });
    }
  }
}; 