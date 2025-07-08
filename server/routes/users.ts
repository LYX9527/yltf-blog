import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
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

// 获取所有用户 (管理员)
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 获取当前用户的评论
router.get('/comments', authenticate, async (req: AuthRequest, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        authorId: req.user?.id
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ comments });
  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json({ error: '获取评论失败' });
  }
});

// 更新用户个人信息
router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const { username, email, name, avatar, bio } = req.body;

    // 检查用户名和邮箱是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ],
        NOT: {
          id: req.user?.id
        }
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.username === username ? '用户名已存在' : '邮箱已存在' 
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: req.user?.id
      },
      data: {
        username,
        email,
        name,
        avatar,
        bio
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true
      }
    });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: '更新个人信息失败' });
  }
});

// 修改密码
router.put('/password', authenticate, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: '请提供当前密码和新密码' });
    }

    // 获取当前用户
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id }
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 验证当前密码
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: '当前密码错误' });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await prisma.user.update({
      where: { id: req.user?.id },
      data: { password: hashedPassword }
    });

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: '修改密码失败' });
  }
});

export default router;
