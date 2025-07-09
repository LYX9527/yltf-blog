import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

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

// 切换点赞状态
router.post('/toggle/:postId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user!.id;

    // 检查文章是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 检查是否已经点赞
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    let isLiked: boolean;
    let newLikeCount: number;

    if (existingLike) {
      // 如果已点赞，则取消点赞
      await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      });

      // 更新文章点赞数
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: { 
          likeCount: {
            decrement: 1
          }
        }
      });

      isLiked = false;
      newLikeCount = updatedPost.likeCount;
    } else {
      // 如果未点赞，则添加点赞
      await prisma.like.create({
        data: {
          userId,
          postId
        }
      });

      // 更新文章点赞数
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: { 
          likeCount: {
            increment: 1
          }
        }
      });

      isLiked = true;
      newLikeCount = updatedPost.likeCount;
    }

    res.json({
      success: true,
      isLiked,
      likeCount: newLikeCount
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: '操作失败' });
  }
});

// 获取用户对文章的点赞状态
router.get('/status/:postId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user!.id;

    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    res.json({
      isLiked: !!like
    });

  } catch (error) {
    console.error('Get like status error:', error);
    res.status(500).json({ error: '获取点赞状态失败' });
  }
});

export default router;