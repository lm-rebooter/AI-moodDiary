import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import diaryRoutes from './routes/diaryRoutes';
import settingsRoutes from './routes/settingsRoutes';
import aiRoutes from './routes/aiRoutes';

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/diaries', diaryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 404处理
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: '未找到请求的资源' });
});

export default app; 