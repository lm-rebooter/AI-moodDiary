import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

interface DiaryRequest extends Request {
  user?: {
    userId: number;
  };
}

// 创建日记
router.post('/', authenticateToken, async (req: DiaryRequest, res: Response) => {
  try {
    const { content, weather, location, emotions, tags, images } = req.body;
    const userId = req.user!.userId;

    // 创建日记及其关联数据
    const diary = await prisma.diary.create({
      data: {
        content,
        weather,
        location,
        userId,
        // 创建关联的情绪记录
        emotions: {
          create: emotions.map((emotion: any) => ({
            type: emotion.type,
            intensity: emotion.intensity,
            tags: emotion.tags,
            userId
          }))
        },
        // 创建或关联标签
        tags: {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag }
          }))
        },
        // 创建图片记录
        images: {
          create: images?.map((image: any) => ({
            url: image.url,
            description: image.description
          }))
        }
      },
      include: {
        emotions: true,
        tags: true,
        images: true
      }
    });

    // 使用 OpenAI 进行情感分析
    const Analysis = await analyzeEmotions(content, emotions);
    
    // 更新日记的 AI 分析结果
    await prisma.diary.update({
      where: { id: diary.id },
      data: { Analysis }
    });

    // 更新用户统计数据
    await updateUserStatistics(userId);

    res.json(diary);
  } catch (error: any) {
    res.status(500).json({ error: error.message || '创建日记失败' });
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

// 获取单个日记详情
router.get('/:id', authenticateToken, async (req: DiaryRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const diary = await prisma.diary.findFirst({
      where: {
        id: Number(id),
        userId
      },
      include: {
        emotions: true,
        tags: true,
        images: true
      }
    });

    if (!diary) {
      return res.status(404).json({ error: '日记不存在' });
    }

    res.json(diary);
  } catch (error: any) {
    res.status(500).json({ error: error.message || '获取日记详情失败' });
  }
});

// 更新日记
router.put('/:id', authenticateToken, async (req: DiaryRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { content, weather, location, emotions, tags, images } = req.body;

    // 验证日记所有权
    const existingDiary = await prisma.diary.findFirst({
      where: {
        id: Number(id),
        userId
      }
    });

    if (!existingDiary) {
      return res.status(404).json({ error: '日记不存在' });
    }

    // 更新日记及其关联数据
    const diary = await prisma.diary.update({
      where: { id: Number(id) },
      data: {
        content,
        weather,
        location,
        // 更新情绪记录
        emotions: {
          deleteMany: {},
          create: emotions.map((emotion: any) => ({
            type: emotion.type,
            intensity: emotion.intensity,
            tags: emotion.tags,
            userId
          }))
        },
        // 更新标签
        tags: {
          set: [],
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag }
          }))
        },
        // 更新图片
        images: {
          deleteMany: {},
          create: images?.map((image: any) => ({
            url: image.url,
            description: image.description
          }))
        }
      },
      include: {
        emotions: true,
        tags: true,
        images: true
      }
    });

    // 重新进行情感分析
    const Analysis = await analyzeEmotions(content, emotions);
    await prisma.diary.update({
      where: { id: Number(id) },
      data: { Analysis }
    });

    res.json(diary);
  } catch (error: any) {
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
        emotionSummary: {},
        activityLevel: 1,
        streakDays: 1
      }
    });
  }
}

export default router; 