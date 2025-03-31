import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt';

interface AuthRequest extends Request {
  user?: {
    userId: number;
    email?: string;
    name?: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: '未提供认证令牌',
      message: '请提供有效的认证令牌'
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ 
      error: '令牌格式错误',
      message: '认证令牌格式不正确'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as { 
      userId: number;
      email?: string;
      name?: string;
    };
    
    // 确保 userId 是数字类型
    req.user = {
      userId: Number(decoded.userId),
      email: decoded.email,
      name: decoded.name
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: '认证令牌已过期',
        message: '您的登录已过期，请重新登录'
      });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ 
        error: '无效的认证令牌',
        message: '认证令牌无效，请重新登录'
      });
    }
    return res.status(500).json({ 
      error: '认证过程发生错误',
      message: '服务器处理认证时发生错误'
    });
  }
}; 