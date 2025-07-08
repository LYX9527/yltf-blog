import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

interface AuthRequest extends express.Request {
  user?: {
    id: string;
    role: string;
    username: string;
    email: string;
  };
}

// 获取系统统计数据 (管理员)
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const [totalPosts, totalUsers, totalComments] = await Promise.all([
      prisma.post.count(),
      prisma.user.count(),
      prisma.comment.count()
    ]);

    res.json({
      totalPosts,
      totalUsers,
      totalComments
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

export default router;