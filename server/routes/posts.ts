import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth';

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

// Slug 生成函数
const generateSlug = (title: string): string => {
  let slug = title
    .toLowerCase()
    .trim()
    // 保留中文、英文、数字和空格
    .replace(/[^\u4e00-\u9fa5a-z0-9\s]/gi, '')
    // 将空格替换为连字符
    .replace(/\s+/g, '-')
    // 移除开头和结尾的连字符
    .replace(/^-+|-+$/g, '');
  
  // 如果 slug 为空，使用时间戳
  if (!slug) {
    slug = `post-${Date.now()}`;
  }
  
  return slug;
};

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, search, published = 'true', date } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (published === 'true') {
      where.published = true;
    }

    if (category) {
      where.category = {
        slug: category
      };
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag
          }
        }
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } }
      ];
    }

    // 添加日期筛选
    if (date) {
      const targetDate = new Date(date as string);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.AND = [
        {
          OR: [
            { publishedAt: { gte: targetDate, lt: nextDay } },
            { 
              AND: [
                { publishedAt: null },
                { createdAt: { gte: targetDate, lt: nextDay } }
              ]
            }
          ]
        }
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          author: {
            select: { id: true, username: true, name: true, avatar: true }
          },
          category: {
            select: { id: true, name: true, slug: true }
          },
          tags: {
            include: {
              tag: {
                select: { id: true, name: true, slug: true }
              }
            }
          },
          _count: {
            select: { likes: true }
          }
        },
        orderBy: { publishedAt: 'desc' }
      }),
      prisma.post.count({ where })
    ]);

    res.json({
      posts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { featured: true, published: true },
      take: 5,
      include: {
        author: {
          select: { id: true, username: true, name: true, avatar: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, slug: true }
            }
          }
        }
      },
      orderBy: { publishedAt: 'desc' }
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch featured posts' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, username: true, name: true, avatar: true, bio: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
        _count: {
          select: { likes: true }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    });

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { title, content, excerpt, categoryId, tagIds, published = false, featured = false, coverImage } = req.body;
    const authorId = req.user!.id;
    
    console.log('Creating post with data:', { title, content: content?.length, excerpt, categoryId, tagIds, published, featured, coverImage, authorId });
    
    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' });
    }
    
    // 生成更安全的 slug
    let slug = generateSlug(title);
    
    // 检查 slug 是否已存在
    const existingPost = await prisma.post.findUnique({
      where: { slug }
    });
    
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    console.log('Generated slug:', slug);

    const postData: any = {
      title,
      slug,
      content,
      excerpt,
      published,
      featured,
      authorId,
      publishedAt: published ? new Date() : null,
    };

    // 只有当 categoryId 存在且不为空时才添加
    if (categoryId && categoryId.trim() !== '') {
      postData.categoryId = categoryId;
    }

    // 只有当 coverImage 存在且不为空时才添加
    if (coverImage && coverImage.trim() !== '') {
      postData.coverImage = coverImage;
    }

    // 添加标签关联
    if (tagIds && tagIds.length > 0) {
      postData.tags = {
        create: tagIds.map((tagId: string) => ({
          tagId
        }))
      };
    }

    console.log('Final post data:', postData);

    const post = await prisma.post.create({
      data: postData,
      include: {
        author: {
          select: { id: true, username: true, name: true, avatar: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, slug: true }
            }
          }
        }
      }
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Failed to create post:', error);
    res.status(500).json({ error: 'Failed to create post', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.put('/:slug', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;
    const { title, content, excerpt, categoryId, tagIds, published, featured, coverImage } = req.body;
    
    console.log('Updating post with data:', { slug, title, content: content?.length, excerpt, categoryId, tagIds, published, featured, coverImage });
    
    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' });
    }
    
    const existingPost = await prisma.post.findUnique({
      where: { slug },
      include: { tags: true }
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // 如果标题改变，生成新的 slug
    let newSlug = slug;
    if (title && title !== existingPost.title) {
      newSlug = generateSlug(title);
      
      // 检查新 slug 是否已存在（除了当前文章）
      const duplicatePost = await prisma.post.findUnique({
        where: { slug: newSlug }
      });
      
      if (duplicatePost && duplicatePost.id !== existingPost.id) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
    }

    console.log('Generated new slug:', newSlug);

    // 删除现有的标签关联
    await prisma.postTag.deleteMany({
      where: { postId: existingPost.id }
    });

    const updateData: any = {
      title,
      slug: newSlug,
      content,
      excerpt,
      published: Boolean(published),
      featured: Boolean(featured),
      publishedAt: published && !existingPost.published ? new Date() : existingPost.publishedAt,
    };

    // 只有当 categoryId 存在且不为空时才添加
    if (categoryId && categoryId.trim() !== '') {
      updateData.categoryId = categoryId;
    } else {
      updateData.categoryId = null;
    }

    // 只有当 coverImage 存在且不为空时才添加
    if (coverImage && coverImage.trim() !== '') {
      updateData.coverImage = coverImage;
    } else {
      updateData.coverImage = null;
    }

    // 添加标签关联
    if (tagIds && tagIds.length > 0) {
      updateData.tags = {
        create: tagIds.map((tagId: string) => ({
          tagId
        }))
      };
    }

    console.log('Final update data:', updateData);

    const updatedPost = await prisma.post.update({
      where: { slug },
      data: updateData,
      include: {
        author: {
          select: { id: true, username: true, name: true, avatar: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, slug: true }
            }
          }
        }
      }
    });

    res.json(updatedPost);
  } catch (error) {
    console.error('Failed to update post:', error);
    res.status(500).json({ error: 'Failed to update post', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.delete('/:slug', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;

    const post = await prisma.post.findUnique({
      where: { slug }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await prisma.post.delete({
      where: { slug }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;