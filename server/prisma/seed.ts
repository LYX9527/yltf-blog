import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      id: 'admin-user',
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      bio: '博客管理员，负责内容审核和网站管理。'
    },
  });

  // 创建普通用户
  const userPassword = await bcrypt.hash('user123', 10);
  
  const normalUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      id: 'demo-user',
      email: 'user@example.com',
      username: 'demo',
      password: userPassword,
      name: 'Demo User',
      role: 'USER',
      bio: '热爱技术的博客作者，分享前端、后端和全栈开发经验。'
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'frontend' },
      update: {},
      create: {
        name: '前端开发',
        slug: 'frontend',
        description: '前端技术分享，包括 React、Vue、JavaScript 等'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'backend' },
      update: {},
      create: {
        name: '后端开发',
        slug: 'backend',
        description: '后端技术分享，包括 Node.js、Python、数据库等'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'fullstack' },
      update: {},
      create: {
        name: '全栈开发',
        slug: 'fullstack',
        description: '全栈技术分享，前后端一体化解决方案'
      }
    })
  ]);

  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'typescript' },
      update: {},
      create: { name: 'TypeScript', slug: 'typescript' }
    }),
    prisma.tag.upsert({
      where: { slug: 'vue' },
      update: {},
      create: { name: 'Vue.js', slug: 'vue' }
    }),
    prisma.tag.upsert({
      where: { slug: 'nodejs' },
      update: {},
      create: { name: 'Node.js', slug: 'nodejs' }
    }),
    prisma.tag.upsert({
      where: { slug: 'prisma' },
      update: {},
      create: { name: 'Prisma', slug: 'prisma' }
    })
  ]);

  const posts = await Promise.all([
    prisma.post.upsert({
      where: { slug: 'modern-blog-with-vue-and-nodejs' },
      update: {},
      create: {
        title: '使用 Vue 3 和 Node.js 构建现代化博客系统',
        slug: 'modern-blog-with-vue-and-nodejs',
        excerpt: '本文介绍如何使用 Vue 3、TypeScript、Node.js 和 Prisma 构建一个功能完整的现代化博客系统。',
        content: `# 使用 Vue 3 和 Node.js 构建现代化博客系统

在这篇文章中，我们将学习如何从零开始构建一个现代化的博客系统。我们将使用以下技术栈：

## 技术栈

- **前端**: Vue 3 + TypeScript + Vite + Tailwind CSS
- **后端**: Node.js + Express + TypeScript
- **数据库**: SQLite + Prisma ORM
- **部署**: 可部署到 Vercel、Netlify 等平台

## 主要功能

1. 文章管理（CRUD）
2. 分类和标签系统
3. 响应式设计
4. 搜索功能
5. 分页加载
6. SEO 优化

## 开始构建

### 1. 项目初始化

首先创建项目结构...`,
        published: true,
        featured: true,
        readTime: 15,
        publishedAt: new Date(),
        authorId: adminUser.id,
        categoryId: categories[2].id,
        tags: {
          create: [
            { tagId: tags[0].id },
            { tagId: tags[1].id },
            { tagId: tags[2].id }
          ]
        }
      }
    }),
    prisma.post.upsert({
      where: { slug: 'typescript-best-practices' },
      update: {},
      create: {
        title: 'TypeScript 最佳实践指南',
        slug: 'typescript-best-practices',
        excerpt: '分享在实际项目中使用 TypeScript 的最佳实践，包括类型定义、配置优化等。',
        content: `# TypeScript 最佳实践指南

TypeScript 为 JavaScript 带来了静态类型检查，让我们的代码更加健壮和可维护...`,
        published: true,
        featured: false,
        readTime: 8,
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        authorId: normalUser.id,
        categoryId: categories[0].id,
        tags: {
          create: [
            { tagId: tags[0].id }
          ]
        }
      }
    }),
    prisma.post.upsert({
      where: { slug: 'getting-started-with-prisma' },
      update: {},
      create: {
        title: 'Prisma ORM 入门指南',
        slug: 'getting-started-with-prisma',
        excerpt: '学习如何使用 Prisma ORM 来管理数据库，包括模型定义、迁移和查询。',
        content: `# Prisma ORM 入门指南

Prisma 是一个现代化的数据库工具包，提供了类型安全的数据库访问...`,
        published: true,
        featured: true,
        readTime: 12,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        authorId: adminUser.id,
        categoryId: categories[1].id,
        tags: {
          create: [
            { tagId: tags[2].id },
            { tagId: tags[3].id }
          ]
        }
      }
    })
  ]);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });