import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth';
import { commentRateLimit, getIPCommentStats } from '../middleware/rateLimit';

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

// 获取所有评论 (管理员)
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        },
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
    console.error('Get all comments error:', error);
    res.status(500).json({ error: '获取评论失败' });
  }
});

// 获取文章的评论
router.get('/post/:postId', async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!post) {
      return res.status(404).json({ error: '文章不存在' });
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId: post.id,
        parentId: null // 只获取顶级评论
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(comments);
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    res.status(500).json({ error: '获取评论失败' });
  }
});

// 创建评论
router.post('/post/:postId', optionalAuth, commentRateLimit, async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params;
    const { content, parentId, guestName, guestEmail } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: '评论内容不能为空' });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!post) {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 如果是回复，检查父评论是否存在
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      });

      if (!parentComment || parentComment.postId !== post.id) {
        return res.status(400).json({ error: '父评论不存在' });
      }
    }

    // 如果用户未登录，需要提供游客信息
    if (!req.user) {
      if (!guestName || !guestEmail) {
        return res.status(400).json({ error: '游客评论需要提供姓名和邮箱' });
      }

      // 简单的邮箱验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail)) {
        return res.status(400).json({ error: '邮箱格式无效' });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId: post.id,
        parentId: parentId || null,
        authorId: req.user?.id || null,
        guestName: req.user ? null : guestName,
        guestEmail: req.user ? null : guestEmail
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Failed to create comment:', error);
    res.status(500).json({ error: '创建评论失败' });
  }
});

// 删除评论（仅作者或管理员可删除）
router.delete('/:commentId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { commentId } = req.params;
    const user = req.user!;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        author: true
      }
    });

    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }

    // 检查权限：只有评论作者或管理员可以删除
    if (comment.authorId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: '没有权限删除此评论' });
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    res.json({ message: '评论删除成功' });
  } catch (error) {
    console.error('Failed to delete comment:', error);
    res.status(500).json({ error: '删除评论失败' });
  }
});

// 获取IP评论状态（调试用）
router.get('/rate-limit-status', getIPCommentStats);

export default router;