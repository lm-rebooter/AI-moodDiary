import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';

// 添加登录频率限制
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 限制5次尝试
  message: { error: '尝试次数过多，请15分钟后再试' }
});

// 注册
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // 验证邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        settings: {
          create: {
            reminderEnabled: false,
            privacyLevel: 0,
            theme: 'light',
            language: 'zh-CN'
          }
        }
      }
    });

    // 生成JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || '注册失败' });
  }
});

// 登录
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        settings: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: '密码错误' });
    }

    // 生成访问令牌
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 生成刷新令牌
    const refreshToken = jwt.sign(
      { userId: user.id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // 保存刷新令牌
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    // 设置刷新令牌为 HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        settings: user.settings
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || '登录失败' });
  }
});

// 刷新令牌
router.post('/refresh-token', async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: '未提供刷新令牌' });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { userId: number };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { settings: true }
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: '无效的刷新令牌' });
    }

    const newToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: '刷新令牌已过期' });
  }
});

// 获取当前用户信息
router.get('/me', authenticateToken, async (req: Request & { user?: { userId: number } }, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        settings: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message || '获取用户信息失败' });
  }
});

// 更新用户信息
router.put('/me', authenticateToken, async (req: Request & { user?: { userId: number } }, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        avatar
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true
      }
    });

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message || '更新用户信息失败' });
  }
});

export default router; 