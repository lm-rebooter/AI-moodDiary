import express from 'express';
import { moodController } from '../controllers/moodController';

const router = express.Router();

// 获取今日心情
router.get('/today', moodController.getTodayMood);

// 获取情绪趋势
router.get('/trend', moodController.getEmotionTrend);

// 获取 AI 建议
router.get('/suggestion', moodController.getAISuggestion);

// 创建日记
router.post('/diary', moodController.createDiary);

export default router;