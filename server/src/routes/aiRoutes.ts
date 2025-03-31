import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

interface AIRequest extends Request {
  user?: {
    userId: number;
  };
}

// 获取AI建议
router.get('/recommendations', authenticateToken, async (req: AIRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    // 获取用户最近的情绪数据
    const recentEmotions = await prisma.emotion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        diary: {
          select: {
            content: true,
            weather: true,
            location: true
          }
        }
      }
    });

    // 分析情绪趋势
    const emotionTrends = analyzeEmotionTrends(recentEmotions);

    // 根据情绪趋势生成建议
    const recommendations = await generateRecommendations(emotionTrends);

    // 保存建议
    const savedRecommendation = await prisma.aIRecommendation.create({
      data: {
        content: recommendations.join('\n'),
        type: 'emotion_based'
      }
    });

    res.json({
      emotionTrends,
      recommendations: savedRecommendation
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || '获取AI建议失败' });
  }
});

// 获取情绪分析
router.post('/analyze', authenticateToken, async (req: AIRequest, res: Response) => {
  try {
    const { content } = req.body;
    const userId = req.user!.userId;

    // 分析文本内容
    const analysis = await analyzeContent(content);

    res.json(analysis);
  } catch (error: any) {
    res.status(500).json({ error: error.message || '分析内容失败' });
  }
});

// 辅助函数：分析情绪趋势
function analyzeEmotionTrends(emotions: any[]) {
  const trends = emotions.reduce((acc: any, emotion) => {
    if (!acc[emotion.type]) {
      acc[emotion.type] = {
        count: 0,
        totalIntensity: 0,
        contexts: []
      };
    }
    acc[emotion.type].count++;
    acc[emotion.type].totalIntensity += emotion.intensity;
    acc[emotion.type].contexts.push({
      weather: emotion.diary.weather,
      location: emotion.diary.location
    });
    return acc;
  }, {});

  // 计算平均强度和模式
  Object.keys(trends).forEach(type => {
    trends[type].averageIntensity = trends[type].totalIntensity / trends[type].count;
    trends[type].patterns = analyzeContextPatterns(trends[type].contexts);
    delete trends[type].totalIntensity;
    delete trends[type].contexts;
  });

  return trends;
}

// 辅助函数：分析情境模式
function analyzeContextPatterns(contexts: any[]) {
  const patterns = {
    weather: {} as Record<string, number>,
    location: {} as Record<string, number>
  };

  contexts.forEach(context => {
    if (context.weather) {
      patterns.weather[context.weather] = (patterns.weather[context.weather] || 0) + 1;
    }
    if (context.location) {
      patterns.location[context.location] = (patterns.location[context.location] || 0) + 1;
    }
  });

  return {
    weather: Object.entries(patterns.weather)
      .sort(([, a], [, b]) => b - a)
      .map(([weather]) => weather)
      .slice(0, 3),
    location: Object.entries(patterns.location)
      .sort(([, a], [, b]) => b - a)
      .map(([location]) => location)
      .slice(0, 3)
  };
}

// 辅助函数：生成建议
async function generateRecommendations(trends: any) {
  const recommendations = [];

  // 分析主导情绪
  const dominantEmotion = Object.entries(trends)
    .sort(([, a]: any, [, b]: any) => b.count - a.count)[0];

  // 根据主导情绪生成建议
  if (dominantEmotion) {
    const [emotionType, data]: [string, any] = dominantEmotion;
    
    if (emotionType.includes('负面') || emotionType.includes('消极')) {
      recommendations.push(
        '建议：尝试改变环境或进行一些让你感到愉快的活动',
        '可以考虑进行冥想或轻度运动来改善心情',
        '建议与亲朋好友交流，分享你的感受'
      );
    } else if (emotionType.includes('正面') || emotionType.includes('积极')) {
      recommendations.push(
        '建议：继续保持当前的生活方式和心态',
        '可以记录下让你感到快乐的事物和活动',
        '与他人分享你的快乐，传递正能量'
      );
    }

    // 根据情境模式生成建议
    if (data.patterns.weather.length > 0) {
      recommendations.push(
        `注意到你在${data.patterns.weather.join('、')}天气时情绪较为${emotionType}`,
        '建议关注天气变化对情绪的影响，做好相应调节'
      );
    }

    if (data.patterns.location.length > 0) {
      recommendations.push(
        `发现你在${data.patterns.location.join('、')}时情绪较为${emotionType}`,
        '可以适当调整活动场所，创造更好的情绪环境'
      );
    }
  }

  return recommendations;
}

// 辅助函数：分析文本内容
async function analyzeContent(content: string) {
  // TODO: 接入OpenAI或其他AI服务进行文本分析
  // 这里先返回模拟数据
  return {
    emotions: [
      { type: '快乐', probability: 0.8 },
      { type: '平静', probability: 0.15 },
      { type: '焦虑', probability: 0.05 }
    ],
    keywords: ['家人', '工作', '成就'],
    summary: '整体情绪积极，主要涉及家庭和工作方面的内容',
    suggestions: [
      '继续保持积极乐观的心态',
      '适当平衡工作与家庭生活'
    ]
  };
}

export default router; 