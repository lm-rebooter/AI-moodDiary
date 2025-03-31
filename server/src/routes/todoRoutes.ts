import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// 获取用户的所有待办事项
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const todos = await prisma.todo.findMany({
      where: {
        userId: req.user.userId
      }
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: '获取待办事项失败' });
  }
});

// 创建新的待办事项
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const { title, description } = req.body;
    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        userId: req.user.userId
      }
    });
    res.json(todo);
  } catch (error) {
    res.status(400).json({ error: '创建待办事项失败' });
  }
});

// 更新待办事项
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    
    const todo = await prisma.todo.update({
      where: {
        id: parseInt(id),
        userId: req.user.userId
      },
      data: {
        title,
        description,
        completed
      }
    });
    res.json(todo);
  } catch (error) {
    res.status(400).json({ error: '更新待办事项失败' });
  }
});

// 删除待办事项
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    await prisma.todo.delete({
      where: {
        id: parseInt(id),
        userId: req.user.userId
      }
    });
    res.json({ message: '待办事项已删除' });
  } catch (error) {
    res.status(400).json({ error: '删除待办事项失败' });
  }
});

export default router; 