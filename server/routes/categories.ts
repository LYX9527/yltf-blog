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

// Slug 生成函数
const generateSlug = (name: string): string => {
  let slug = name
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
    slug = `category-${Date.now()}`;
  }
  
  return slug;
};

// 获取所有分类 (公开访问)
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// 获取单个分类 (公开访问)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Failed to fetch category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// 创建分类 (需要管理员权限)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: '分类名称不能为空' });
    }

    // 生成 slug
    let slug = generateSlug(name);

    // 检查 slug 是否已存在
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      slug = `${slug}-${Date.now()}`;
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null
      },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Failed to create category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// 更新分类 (需要管理员权限)
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: '分类名称不能为空' });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // 如果名称改变，生成新的 slug
    let newSlug = existingCategory.slug;
    if (name.trim() !== existingCategory.name) {
      newSlug = generateSlug(name);
      
      // 检查新 slug 是否已存在（除了当前分类）
      const duplicateCategory = await prisma.category.findUnique({
        where: { slug: newSlug }
      });
      
      if (duplicateCategory && duplicateCategory.id !== id) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: newSlug,
        description: description?.trim() || null
      },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    res.json(updatedCategory);
  } catch (error) {
    console.error('Failed to update category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// 删除分类 (需要管理员权限)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // 检查是否有文章使用此分类
    if (category._count.posts > 0) {
      return res.status(400).json({ 
        error: `无法删除分类，还有 ${category._count.posts} 篇文章使用此分类` 
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Failed to delete category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;