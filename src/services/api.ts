import axios, { AxiosResponse } from 'axios';
import request from '../utils/request';

const baseURL = 'http://localhost:3000/api';

// 移除重复的 axios 实例创建，直接使用 request
const api = request;

interface CreateDiaryDTO {
  content: string;
  weather?: string;
  location?: string;
  emotions: Array<{
    type: string;
    intensity: number;
    tags: string[];
  }>;
}

interface UpdateDiaryDTO extends Partial<CreateDiaryDTO> {
  id: number;
}

export const diaryApi = {
  getAll: () => api.get('/diaries'),
  getById: (id: number) => api.get(`/diaries/${id}`),
  create: (data: CreateDiaryDTO) => api.post('/diaries', data),
  update: (id: number, data: UpdateDiaryDTO) => api.put(`/diaries/${id}`, data),
  delete: (id: number) => api.delete(`/diaries/${id}`),
  getStatistics: (params?: { startDate?: string; endDate?: string }) => 
    api.get('/diaries/statistics', { params }),
  getAIAnalysis: () => api.get('/diaries/analysis')
};

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams extends LoginParams {
  email: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export const authService = {
  login: async (data: LoginParams): Promise<AuthResponse> => {
    const response = await request.post('/auth/login', data);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },

  register: async (data: RegisterParams): Promise<AuthResponse> => {
    const response = await request.post('/auth/register', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    return request.get('/auth/me');
  }
};

export const isAuthenticated = (): boolean => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    // 检查用户信息是否存在
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      localStorage.removeItem('token');
      return false;
    }

    return true;
  } catch (error) {
    console.error('认证状态检查失败:', error);
    return false;
  }
};

// Todo 相关 API
export const todoApi = {
  getAll: async () => {
    return api.get('/todos');
  },
  create: async (data: { title: string; description?: string }) => {
    return api.post('/todos', data);
  },
  update: async (id: number, data: { title?: string; description?: string; completed?: boolean }) => {
    return api.put(`/todos/${id}`, data);
  },
  delete: async (id: number) => {
    return api.delete(`/todos/${id}`);
  }
};

// 获取当前用户信息
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}; 