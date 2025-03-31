import express, { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

interface DiaryRequest extends Request {
  user?: {
    userId: number;
  };
}

interface DiaryResponse {
  time: string;
  type: string;
  content: string;
  emotion: string;
  weather: string;
  location: string;
  tags: string[];
  imageUrls: string[];
}

interface TrendData {
  dates: string[];
  values: number[];
}

interface SuggestionResponse {
  content: string;
  type: string;
}

interface EmotionInput {
  type: string;
  intensity: number;
  tags?: string[];
}

interface CreateDiaryInput {
  content: string;
  weather?: string;
  location?: string;
  tags?: string[];
  imageUrls?: string[];
  emotion: EmotionInput;
}

// 获取今日心情
router.get('/today', authenticateToken, async (req: DiaryRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: '未授权' });
    }

    console.log('获取今日心情 - 用户ID:', userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('查询时间范围:', { today, tomorrow });

    // 先查询用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.log('用户不存在:', userId);
      return res.status(401).json({ error: '用户不存在' });
    }

    const todayDiary = await prisma.diary.findFirst({
      where: {
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        emotions: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('查询到的日记:', todayDiary);

    if (!todayDiary) {
      return res.json({
        time: '',
        type: '',
        content: '',
        emotion: '',
        weather: '',
        location: '',
        tags: [],
        imageUrls: []
      });
    }

    const latestEmotion = todayDiary.emotions[0];
    console.log('最新情绪记录:', latestEmotion);

    const response = {
      time: todayDiary.createdAt.toLocaleTimeString(),
      type: latestEmotion?.type || '',
      content: todayDiary.content,
      emotion: latestEmotion?.type || '',
      weather: todayDiary.weather || '',
      location: todayDiary.location || '',
      tags: todayDiary.tags ? todayDiary.tags.split(',').filter(Boolean) : [],
      imageUrls: todayDiary.imageUrls ? todayDiary.imageUrls.split(',').filter(Boolean) : []
    };

    console.log('返回的响应:', response);
    res.json(response);
  } catch (error: any) {
    console.error('获取今日心情失败:', error);
    res.status(500).json({ error: error.message || '获取今日心情失败' });
  }
});

// 获取情绪趋势
router.get('/trend', authenticateToken, async (req: DiaryRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: '未授权' });
    }

    console.log('获取情绪趋势 - 用户ID:', userId);
    const days = Number(req.query.days) || 7;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    console.log('查询时间范围:', { startDate, days });

    // 先查询用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.log('用户不存在:', userId);
      return res.status(401).json({ error: '用户不存在' });
    }

    const emotions = await prisma.emotion.findMany({
      where: {
        diary: {
          userId: userId
        },
        createdAt: { 
          gte: startDate 
        }
      },
      include: {
        diary: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log('查询到的情绪记录数:', emotions.length);

    const trendData = {
      dates: [] as string[],
      values: [] as number[]
    };

    // 填充日期数据
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toLocaleDateString();
      trendData.dates.push(dateStr);
      
      const dayEmotions = emotions.filter(emotion => {
        const emotionDate = new Date(emotion.createdAt);
        return emotionDate.getDate() === date.getDate() &&
               emotionDate.getMonth() === date.getMonth() &&
               emotionDate.getFullYear() === date.getFullYear();
      });

      console.log(`${dateStr} 的情绪记录数:`, dayEmotions.length);

      // 计算当天的平均情绪值
      const avgValue = dayEmotions.length > 0
        ? dayEmotions.reduce((sum, emotion) => sum + emotion.intensity, 0) / dayEmotions.length
        : 0;
      
      trendData.values.push(Math.round(avgValue));
    }

    console.log('返回的趋势数据:', trendData);
    res.json(trendData);
  } catch (error: any) {
    console.error('获取情绪趋势失败:', error);
    res.status(500).json({ error: error.message || '获取情绪趋势失败' });
  }
});

