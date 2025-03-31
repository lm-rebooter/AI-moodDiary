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

// 创建存储登录尝试次数的 Map
const loginAttempts = new Map();

// 添加登录频率限制
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10, // 增加到10次尝试
  message: { 
    error: '登录尝试次数已达上限。为了账户安全，请等待15分钟后再试。如需立即解除限制，请联系管理员或发送邮件至support@example.com' 
  },
  keyGenerator: (req) => {
    // 使用 IP + 邮箱组合作为限制键，这样可以针对具体账户
    return `${req.ip}-${req.body.username}`;
  },
  handler: (req, res) => {
    const email = req.body.username;
    const key = `${req.ip}-${email}`;
    const attempts = loginAttempts.get(key) || 0;
    loginAttempts.set(key, attempts + 1);
    
    res.status(429).json({ 
      error: '登录尝试次数已达上限',
      message: '为了保护您的账户安全，系统已临时限制登录。请15分钟后再试，或联系管理员解除限制。',
      remainingTime: Math.ceil((15 * 60) - (Date.now() % (15 * 60 * 1000)) / 1000),
      attempts: attempts + 1,
      maxAttempts: 10
    });
  }
});

// 重置登录限制的管理员路由
router.post('/reset-login-limit', authenticateToken, async (req: Request & { user?: { userId: number } }, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { email: true }
    });

    // 检查是否是管理员（这里简单判断，实际应该有更完善的权限系统）
    if (user?.email !== 'admin@example.com') {
      return res.status(403).json({ error: '没有权限执行此操作' });
    }

    // 重置指定邮箱的所有限制记录
    for (const [key, value] of loginAttempts.entries()) {
      if (key.includes(email)) {
        loginAttempts.delete(key);
      }
    }

    res.json({ 
      message: `已重置 ${email} 的登录限制`,
      success: true 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || '重置登录限制失败' });
  }
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
    const { username: email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: '请提供邮箱和密码',
        message: '登录需要提供有效的邮箱地址和密码'
      });
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        settings: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        error: '用户不存在',
        message: '未找到与该邮箱关联的账户，请检查邮箱是否正确或注册新账户'
      });
    }

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      const key = `${req.ip}-${email}`;
      const attempts = (loginAttempts.get(key) || 0) + 1;
      loginAttempts.set(key, attempts);

      return res.status(401).json({ 
        error: '密码错误',
        message: '密码不正确，请重试。',
        attempts,
        maxAttempts: 10,
        remainingAttempts: 10 - attempts
      });
    }

    // 登录成功，清除该账户的尝试记录
    const key = `${req.ip}-${email}`;
    loginAttempts.delete(key);

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

    console.log('用户登录成功:', { userId: user.id, email: user.email }); // 添加日志

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

// 临时路由：查看用户列表（仅用于开发环境）
router.get('/users', async (req: Request, res: Response) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: '该接口仅在开发环境可用' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        settings: {
          select: {
            theme: true,
            language: true,
            reminderEnabled: true
          }
        }
      }
    });

    res.json({
      total: users.length,
      users: users.map(user => ({
        ...user,
        password: undefined // 确保不返回密码
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || '获取用户列表失败' });
  }
});

// 临时路由：查看指定用户的登录限制状态
router.get('/login-attempts/:email', async (req: Request, res: Response) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: '该接口仅在开发环境可用' });
    }

    const { email } = req.params;
    const attempts = Array.from(loginAttempts.entries())
      .filter(([key]) => key.includes(email))
      .map(([key, value]) => ({
        key,
        attempts: value,
        remainingAttempts: 10 - value
      }));

    res.json({
      email,
      loginAttempts: attempts,
      isLocked: attempts.some(a => a.attempts >= 10),
      totalAttempts: attempts.reduce((sum, a) => sum + a.attempts, 0)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || '获取登录尝试记录失败' });
  }
});

export default router; 