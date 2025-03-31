import axios, { AxiosResponse } from 'axios';

const baseURL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

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
  getStatistics: () => api.get('/diaries/statistics'),
  getAIAnalysis: (id: number) => api.get(`/diaries/${id}/analysis`)
};

interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name?: string;
  };
}

// 用户相关 API
export const userApi = {
  register: async (data: { email: string; password: string; name?: string }) => {
    const response = await api.post('/auth/register', data);
    return response as AuthResponse;
  },
  login: async (credentials: { email: string; password: string }) => {
    try {
      const data = await api.post('/auth/login', credentials) as AuthResponse;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
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

// 检查是否已登录
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
}; 