// 获取 AI 建议
router.get('/suggestion', authenticateToken, async (req: DiaryRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: '未授权' });
    }
    
    const recentEmotions = await prisma.emotion.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const emotionValues = recentEmotions.map(emotion => emotion.intensity);
    const avgEmotion = emotionValues.length > 0
      ? emotionValues.reduce((a, b) => a + b, 0) / emotionValues.length
      : 50;
    const trend = emotionValues.length > 0 ? emotionValues[0] - avgEmotion : 0;

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
      type: '情绪分析'
    });
  } catch (error: any) {
    console.error('获取 AI 建议失败:', error);
    res.status(500).json({ error: error.message || '获取 AI 建议失败' });
  }
});

// 创建日记
router.post('/', authenticateToken, async (req: DiaryRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: '未授权' });
    }

    const { content, weather, location, tags, imageUrls, emotion } = req.body;
    console.log('创建日记 - 接收到的数据:', {
      userId,
      content,
      weather,
      location,
      tags,
      imageUrls,
      emotion
    });

    // 验证必填字段
    if (!content?.trim() || !emotion?.type || typeof emotion?.intensity !== 'number') {
      console.log('创建日记 - 数据验证失败:', { content, emotion });
      return res.status(400).json({ error: '请填写完整的日记内容和情绪信息' });
    }

    // 创建日记
    const diary = await prisma.diary.create({
      data: {
        userId,
        content: content.trim(),
        weather: weather || '',
        location: location || '',
        tags: Array.isArray(tags) ? tags.join(',') : '',
        imageUrls: Array.isArray(imageUrls) ? imageUrls.join(',') : '',
        emotions: {
          create: {
            userId,
            type: emotion.type,
            intensity: emotion.intensity,
            tags: Array.isArray(emotion.tags) ? emotion.tags.join(',') : ''
          }
        }
      },
      include: {
        emotions: true
      }
    });

    console.log('创建日记 - 成功:', {
      diaryId: diary.id,
      content: diary.content,
      emotions: diary.emotions
    });

    const response = {
      time: diary.createdAt.toLocaleTimeString(),
      type: emotion.type,
      content: diary.content,
      emotion: emotion.type,
      weather: diary.weather || '',
      location: diary.location || '',
      tags: diary.tags ? diary.tags.split(',').filter(Boolean) : [],
      imageUrls: diary.imageUrls ? diary.imageUrls.split(',').filter(Boolean) : []
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('创建日记失败:', error);
    res.status(500).json({ error: error.message || '创建日记失败' });
  }
});

// 获取单个日记详情（放在最后，避免路径冲突）
router.get('/:id', authenticateToken, async (req: DiaryRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: '未授权' });
    }

    const diaryId = parseInt(id);
    if (isNaN(diaryId)) {
      return res.status(400).json({ error: '无效的日记ID' });
    }

    const diary = await prisma.diary.findFirst({
      where: {
        id: diaryId,
        userId
      },
      include: {
        emotions: true
      }
    });

    if (!diary) {
      return res.status(404).json({ error: '日记不存在' });
    }

    const response = {
      time: diary.createdAt.toLocaleTimeString(),
      type: diary.emotions[0]?.type || '',
      content: diary.content,
      emotion: diary.emotions[0]?.type || '',
      weather: diary.weather || '',
      location: diary.location || '',
      tags: diary.tags ? diary.tags.split(',').filter(Boolean) : [],
      imageUrls: diary.imageUrls ? diary.imageUrls.split(',').filter(Boolean) : []
    };

    res.json(response);
  } catch (error: any) {
    console.error('获取日记详情失败:', error);
    res.status(500).json({ error: error.message || '获取日记详情失败' });
  }
});

