import type { MoodData, EmotionTrend, AISuggestion, CreateDiaryParams, DiaryResponse } from '../types/mood';
import request from '../utils/request';

export const moodService = {
  // 获取今日心情
  getTodayMood: async (): Promise<MoodData> => {
    try {
      const response = await request.get('/diaries/today');
      return response.data;
    } catch (error: any) {
      console.error('获取今日心情失败:', error);
      throw new Error(error.response?.data?.error || '获取今日心情失败');
    }
  },

  // 获取情绪趋势
  getEmotionTrend: async (days: number = 7): Promise<EmotionTrend> => {
    try {
      const response = await request.get('/diaries/trend', {
        params: { days }
      });
      return response.data;
    } catch (error: any) {
      console.error('获取情绪趋势失败:', error);
      throw new Error(error.response?.data?.error || '获取情绪趋势失败');
    }
  },

  // 获取 AI 建议
  getAISuggestion: async (): Promise<AISuggestion> => {
    try {
      const response = await request.get('/diaries/suggestion');
      return response.data;
    } catch (error: any) {
      console.error('获取 AI 建议失败:', error);
      throw new Error(error.response?.data?.error || '获取 AI 建议失败');
    }
  },

  // 创建日记
  createDiary: async (data: CreateDiaryParams): Promise<DiaryResponse> => {
    try {
      const response = await request.post('/diaries', {
        content: data.content,
        weather: data.weather || '',
        location: data.location || '',
        tags: data.tags || [],
        imageUrls: data.imageUrls || [],
        emotion: {
          type: data.emotion.type,
          intensity: data.emotion.intensity,
          tags: data.emotion.tags || []
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('创建日记失败:', error);
      throw new Error(error.response?.data?.error || '创建日记失败');
    }
  }
}; 