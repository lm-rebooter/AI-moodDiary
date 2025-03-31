import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

interface SettingsRequest extends Request {
  user?: {
    userId: number;
  };
}

// 获取用户设置
router.get('/', authenticateToken, async (req: SettingsRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const settings = await prisma.userSettings.findUnique({
      where: { userId }
    });

    if (!settings) {
      // 如果设置不存在，创建默认设置
      const defaultSettings = await prisma.userSettings.create({
        data: {
          userId,
          reminderEnabled: false,
          privacyLevel: 0,
          theme: 'light',
          language: 'zh-CN'
        }
      });
      return res.json(defaultSettings);
    }

    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message || '获取设置失败' });
  }
});

// 更新用户设置
router.put('/', authenticateToken, async (req: SettingsRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const {
      reminderEnabled,
      reminderTime,
      privacyLevel,
      theme,
      language
    } = req.body;

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        reminderEnabled,
        reminderTime,
        privacyLevel,
        theme,
        language
      },
      create: {
        userId,
        reminderEnabled,
        reminderTime,
        privacyLevel,
        theme,
        language
      }
    });

    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message || '更新设置失败' });
  }
});

// 获取用户统计数据
router.get('/statistics', authenticateToken, async (req: SettingsRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { startDate, endDate } = req.query;

    const statistics = await prisma.statistics.findMany({
      where: {
        userId,
        ...(startDate && endDate ? {
          date: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          }
        } : {})
      },
      orderBy: {
        date: 'desc'
      }
    });

    // 计算总体统计数据
    const totalDiaries = await prisma.diary.count({
      where: { userId }
    });

    const streakDays = await calculateStreakDays(userId);
    const emotionTrends = await calculateEmotionTrends(userId);

    res.json({
      statistics,
      summary: {
        totalDiaries,
        streakDays,
        emotionTrends
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || '获取统计数据失败' });
  }
});

// 辅助函数：计算连续记录天数
async function calculateStreakDays(userId: number) {
  const diaries = await prisma.diary.findMany({
    where: { userId },
    select: { createdAt: true },
    orderBy: { createdAt: 'desc' }
  });

  if (diaries.length === 0) return 0;

  let streakDays = 1;
  let currentDate = new Date(diaries[0].createdAt);
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < diaries.length; i++) {
    const prevDate = new Date(diaries[i].createdAt);
    prevDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streakDays++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streakDays;
}

// 辅助函数：计算情绪趋势
async function calculateEmotionTrends(userId: number) {
  const emotions = await prisma.emotion.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 30 // 最近30天的数据
  });

  const trends = emotions.reduce((acc: any, emotion: { type: string; intensity: number }) => {
    if (!acc[emotion.type]) {
      acc[emotion.type] = {
        count: 0,
        totalIntensity: 0
      };
    }
    acc[emotion.type].count++;
    acc[emotion.type].totalIntensity += emotion.intensity;
    return acc;
  }, {});

  // 计算每种情绪的平均强度
  Object.keys(trends).forEach(type => {
    trends[type].averageIntensity = trends[type].totalIntensity / trends[type].count;
    delete trends[type].totalIntensity;
  });

  return trends;
}

export default router; 