// 获取用户的所有日记
router.get('/', authenticateToken, async (req: DiaryRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    const where = {
      userId,
      ...(startDate && endDate ? {
        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      } : {})
    };

    const diaries = await prisma.diary.findMany({
      where: {
        userId: req.user!.userId
      },
      include: {
        emotions: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.diary.count({ where });

    res.json({
      data: diaries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || '获取日记失败' });
  }
});

// 更新日记
router.put('/:id', authenticateToken, async (req: DiaryRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { content, weather, location, emotions, tags, imageUrls } = req.body;

    const diaryId = parseInt(id);
    if (isNaN(diaryId)) {
      return res.status(400).json({ error: '无效的日记ID' });
    }

    // 验证日记所有权
    const existingDiary = await prisma.diary.findFirst({
      where: {
        id: diaryId,
        userId
      }
    });

    if (!existingDiary) {
      return res.status(404).json({ error: '日记不存在' });
    }

    // 更新日记及其关联数据
    const diary = await prisma.diary.update({
      where: { id: diaryId },
      data: {
        content,
        weather,
        location,
        tags: Array.isArray(tags) ? tags.join(',') : undefined,
        imageUrls: Array.isArray(imageUrls) ? imageUrls.join(',') : undefined,
        // 更新情绪记录
        emotions: {
          deleteMany: {},
          create: emotions.map((emotion: EmotionInput) => ({
            userId,
            type: emotion.type,
            intensity: emotion.intensity,
            tags: Array.isArray(emotion.tags) ? emotion.tags.join(',') : ''
          }))
        }
      },
      include: {
        emotions: true
      }
    });

    // 重新进行情感分析
    const aiAnalysis = await analyzeEmotions(content, emotions);
    await prisma.diary.update({
      where: { id: diaryId },
      data: { aiAnalysis }
    });

    // 构造响应
    const response: DiaryResponse = {
      time: diary.createdAt.toLocaleTimeString(),
      type: diary.emotions[0]?.type || '',
      content: diary.content,
      emotion: diary.emotions[0]?.type || '',
      weather: diary.weather || '',
      location: diary.location || '',
      tags: diary.tags ? diary.tags.split(',').filter(Boolean) : [],
      imageUrls: diary.imageUrls ? diary.imageUrls.split(',').filter(Boolean) : []
    };

    res.json(response);
  } catch (error: any) {
    console.error('更新日记失败:', error);
    res.status(500).json({ error: error.message || '更新日记失败' });
  }
});

// 删除日记
router.delete('/:id', authenticateToken, async (req: DiaryRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // 验证日记所有权
    const diary = await prisma.diary.findFirst({
      where: {
        id: Number(id),
        userId
      }
    });

    if (!diary) {
      return res.status(404).json({ error: '日记不存在' });
    }

    // 删除日记及其关联数据
    await prisma.diary.delete({
      where: { id: Number(id) }
    });

    // 更新用户统计数据
    await updateUserStatistics(userId);

    res.json({ message: '日记已删除' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || '删除日记失败' });
  }
});

// 获取情绪统计
router.get('/statistics/emotions', authenticateToken, async (req: DiaryRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { startDate, endDate } = req.query;

    const emotions = await prisma.emotion.groupBy({
      by: ['type'],
      where: {
        userId,
        ...(startDate && endDate ? {
          createdAt: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          }
        } : {})
      },
      _count: true,
      _avg: {
        intensity: true
      }
    });

    res.json(emotions);
  } catch (error: any) {
    res.status(500).json({ error: error.message || '获取情绪统计失败' });
  }
});

// 辅助函数：分析情绪
async function analyzeEmotions(content: string, emotions: any[]) {
  // TODO: 调用 OpenAI API 进行情感分析
  return "AI分析结果将在这里生成";
}

// 辅助函数：更新用户统计数据
async function updateUserStatistics(userId: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = await prisma.statistics.findUnique({
    where: {
      userId_date: {
        userId,
        date: today
      }
    }
  });

  if (stats) {
    // 更新现有统计数据
    await prisma.statistics.update({
      where: {
        userId_date: {
          userId,
          date: today
        }
      },
      data: {
        activityLevel: stats.activityLevel + 1
      }
    });
  } else {
    // 创建新的统计数据
    await prisma.statistics.create({
      data: {
        userId,
        date: today,
        emotionSummary: JSON.stringify({
          avgIntensity: 0,
          dominantEmotion: '',
          count: 0
        }),
        activityLevel: 1,
        streakDays: 1
      }
    });
  }
}

export default router; 