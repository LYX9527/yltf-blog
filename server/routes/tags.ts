import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const tag = await prisma.tag.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tag' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    const tag = await prisma.tag.create({
      data: {
        name,
        slug
      }
    });

    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

export default router;